import type { Environment, EnvironmentApi, ApiCheckResult, User } from '../../types';

interface Props {
  environments: Environment[];
  selectedEnvironment: Environment | null;
  onSelectEnvironment: (env: Environment) => void;
  onAddEnvironment: () => void;
  onEditEnvironment: (env: Environment) => void;
  onDeleteEnvironment: (id: number) => void;
  apis: EnvironmentApi[];
  selectedApi: EnvironmentApi | null;
  onSelectApi: (api: EnvironmentApi) => void;
  onAddApi: () => void;
  onDeleteApi: (id: number) => void;
  onRefreshApi: (id: number) => void;
  onArrangeApi: (id: number) => void;
  onUploadSpec: (id: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  apiAccessMap: Record<number, ApiCheckResult>;
  checkingAccess: boolean;
  arrangementMap: Record<number, { exists: boolean; checkable: boolean; noMapping: boolean; scenarioId: string; status: string }>;
  user: User;
  onLogout: () => void;
  onOpenCommScenario: () => void;
  onRefreshAllStatuses?: () => void;
}

export default function Sidebar({
  environments,
  selectedEnvironment,
  onSelectEnvironment,
  onAddEnvironment,
  onEditEnvironment,
  onDeleteEnvironment,
  apis,
  selectedApi,
  onSelectApi,
  onAddApi,
  onDeleteApi,
  onRefreshApi,
  onArrangeApi,
  onUploadSpec,
  searchQuery,
  onSearchChange,
  apiAccessMap,
  checkingAccess,
  arrangementMap,
  user,
  onLogout,
  onOpenCommScenario,
  onRefreshAllStatuses,
}: Props) {
  const filteredApis = apis.filter(
    api =>
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (api.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#0B1120] border-r border-white/10 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3.5 border-b border-black/20 bg-sap-darkgray relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-radial pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white text-[11px] font-extrabold tracking-tight">NTT</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">API Explorer</span>
          </div>
          <button
            onClick={onLogout}
            title="Çıkış Yap"
            className="text-ink-400 hover:text-white text-xs font-medium transition-colors"
          >
            Çıkış
          </button>
        </div>
        <div className="relative mt-2 flex items-center gap-1.5 text-xs text-ink-400 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          {user.name || user.email}
        </div>
      </div>

      <div className="px-3 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ortam</span>
          <button
            onClick={onAddEnvironment}
            className="text-sap-blue hover:text-sap-darkblue text-xs font-medium flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> Ekle
          </button>
        </div>

        {environments.length === 0 ? (
          <button
            onClick={onAddEnvironment}
            className="w-full text-left text-xs text-slate-400 border border-dashed border-white/15 rounded-lg px-2 py-2 hover:border-sap-blue hover:text-sap-blue hover:bg-white/5 transition-colors"
          >
            Ortam eklemek için tıklayın
          </button>
        ) : (
          <div className="space-y-1">
            {environments.map(env => (
              <div
                key={env.id}
                className={`relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer group transition-all ${
                  selectedEnvironment?.id === env.id
                    ? 'bg-brand-gradient text-white shadow-glow'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
                onClick={() => onSelectEnvironment(env)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{env.name}</div>
                    <div className={`text-xs truncate ${
                      selectedEnvironment?.id === env.id ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {env.base_url.replace(/^https?:\/\//, '').substring(0, 30)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onEditEnvironment(env); }}
                    className={`p-1 rounded text-xs ${
                      selectedEnvironment?.id === env.id ? 'text-white' : 'text-gray-400'
                    }`}
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteEnvironment(env.id); }}
                    className={`p-1 rounded text-xs ${
                      selectedEnvironment?.id === env.id ? 'text-white' : 'text-gray-400'
                    }`}
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedEnvironment && checkingAccess && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
            Yetki kontrol ediliyor...
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="API ara..."
          className="flex-1 bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500 rounded-lg px-2.5 py-1.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-sap-blue/40 focus:border-sap-blue focus:bg-white/10"
        />
        {selectedEnvironment && (
          <div className="flex gap-1.5">
            {onRefreshAllStatuses && (
              <button
                onClick={onRefreshAllStatuses}
                disabled={checkingAccess}
                title="Tüm API Bağlantı ve Arrangement Durumlarını Yenile"
                className={`flex-shrink-0 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-2 py-1.5 rounded-lg transition-all font-medium flex items-center justify-center ${
                  checkingAccess ? 'opacity-50 cursor-not-allowed animate-spin' : ''
                }`}
              >
                ↻
              </button>
            )}
            <button
              onClick={onAddApi}
              title="API Ekle"
              className="flex-shrink-0 bg-brand-gradient text-white text-xs px-2.5 py-1.5 rounded-lg shadow-soft hover:shadow-glow hover:brightness-105 transition-all font-semibold"
            >
              + API
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedEnvironment ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            Önce bir ortam seçin
          </div>
        ) : filteredApis.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            {apis.length === 0 ? (
              <div>
                <div className="mb-2">Henüz API eklenmedi</div>
                <button
                  onClick={onAddApi}
                  className="text-sap-blue hover:underline"
                >
                  + İlk API'yi ekleyin
                </button>
              </div>
            ) : 'Arama sonucu bulunamadı'}
          </div>
        ) : (
          filteredApis.map(api => {
            const access = apiAccessMap[api.id];
            const isChecked = api.id in apiAccessMap;
            const arrInfo = arrangementMap[api.id];
            const arrCheckable = arrInfo?.checkable ?? false;
            const arrNoMapping = arrInfo?.noMapping ?? false;
            const arrStatus = arrInfo?.status ?? api.arrangement_status;
            const arrScenario = arrInfo?.scenarioId ?? '';
            const needsArrangement = arrCheckable && (arrStatus === 'pending' || arrStatus === 'failed');

            return (
              <div
                key={api.id}
                className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-colors group ${
                  selectedApi?.id === api.id
                    ? 'bg-sap-blue/15 border-l-2 border-l-sap-blue'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onSelectApi(api)}
                  >
                    <div className="flex items-center gap-1.5">
                      {api.protocol === 'SOAP' ? (
                        <div
                          title="SOAP Servisi (Bağlantı ve yetki doğrulaması gönderim esnasında yapılır)"
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-help bg-amber-400"
                        />
                      ) : checkingAccess && !isChecked ? (
                        <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                      ) : isChecked ? (
                        <div
                          title={access?.accessible ? "Erişim Başarılı (HTTP 200)" : `Erişim Başarısız (HTTP ${access?.status === 0 ? 'TLS/Ağ Hatası' : access?.status})`}
                          className={`w-2 h-2 rounded-full flex-shrink-0 cursor-help ${
                            access?.accessible ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        />
                      ) : null}
                      <div className="text-xs font-medium text-slate-200 truncate">{api.name}</div>
                      {api.protocol !== 'SOAP' && isChecked && !access?.accessible && (
                        <span
                          className="bg-red-50 text-red-600 text-[10px] px-1 py-0.5 rounded font-mono font-bold leading-none border border-red-200 flex-shrink-0"
                          title={`Erişim Hatası: HTTP ${access?.status === 0 ? 'TLS veya Ağ Bağlantı Hatası' : access?.status}`}
                        >
                          {access?.status === 0 ? 'TLS/Ağ' : `HTTP ${access?.status}`}
                        </span>
                      )}
                      {arrCheckable && arrNoMapping && (
                        <span
                          title="Scenario mapping bulunamadı — ··· menüsünden CommScenario sayfasına ekleyin"
                          className="text-xs text-gray-400 flex-shrink-0 leading-none"
                        >
                          ?
                        </span>
                      )}
                      {arrCheckable && !arrNoMapping && arrStatus === 'pending' && (
                        <span
                          title={`Communication Arrangement kurulmadı — ${arrScenario} gerekli`}
                          className="text-xs text-amber-400 flex-shrink-0 leading-none"
                        >
                          ●
                        </span>
                      )}
                      {arrCheckable && !arrNoMapping && arrStatus === 'failed' && (
                        <span
                          title={`Communication Arrangement başarısız — ${arrScenario}`}
                          className="text-xs text-red-500 flex-shrink-0"
                        >
                          ⚠️
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate font-mono">{api.service_name}</div>
                    {arrCheckable && arrNoMapping && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        Scenario mapping yok
                      </div>
                    )}
                    {arrCheckable && !arrNoMapping && needsArrangement && arrScenario && (
                      <div className="text-xs text-amber-600 mt-0.5 truncate">
                        {arrScenario} gerekli
                      </div>
                    )}
                  </button>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0 pt-0.5">
                    {needsArrangement && (
                      <button
                        onClick={e => { e.stopPropagation(); onArrangeApi(api.id); }}
                        title={`Arrangement oluştur (${arrScenario})`}
                        className="p-1 text-amber-500 hover:text-amber-700 text-xs"
                      >
                        🔗
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); onUploadSpec(api.id); }}
                      title="Spec yükle (paste)"
                      className="p-1 text-gray-400 hover:text-sap-blue text-xs"
                    >
                      ↑
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onRefreshApi(api.id); }}
                      title="Spec'i yenile"
                      className="p-1 text-gray-400 hover:text-sap-blue text-xs"
                    >
                      ↻
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteApi(api.id); }}
                      title="API'yi sil"
                      className="p-1 text-gray-400 hover:text-red-500 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="px-3 py-2 border-t border-white/10 flex justify-end">
        <button
          onClick={onOpenCommScenario}
          title="Scenario Mapping"
          className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
        >
          ···
        </button>
      </div>
    </div>
  );
}
