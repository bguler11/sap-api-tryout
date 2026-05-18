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
}: Props) {
  const filteredApis = apis.filter(
    api =>
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (api.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-sap-darkgray">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sap-blue rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">SAP</span>
            </div>
            <span className="text-white font-semibold text-sm">API Try-Out</span>
          </div>
          <button
            onClick={onLogout}
            title="Çıkış Yap"
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Çıkış
          </button>
        </div>
        <div className="mt-1.5 text-xs text-gray-400 truncate">
          {user.name || user.email}
        </div>
      </div>

      <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ortam</span>
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
            className="w-full text-left text-xs text-gray-400 border border-dashed border-gray-300 rounded px-2 py-2 hover:border-sap-blue hover:text-sap-blue transition-colors"
          >
            Ortam eklemek için tıklayın
          </button>
        ) : (
          <div className="space-y-1">
            {environments.map(env => (
              <div
                key={env.id}
                className={`relative flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                  selectedEnvironment?.id === env.id
                    ? 'bg-sap-blue text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => onSelectEnvironment(env)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{env.name}</div>
                    <div className={`text-xs truncate ${
                      selectedEnvironment?.id === env.id ? 'text-blue-100' : 'text-gray-400'
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
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            Yetki kontrol ediliyor...
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="API ara..."
          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue"
        />
        {selectedEnvironment && (
          <button
            onClick={onAddApi}
            title="API Ekle"
            className="flex-shrink-0 bg-sap-blue text-white text-xs px-2 py-1.5 rounded hover:bg-sap-darkblue transition-colors font-medium"
          >
            + API
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedEnvironment ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            Önce bir ortam seçin
          </div>
        ) : filteredApis.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
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
                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors group ${
                  selectedApi?.id === api.id
                    ? 'bg-blue-50 border-l-2 border-l-sap-blue'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onSelectApi(api)}
                  >
                    <div className="flex items-center gap-1.5">
                      {checkingAccess && !isChecked ? (
                        <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                      ) : isChecked ? (
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          access?.accessible ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                      ) : null}
                      <div className="text-xs font-medium text-gray-800 truncate">{api.name}</div>
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
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{api.service_name}</div>
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
      <div className="px-3 py-2 border-t border-gray-100 flex justify-end">
        <button
          onClick={onOpenCommScenario}
          title="Scenario Mapping"
          className="text-gray-200 hover:text-gray-400 text-xs transition-colors"
        >
          ···
        </button>
      </div>
    </div>
  );
}
