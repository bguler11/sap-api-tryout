# SAP API Try-Out — Mimari Dokümantasyonu

## Genel Bakış

SAP API Try-Out, SAP S/4HANA Cloud sistemlerine bağlanarak OData API'lerini tarayıcı üzerinden test etmeyi sağlayan bir web uygulamasıdır. Backend Node.js/Express, frontend React/TypeScript olarak yazılmıştır. Veritabanı olarak `sql.js` (SQLite) kullanılır ve tek bir dosyaya (`data/tryout.db`) yazılır.

---

## Dizin Yapısı

```
ntt-api-explorer/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Uygulama giriş noktası
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts    # JWT doğrulama
│   │   ├── routes/
│   │   │   ├── auth.ts               # Kullanıcı giriş/kayıt
│   │   │   ├── environments.ts       # Ortam CRUD
│   │   │   ├── environmentApis.ts    # API kayıtları + spec yükleme
│   │   │   ├── proxy.ts              # SAP'a istek proxyleme
│   │   │   ├── commScenarioMap.ts    # Scenario mapping CRUD
│   │   │   ├── sapApis.ts            # SAP erişim kontrol
│   │   │   ├── variants.ts           # Varyant kaydet/listele
│   │   │   └── history.ts            # İstek geçmişi
│   │   └── services/
│   │       ├── db.service.ts         # Tüm DB işlemleri
│   │       ├── arrangement.service.ts# Communication Arrangement kontrol
│   │       ├── metadata.service.ts   # OData $metadata parse + OpenAPI üretimi
│   │       ├── sapCatalog.service.ts # SAP API Hub catalog entegrasyonu
│   │       ├── commScenarioMap.ts    # Statik servis→scenario mapping + getCommScenario()
│   │       ├── scenarioDescriptions.ts # SAP_COM_XXXX → açıklama statik map
│   │       └── encryption.service.ts # AES-256 şifreleme
│   └── data/
│       └── tryout.db                 # SQLite veritabanı (sql.js formatı)
└── frontend/
    └── src/
        ├── App.tsx                   # Ana state yönetimi
        ├── types.ts                  # TypeScript arayüzleri
        ├── services/
        │   └── api.ts                # Backend API çağrıları
        └── components/
            ├── Sidebar/              # Ortam + API listesi, butonlar
            ├── TryOutPanel/          # Parametre girişi + istek gönderme
            ├── ApiCatalogPanel/      # Endpoint listesi
            ├── AddApiModal/          # Yeni API ekleme
            ├── EnvironmentModal/     # Ortam ekleme/düzenleme
            ├── SpecUploadModal/      # OpenAPI spec yapıştırma modalı
            ├── CommScenarioPage/     # Scenario mapping yönetimi
            ├── History/              # İstek geçmişi
            └── LoginPage/            # Giriş ekranı
```

---

## Backend

### `src/index.ts` — Başlangıç Noktası

Uygulamayı ayağa kaldırır. Sırasıyla:
1. `initDb()` — SQLite tabloları oluşturur
2. `seedCommScenarios(COMM_SCENARIO_MAP)` — Statik mapping'i DB'ye ilk kez yazar (var olanların üzerine yazmaz)
3. `preloadCatalog()` — SAP API Hub'dan API listesini memory'e çeker (arka planda)

**Dikkat:** `ALLOWED_ORIGIN` env değişkeni tanımlı değilse sadece `localhost:5173` isteklerine izin verilir.

---

### `src/middleware/auth.middleware.ts` — JWT Doğrulama

Tüm route'lar (auth hariç) bu middleware'den geçer. `Authorization: Bearer <token>` header'ını doğrular ve `req.userId` ile `req.userEmail`'i set eder.

**Manuel müdahale:** `JWT_SECRET` env değişkeni set edilmezse varsayılan `'ntt-api-explorer-secret'` kullanılır — production'da mutlaka değiştirilmeli.

---

### `src/services/db.service.ts` — Veritabanı

Tüm DB okuma/yazma işlemleri buradan geçer. `sql.js` kullanıldığından her yazma işleminde `saveDb()` çağrılır ve SQLite dosyası diske tekrar yazılır.

**Tablolar:**

| Tablo | Açıklama |
|-------|----------|
| `users` | Kullanıcı hesapları |
| `environments` | SAP sistem bağlantıları (şifreli) |
| `environment_apis` | Ortama eklenmiş API kayıtları + spec cache |
| `comm_scenario_map` | `service_name → scenario_id` mapping |
| `user_variants` | Kullanıcıya özel kayıtlı istek parametreleri |
| `global_variants` | Ortama ait paylaşımlı istek parametreleri |
| `request_history` | Gönderilen isteklerin geçmişi |

**Önemli fonksiyonlar:**

- `updateEnvironmentApiSpec(id, jsonString)` — Spec'i `spec_cache` kolonuna yazar, `spec_cached_at` güncellenir
- `updateEnvironmentApiArrangement(id, status)` — `'ok' | 'failed' | 'pending'` değerlerinden birini yazar
- `upsertCommScenarioBulk(entries)` — `comm_scenario_map`'e toplu upsert yapar
- `seedCommScenarios(map)` — Sadece DB'de olmayan kayıtları ekler (var olanların üzerine yazmaz)
- `getEnvironmentApis()` — `spec_cache` kolonunu **döndürmez** (büyük veri, sidebar için hafif liste)
- `getEnvironmentApiById()` — `spec_cache` dahil tüm kolonları döndürür

---

### `src/services/encryption.service.ts` — Şifreleme

SAP sistem şifreleri DB'ye düz metin olarak yazılmaz. AES-256-CBC ile şifrelenir.

**Manuel müdahale:** `ENCRYPTION_KEY` env değişkeni 32+ karakter olmalı. Değiştirilirse mevcut şifreli veriler çözülemez hale gelir — tüm environment'ların şifrelerini tekrar girmek gerekir.

---

### `src/services/commScenarioMap.ts` — Statik Scenario Mapping

`COMM_SCENARIO_MAP` sabiti `service_name → SAP_COM_XXXX` eşleştirmelerini içerir. Bu statik tablo seed verisi olarak kullanılır; DB'ye `seedCommScenarios()` aracılığıyla ilk yüklemede yazılır.

**`getCommScenario(serviceName)`** fonksiyonu şu sırayla arar:
1. DB'deki `comm_scenario_map` tablosu (en güncel, spec upload ile güncellenir)
2. Statik `COMM_SCENARIO_MAP` sabiti
3. Suffix'i temizlenmiş isimle yeniden arama (örn. `API_SALES_ORDER_SRV_0001` → `API_SALES_ORDER_SRV`)

**Manuel müdahale — Yeni API için mapping eklemek:**
- **Önerilen yol:** Frontend'deki `···` → CommScenario sayfasından ekle (DB'ye yazar)
- **Alternatif:** `COMM_SCENARIO_MAP`'e satır ekle + backend'i yeniden başlat (seed çalışır)
- **Otomatik yol:** `↑` ile doğru SAP API Hub spec'i yükle; spec'teki `x-sap-ext-overview[Communication Scenario]` alanı otomatik okunur

---

### `src/services/scenarioDescriptions.ts` — Scenario Açıklamaları

`SAP_COM_XXXX → "Finance - Posting Integration"` formatında 477 girişten oluşan statik map. CommScenario sayfasında tablo sütununda görüntülenir.

**Manuel müdahale:** Yeni bir `SAP_COM_XXXX` kodu için açıklama eklemek istersen bu dosyaya satır ekle.

---

### `src/services/sapCatalog.service.ts` — SAP API Hub Entegrasyonu

SAP API Hub (`api.sap.com`) OData catalog endpoint'inden API listesini çeker ve memory'de cache'ler (TTL: 1 saat).

**Env değişkeni:** `SAP_API_KEY` — SAP API Hub'dan alınan API key. Tanımlı değilse catalog çağrıları başarısız olur.

**Fonksiyonlar:**

| Fonksiyon | Açıklama |
|-----------|----------|
| `preloadCatalog()` | Startup'ta arka planda tüm API listesini çeker |
| `searchSapCatalog(query)` | API arama (AddApiModal'da kullanılır) |
| `getApiDetail(apiName)` | Belirli API'nin sandbox URL ve service URL bilgisini döndürür |
| `getCatalogTitleMap()` | `name → title` map'i (CommScenario sayfası için) |

**Önemli:** `getApiDetail` sonucu `detailCache`'e alınır. Backend yeniden başlatılmadan eski cache kullanılır.

---

### `src/services/metadata.service.ts` — OData Metadata Parse

`fetchAndParseMetadata(serviceName, cachedSpec?)` fonksiyonu:

1. **`cachedSpec` varsa:** SAP'a hiç gitmeden cache'i direkt döndürür → spec_cache'ten beslenen akış budur
2. **`cachedSpec` yoksa:** SAP API Hub sandbox'tan `$metadata` XML'ini çeker, parse eder, OpenAPI 3.0 objesi üretir

**OData V2 (`buildV2OpenApi`):** `sap:creatable`, `sap:updatable`, `sap:deletable` attribute'larını okur → entity set başına doğru HTTP metodlar üretilir.

**OData V4 (`buildV4OpenApi`):** Tüm entity set'lerde `creatable/updatable/deletable` hardcode `true` olarak ayarlanır — V4 annotation'ları henüz parse edilmemektedir. Bu nedenle V4 API'ler için doğru spec'i `↑` butonu ile yüklemek önerilir.

**Üretilen OpenAPI objesi formatı:**
```json
{
  "openapi": "3.0.0",
  "info": { "title": "API_SALES_ORDER_SRV", "version": "1.0.0" },
  "x-sap-comm-scenario": "SAP_COM_0109",
  "paths": { "/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder": { ... } }
}
```

**Dikkat:** `$metadata` XML parse'ından üretilen spec'lerde path'ler service URL prefix'i içerir (örn. `/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder`). SAP API Hub'dan indirilen spec'lerde ise path'ler kısa gelir (örn. `/A_SalesOrder`) — proxy bu farkı `service_url` bilgisi ile telafi eder.

---

### `src/services/arrangement.service.ts` — Communication Arrangement Kontrolü

SAP sistemindeki mevcut Communication Arrangement'ları OData V4 endpoint'i üzerinden listeler ve belirli bir servis için arrangement var mı kontrol eder.

**Endpoint:** `/sap/opu/odata4/sap/aps_com_ca_a4c_odata/srvd_a2x/sap/aps_com_ca_a4c_odata/0001/CommunicationArrangements`

**`checkArrangement()` dönüş değerleri:**

| Alan | Anlam |
|------|-------|
| `exists: true` | Arrangement mevcut, erişim açık |
| `exists: false, checkable: true` | Arrangement yok, kurulması gerekiyor |
| `checkable: false` | SAP endpoint'ine erişilemedi (401/403 veya timeout) |
| `noMapping: true` | `comm_scenario_map`'te bu servis için kayıt yok |

**`ensureArrangement()`** — Arrangement oluşturmayı dener. Mevcut sistemde arrangement API üzerinden otomatik oluşturma yapılmamaktadır; durum `'ok'` veya `'failed'` olarak döner.

---

### `src/routes/proxy.ts` — SAP Proxy

Frontend'den gelen istekleri SAP sistemine iletir.

**Path çözümleme:**
- `path` `/sap/` ile başlamıyorsa (kısa Hub spec path'i): `apiId` parametresinden `service_url` DB'den okunur ve path'e prefix eklenir
- Örnek: `/A_SalesOrder` + `service_url=/sap/opu/odata/sap/API_SALES_ORDER_SRV` → `/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder`

**CSRF token:**
POST/PUT/PATCH/DELETE isteklerinde önce `/$metadata` endpoint'ine GET atılarak `x-csrf-token` ve `Cookie` alınır, asıl isteğe eklenir.

**SOAP desteği:** Path `/sap/bc/srt/` içeriyorsa veya `Content-Type: text/xml` header'ı varsa SOAP modu devreye girer.

---

### `src/routes/environmentApis.ts` — API Kayıt Yönetimi

**`POST /api/environment-apis`** — Yeni API ekle:
1. SAP Catalog'dan servis bilgisini çek
2. Gerçek SAP sisteminde `$metadata` endpoint'ine erişim testi yap
3. DB'ye kaydet
4. Arrangement kontrolü yap

**`POST /api/environment-apis/:id/spec`** — Spec yükle (↑ butonu):
1. Gelen OpenAPI JSON'u al
2. `x-sap-comm-scenario` alanını kontrol et
3. Yoksa `x-sap-ext-overview[Communication Scenario]` içinde `(SAP_COM_XXXX)` pattern'ını ara
4. Hâlâ yoksa SAP Catalog'dan çek
5. Spec'e `x-sap-comm-scenario` ekle ve `spec_cache`'e yaz
6. `comm_scenario_map`'i güncelle

**`POST /api/environment-apis/:id/refresh`** — Spec yenile:
- `spec_cache` doluysa: cache'i kullanır (SAP'a gitmez), `comm_scenario_map`'i günceller
- `spec_cache` boşsa: `$metadata` XML'den yeniden üretir

**`POST /api/environment-apis/check-arrangements`** — Tüm API'ler için arrangement durumunu kontrol eder ve DB'yi günceller.

---

### `src/routes/commScenarioMap.ts` — Scenario Mapping API

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/comm-scenario-map` | Tüm mapping'leri listeler, catalog title ve scenario açıklaması ekler |
| `POST /api/comm-scenario-map/bulk` | Toplu upsert (CommScenario sayfasından) |
| `DELETE /api/comm-scenario-map/:serviceName` | Tek kayıt siler |

---

## Frontend

### `src/App.tsx` — Ana State

Tüm uygulama state'i burada tutulur. Önemli state'ler:

| State | Açıklama |
|-------|----------|
| `environments` | Kullanıcının ortam listesi |
| `apis` | Seçili ortamdaki API'ler |
| `arrangementMap` | Her API için arrangement durumu (Sidebar'da gösterilir) |
| `apiAccessMap` | Her API için erişim kontrolü sonuçları |
| `specUploadApiId` | `SpecUploadModal`'ı hangi API için açacağını belirler |

**`handleSelectApi()`** — API seçildiğinde `GET /api/environment-apis/:id/spec` çağrılır ve spec parse edilip endpoint listesi oluşturulur.

---

### `src/services/api.ts` — Backend İstemcisi

Tüm backend API çağrıları bu dosyadan yapılır. `Bearer` token `localStorage`'dan otomatik eklenir.

**`proxyApi.execute()`** — `apiId` parametresi de gönderilir; backend path prefix'ini buna göre çözer.

---

### `src/components/Sidebar/Sidebar.tsx`

**Arrangement göstergesi:** Her API satırında `arrangementMap[api.id]` değerine göre:
- `●` (sarı) — Arrangement yok, `{arrScenario} gerekli` yazar
- `⚠️` (kırmızı) — Arrangement başarısız
- `?` — `comm_scenario_map`'te kayıt yok

**Butonlar (hover'da görünür):**
- `🔗` — `ensureArrangement` çağırır
- `↑` — `SpecUploadModal` açar
- `↻` — `refresh` endpoint'ini çağırır
- `×` — API kaydını siler

---

### `src/components/SpecUploadModal/SpecUploadModal.tsx`

SAP API Hub'dan indirilen OpenAPI JSON spec'ini metin olarak yapıştırmak için kullanılır. `POST /api/environment-apis/:id/spec` endpoint'ine gönderir.

**Ne zaman kullanılır:**
- Yeni bir API eklendiğinde spec otomatik üretildiyse ama endpoint listesi yanlışsa
- V4 API'de tüm metodlar doğru görünmüyorsa
- SAP API Hub'daki gerçek spec ile senkronize etmek için

---

### `src/components/CommScenarioPage/CommScenarioPage.tsx`

`service_name → SAP_COM_XXXX` mapping'ini yönetir. Yanlış mapping'i düzeltmek veya yeni eklemek için kullanılır.

**Manuel mapping eklemek:**
1. `···` butonuna tıkla (Sidebar alt köşesi)
2. `+ Ekle` ile yeni satır ekle
3. `Kaydet`

Kaydedilen mapping DB'ye yazılır ve bir sonraki arrangement kontrolünde kullanılır.

---

### `src/components/TryOutPanel/TryOutPanel.tsx`

Seçili endpoint için parametre girişi ve istek gönderme paneli.

- **Path parametreleri:** `{SalesOrder}` gibi değişkenler otomatik tespit edilir
- **Query parametreleri:** `$top`, `$filter` gibi OData parametreleri
- **Request body:** JSON veya XML (SOAP) olarak girilebilir
- **Varyantlar:** Doldurulmuş parametreler kaydedilebilir (kişisel veya global)

---

## Veri Akışı

### API Ekleme Akışı

```
Kullanıcı → AddApiModal → POST /api/environment-apis
  → SAP Catalog'dan servis bilgisi al
  → SAP sisteminde $metadata testi
  → DB'ye kaydet
  → Arrangement kontrol et
  → Frontend'e dön
```

### Spec Yükleme Akışı (↑ butonu)

```
Kullanıcı spec yapıştırır → POST /api/environment-apis/:id/spec
  → x-sap-comm-scenario oku
  → Yoksa x-sap-ext-overview parse et → SAP_COM_XXXX çıkar
  → Yoksa SAP Catalog'dan çek
  → spec_cache'e yaz
  → comm_scenario_map güncelle
```

### İstek Gönderme Akışı

```
Kullanıcı → TryOutPanel → POST /api/proxy
  → apiId ile service_url DB'den oku
  → Path kısaysa service_url prefix ekle
  → Mutating istek için CSRF token al
  → SAP sistemine ilet
  → Response'u döndür + geçmişe kaydet
```

### Arrangement Kontrol Akışı

```
Ortam seçildiğinde → POST /api/environment-apis/check-arrangements
  → Her API için getCommScenario() → SAP_COM_XXXX
  → SAP OData V4 → CommunicationArrangements listesi
  → Karşılaştır → exists: true/false
  → DB'de arrangement_status güncelle
  → Frontend arrangementMap'i güncelle → Sidebar göstergesi
```

---

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `SAP_API_KEY` | Evet | SAP API Hub API key |
| `JWT_SECRET` | Hayır | JWT imzalama anahtarı (varsayılan güvensiz) |
| `ENCRYPTION_KEY` | Hayır | Şifre şifreleme anahtarı (varsayılan güvensiz) |
| `ALLOWED_ORIGIN` | Hayır | Ek CORS origin |
| `PORT` | Hayır | Backend port (varsayılan: 3001) |

---

## Sık Yapılan Manuel Müdahaleler

### Yanlış scenario mapping'i düzeltmek
1. Frontend → `···` → CommScenario sayfası → ilgili satırı düzenle
2. Kaydet → arrangement kontrolü otomatik güncellenir

### Yeni API için doğru endpoint listesi almak
1. SAP API Hub'dan API'nin OpenAPI JSON spec'ini indir
2. Sidebar'da ilgili API'ye hover → `↑` butonuna tıkla
3. JSON'u yapıştır → Kaydet
4. Spec yüklenince `comm_scenario_map` otomatik güncellenir

### DB'yi sıfırlamak
`backend/data/tryout.db` dosyasını sil → backend yeniden başlatınca sıfır DB oluşur.

### Yeni statik mapping eklemek (toplu)
`backend/src/services/commScenarioMap.ts` → `COMM_SCENARIO_MAP`'e satır ekle → backend yeniden başlat → `seedCommScenarios` sadece DB'de olmayan kayıtları ekler.
