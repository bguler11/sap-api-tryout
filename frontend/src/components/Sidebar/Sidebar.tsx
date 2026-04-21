import type { Environment, SapApi, ApiCheckResult } from '../../types';

interface Props {
  environments: Environment[];
  selectedEnvironment: Environment | null;
  onSelectEnvironment: (env: Environment) => void;
  onAddEnvironment: () => void;
  onEditEnvironment: (env: Environment) => void;
  onDeleteEnvironment: (id: number) => void;
  apis: SapApi[];
  selectedApi: SapApi | null;
  onSelectApi: (api: SapApi) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  apiAccessMap: Record<string, ApiCheckResult>;
  checkingAccess: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Master Data': 'bg-blue-100 text-blue-700',
  'SD - Sales': 'bg-green-100 text-green-700',
  'MM - Procurement': 'bg-orange-100 text-orange-700',
  'MM - Inventory': 'bg-amber-100 text-amber-700',
  'PP - Production': 'bg-cyan-100 text-cyan-700',
  'FI - Finance': 'bg-purple-100 text-purple-700',
  'CO - Controlling': 'bg-violet-100 text-violet-700',
  'PS - Project System': 'bg-rose-100 text-rose-700',
};

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
  searchQuery,
  onSearchChange,
  apiAccessMap,
  checkingAccess,
}: Props) {
  const filteredApis = apis.filter(
    api =>
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filteredApis.map(a => a.category))];

  const accessibleCount = Object.values(apiAccessMap).filter(r => r.accessible).length;
  const totalChecked = Object.keys(apiAccessMap).length;

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-sap-darkgray">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sap-blue rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">SAP</span>
          </div>
          <span className="text-white font-semibold text-sm">API Try-Out</span>
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
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    selectedEnvironment?.id === env.id ? 'bg-white' : 'bg-green-400'
                  }`} />
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

        {selectedEnvironment && totalChecked > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
            <div className="flex gap-0.5">
              {Array.from({ length: totalChecked }).map((_, i) => {
                const api = apis[i];
                const r = api ? apiAccessMap[api.id] : undefined;
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      !r ? 'bg-gray-200' : r.accessible ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                );
              })}
            </div>
            <span>{accessibleCount}/{totalChecked} API erişilebilir</span>
          </div>
        )}

        {selectedEnvironment && checkingAccess && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            Yetki kontrol ediliyor...
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-b border-gray-200">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="API ara..."
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredApis.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            Arama sonucu bulunamadı
          </div>
        ) : (
          categories.map(category => (
            <div key={category}>
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </span>
              </div>
              {filteredApis
                .filter(a => a.category === category)
                .map(api => {
                  const access = apiAccessMap[api.id];
                  const isChecked = api.id in apiAccessMap;
                  return (
                    <button
                      key={api.id}
                      onClick={() => onSelectApi(api)}
                      className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                        selectedApi?.id === api.id
                          ? 'bg-blue-50 border-l-2 border-l-sap-blue'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {checkingAccess && !isChecked ? (
                              <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                            ) : isChecked ? (
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                access?.accessible ? 'bg-green-400' : 'bg-red-400'
                              }`} />
                            ) : null}
                            <div className="text-xs font-medium text-gray-800 truncate">{api.name}</div>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{api.description}</div>
                          {isChecked && !access?.accessible && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                              <span>Gerekli:</span>
                              <code className="bg-red-50 px-1 rounded text-red-600">
                                {api.communicationScenario}
                              </code>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${
                          CATEGORY_COLORS[api.category] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {api.version}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
