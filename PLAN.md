# SAP API Try-Out — Proje Durumu ve Yol Haritası

## Genel Bakış

SAP S/4HANA Cloud sistemlerindeki API'leri tarayıcı üzerinden test etmeye yarayan araç.  
Kullanıcı bazlı auth, ortam yönetimi, varyant sistemi ve SOAP desteği içerir.

---

## Teknik Stack

| Katman | Teknoloji |
|---|---|
| Backend | Node.js + Express + TypeScript |
| DB | sql.js (pure-JS SQLite, native build gerektirmez) |
| Şifreleme | AES-256 (ortam şifresi için) |
| Auth | JWT (7 gün) + bcryptjs |
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Deploy | Railway (backend + frontend ayrı servis) |

---

## Proje Yapısı

```
sap-api-tryout/
├── backend/
│   ├── src/
│   │   ├── index.ts                        # Express app, route tanımları
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts           # JWT doğrulama, AuthRequest interface
│   │   ├── routes/
│   │   │   ├── auth.ts                      # register, login, me
│   │   │   ├── environments.ts              # kullanıcı bazlı CRUD
│   │   │   ├── sapApis.ts                   # API listesi, spec, check-all
│   │   │   ├── proxy.ts                     # SAP'a istek proxy'si (CSRF, SOAP)
│   │   │   ├── history.ts                   # environment bazlı geçmiş
│   │   │   └── variants.ts                  # user/global varyant CRUD
│   │   └── services/
│   │       ├── db.service.ts                # sql.js tabloları ve CRUD fonksiyonları
│   │       ├── encryption.service.ts        # AES-256
│   │       ├── sapApiHub.service.ts         # 27 sabit API tanımı + spec birleştirici
│   │       └── specs/
│   │           ├── sd.specs.ts              # SD: Sales Order (V2+V4), Delivery, Billing...
│   │           ├── mm.specs.ts              # MM: Purchase Order, Requisition, Material Doc...
│   │           ├── pp.specs.ts              # PP: Production Order, BOM, Work Center...
│   │           ├── fi.specs.ts              # FI: GL Account, Journal Entry (SOAP), Invoice...
│   │           ├── co.specs.ts              # CO: Cost Center, Profit Center, Internal Order...
│   │           └── ps.specs.ts              # PS: Project WBS, Network Activity
│   ├── data/
│   │   └── tryout.db                        # sql.js SQLite dosyası
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                          # Ana state yönetimi
│   │   ├── types.ts                         # Tüm TypeScript tipleri
│   │   ├── services/api.ts                  # Backend ile iletişim (fetch wrapper)
│   │   └── components/
│   │       ├── LoginPage/                   # Register + Login formu
│   │       ├── Sidebar/                     # Ortam seçimi, API listesi, arama
│   │       ├── EndpointList/                # Seçili API'nin endpoint'leri
│   │       ├── TryOutPanel/                 # İstek gönderme, varyant yönetimi
│   │       ├── EnvironmentModal/            # Ortam ekle/düzenle
│   │       ├── History/                     # İstek geçmişi
│   │       └── Maintenance/                 # Bakım modu ekranı
│   ├── .env                                 # Railway URL, VITE_MAINTENANCE_MODE
│   └── .env.local                           # Local dev override (localhost:3001)
├── docker-compose.yml
└── PLAN.md                                  # Bu dosya
```

---

## Sabit API Listesi (27 API)

### Master Data
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `business-partner` | Business Partner (A2X) | SAP_COM_0008 | OData V2 |
| `product-master` | Product Master (A2X) | SAP_COM_0009 | OData V2 |

### SD - Sales
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `sales-order` | Sales Order | SAP_COM_0109 | OData V2 |
| `sales-order-v4` | Sales Order V4 | SAP_COM_0109 | OData V4 |
| `sales-order-simulate-v2` | Sales Order Simulate V2 | SAP_COM_0109 | OData V2 |
| `sales-order-simulate` | Sales Order Simulate | SAP_COM_0109 | OData V4 |
| `outbound-delivery` | Outbound Delivery | SAP_COM_0106 | OData V2 |
| `billing-document` | Billing Document | SAP_COM_0120 | OData V2 |
| `customer-material` | Customer Material Info | SAP_COM_0364 | OData V2 |
| `sales-pricing` | Sales Pricing Condition | SAP_COM_0295 | OData V2 |

### MM - Procurement
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `purchase-order` | Purchase Order | SAP_COM_0053 | OData V2 |
| `purchase-requisition` | Purchase Requisition | SAP_COM_0073 | OData V2 |

### MM - Inventory
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `material-document` | Material Document | SAP_COM_0108 | OData V2 |
| `inbound-delivery` | Inbound Delivery | SAP_COM_0121 | OData V2 |
| `physical-inventory` | Physical Inventory | SAP_COM_0524 | OData V2 |

### PP - Production
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `production-order` | Production Order | SAP_COM_0160 | OData V2 |
| `bill-of-material` | Bill of Material | SAP_COM_0428 | OData V2 |
| `work-center` | Work Center | SAP_COM_0457 | OData V2 |
| `planned-order` | Planned Order | SAP_COM_0104 | OData V2 |

### FI - Finance
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `gl-account` | G/L Account | SAP_COM_0066 | OData V2 |
| `journal-entry` | Journal Entry | SAP_COM_0002 | SOAP |
| `supplier-invoice` | Supplier Invoice | SAP_COM_0057 | OData V2 |
| `customer-invoice` | Customer Invoice | SAP_COM_0014 | OData V2 |
| `bank-account` | Bank Account | SAP_COM_0404 | OData V2 |

### CO - Controlling
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `cost-center` | Cost Center | SAP_COM_0179 | OData V2 |
| `profit-center` | Profit Center | SAP_COM_0179 | OData V2 |
| `internal-order` | Internal Order | SAP_COM_0179 | OData V2 |
| `cost-center-activity-type` | Cost Center Activity Type | SAP_COM_0179 | OData V2 |

### PS - Project System
| ID | API Adı | Communication Scenario | Protocol |
|---|---|---|---|
| `project-wbs` | Project & WBS Element | SAP_COM_0054 | OData V2 |
| `project-network` | Project Network Activity | SAP_COM_0054 | OData V2 |

---

## Mevcut Özellikler

### Auth
- `POST /api/auth/register` — kayıt
- `POST /api/auth/login` — giriş, JWT döner
- `GET /api/auth/me` — token doğrulama
- JWT 7 gün geçerli, `localStorage`'da tutulur
- Şifreler bcryptjs ile hash'lenir

### Ortam Yönetimi
- Kullanıcı bazlı, şifreli saklama (AES-256)
- CRUD: oluştur, düzenle, sil
- Birden fazla SAP sistemi tanımlanabilir

### Access Check
- Ortam seçildiğinde tüm API'ler tek sorguda kontrol edilir
- **Communication Scenario bazlı:** aynı scenario'daki API'ler tek HTTP isteğiyle kontrol edilir
- `POST /api/sap/apis/check-all` — scenario temsilcisi üzerinden check yapar
- 200-399: erişilebilir, 405/415: erişilebilir, 400+: erişilemez
- Sidebar'da yeşil/kırmızı nokta gösterilir

### Proxy
- `POST /api/proxy` — SAP'a istek iletir
- OData için: mutating isteklerde önce `$metadata` GET ile CSRF token çekilir
- SOAP için: CSRF atlanır, `Content-Type: text/xml` gönderilir
- Cookie'ler `set-cookie` header'ından alınır (`response.headers.raw()['set-cookie']`)
- İstek geçmişi DB'ye kaydedilir

### Varyant Sistemi
- **Kullanıcı varyantı:** sadece o kullanıcı görür/kullanır
- **Global varyant:** environment bazlı, tüm kullanıcılar görebilir
- Her endpoint için ayrı varyant listesi (api_id + method + path bazlı)
- Kayıtlı parametreleri tek tıkla doldurur

### SOAP Desteği
- Journal Entry: `/sap/bc/srt/scs_ext/sap/journalentrycreaterequestconfi`
- Proxy SOAP isteğini otomatik algılar (path veya content-type'dan)
- XML response güzel formatlanarak gösterilir

---

## DB Şeması

```sql
users (id, email, password_hash, name, created_at)

environments (id, user_id, name, base_url, username, password_encrypted, description, created_at, updated_at)

user_variants (id, user_id, api_id, method, path, name, params, created_at)

global_variants (id, environment_id, created_by, api_id, method, path, name, params, created_at)

request_history (id, environment_id, method, path, status_code, duration_ms, created_at)
```

---

## Bilinen Davranışlar / Önemli Notlar

- **sql.js** kullanılıyor — `better-sqlite3` değil, Railway'de native build gerektirmez
- **UCON (Unified Connectivity):** SAP'ta Communication Arrangement olsa bile UCON whitelist'inde olmayan servisler 403 döner
- **OData V4 path pattern:** `/sap/opu/odata4/sap/<servis_adı>/srvd_a2x/sap/<alt_servis>/0001/`
  - Örn: `api_salesorder` (alt çizgi yok `sales` ile `order` arasında — `api_sales_order` DEĞİL)
- **CSRF:** `node-fetch`'te `response.headers.get('set-cookie')` sadece ilk cookie'yi alır, `response.headers.raw()['set-cookie']` kullanılmalı
- **`__dirname`:** ts-node-dev ile çalışırken script path'ini değil CWD'yi gösterir, `process.cwd()` kullanılmalı
- **Varyant method'ları** DB'de uppercase (`POST`) kaydedilmeli, endpoint.method lowercase (`post`) gelir
- **Frontend `.env.local`** Railway `.env`'yi override eder — local dev için kullanılır
- **Bakım modu:** `VITE_MAINTENANCE_MODE=true` ile açılır

---

## Deploy Bilgileri

| | Değer |
|---|---|
| Backend repo | `bguler11/sap-api-tryout` |
| Backend root | `/backend` |
| Frontend repo | `bguler11/sap-api-tryout-frontend` |
| Platform | Railway |
| Backend port | `process.env.PORT \|\| 3001` |
| CORS | `localhost:5173` + Railway frontend URL + `process.env.ALLOWED_ORIGIN` |

---

## Yapılacaklar / Sonraki Adımlar

### Bekleyen (Öncelikli)
- [ ] `dev/seed-variants` endpoint'i production'a gitmeden `index.ts`'den kaldırılmalı

### Planlanan: Kullanıcı Bazlı Dinamik API Ekleme

**Hedef:** Sabit 27 API listesine ek olarak, kullanıcı oturum bazlı kendi API'lerini ekleyebilsin.  
Eklenen API'nin endpoint listesi SAP sistemindeki `aps_com_ca_a4c_odata` servisi üzerinden dinamik çekilsin.

**Yaklaşım:**

1. **Scenario Listesi (İki Kaynaklı):**
   - Sabit liste: `sapApiHub.service.ts`'deki tüm unique `communicationScenario` değerleri
   - Dinamik: `aps_com_ca_a4c_odata` üzerinden sistemde tanımlı arrangement'lar
   - Sonuç: Sabit listeden tüm scenario'lar gösterilir, sistem karşılaştırması ile hangisinin "tanımlı" olduğu işaretlenir
   - Tanımlı olanlar aktif, tanımlı olmayanlar gri + "Kur" uyarısı

2. **Yeni DB Tablosu: `user_apis`**
   ```sql
   CREATE TABLE user_apis (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     communication_scenario TEXT NOT NULL,
     service_url TEXT NOT NULL,
     protocol TEXT NOT NULL DEFAULT 'OData',
     metadata_cache TEXT,
     metadata_cached_at DATETIME,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   )
   ```

3. **Yeni Backend Route'ları:**
   - `GET /api/sap/arrangements?environmentId=X` → sistemdeki tanımlı scenario'lar
   - `GET /api/sap/arrangements/:scenario/services?environmentId=X` → servis URL'leri
   - `GET /api/user-apis` → kullanıcının eklediği API'ler
   - `POST /api/user-apis` → yeni API ekle + metadata ilk cache
   - `DELETE /api/user-apis/:id` → sil
   - `GET /api/user-apis/:id/spec` → cached spec döndür
   - `POST /api/user-apis/:id/refresh?environmentId=X` → metadata yenile

4. **Metadata Parser (`metadata.service.ts`):**
   - Verilen `serviceUrl` için `$metadata` GET atar
   - `/odata4/` içeriyorsa V4 parser, `/odata/` içeriyorsa V2 parser
   - Entity set'leri → path listesine dönüştürür
   - Her entity için GET (list + single), POST, PATCH, DELETE tahmin edilir
   - `xml2js` paketi kullanılır

5. **Frontend Değişiklikleri:**
   - "API Ekle" modal: scenario dropdown → servis listesi → isim + kategori seçimi
   - Kullanıcı API'leri sabit API'lerle aynı kategorilerde gösterilir
   - Kullanıcı API'lerinin yanında `×` sil butonu + "↻ Yenile" butonu
   - `App.tsx`'te user api seçilince `userApisApi.getSpec(id)` çağrılır

6. **`check-all` Güncellemesi:**
   - Kullanıcı API'leri de dahil edilerek kontrol yapılır

**Riskler:**
- `aps_com_ca_a4c_odata` entity set isimleri bilinmiyor — ilk çalıştırmada `$metadata` parse ile keşfedilir
- `$metadata` XML'inde CRUD capability annotation olmayabilir — varsayılan olarak tüm metodlar gösterilir
- `aps_com_ca_a4c_odata` için mevcut `ZJVIS_COMM_USER` yeterli mi? → **Doğrulanması gerekiyor**
