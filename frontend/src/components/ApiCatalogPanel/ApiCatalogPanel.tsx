import { useState } from 'react';
import type { Endpoint, EnvironmentApi, ApiCheckResult } from '../../types';

interface Props {
  api: EnvironmentApi;
  endpoints: Endpoint[];
  loading: boolean;
  accessInfo?: ApiCheckResult;
  communicationScenario?: string | null;
  onSelectEndpoint: (endpoint: Endpoint) => void;
  selectedEndpoint: Endpoint | null;
}

const METHOD_COLORS: Record<string, string> = {
  get: 'method-get',
  post: 'method-post',
  patch: 'method-patch',
  put: 'method-put',
  delete: 'method-delete',
};

interface Group {
  label: string;
  endpoints: Endpoint[];
}

function buildGroups(endpoints: Endpoint[]): Group[] {
  const map = new Map<string, Endpoint[]>();
  for (const e of endpoints) {
    const tag = e.operation.tags?.[0] || 'Diğer';
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag)!.push(e);
  }
  return Array.from(map.entries())
    .map(([label, eps]) => ({ label, endpoints: eps }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function ApiCatalogPanel({
  api,
  endpoints,
  loading,
  accessInfo,
  communicationScenario,
  onSelectEndpoint,
  selectedEndpoint,
}: Props) {
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const allGroups = buildGroups(endpoints);

  const groups = allGroups.filter(g =>
    g.label.toLowerCase().includes(search.toLowerCase()) ||
    g.endpoints.some(e => (e.operation.summary || '').toLowerCase().includes(search.toLowerCase()))
  );

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function expandAll() {
    setOpenGroups(new Set(groups.map(g => g.label)));
  }

  function collapseAll() {
    setOpenGroups(new Set());
  }

  if (loading) {
    return (
      <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-sap-blue rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-800 truncate">{api.name}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-mono">{api.service_name}</span>
          {communicationScenario && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
              {communicationScenario}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          {accessInfo?.accessible ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">Erişim aktif</span>
            </div>
          ) : accessInfo && !accessInfo.accessible ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-red-600 font-medium">Erişim yok</span>
            </div>
          ) : null}
          <span className="text-xs text-gray-400 ml-auto">{allGroups.length} entity</span>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Entity ara..."
          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue"
        />
        <button onClick={expandAll} title="Tümünü aç" className="text-gray-400 hover:text-gray-600 text-xs px-1">+</button>
        <button onClick={collapseAll} title="Tümünü kapat" className="text-gray-400 hover:text-gray-600 text-xs px-1">−</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            {allGroups.length === 0 ? 'Entity bulunamadı' : 'Arama sonucu yok'}
          </div>
        ) : (
          groups.map(group => {
            const isOpen = openGroups.has(group.label);
            const hasSelected = group.endpoints.some(
              e => selectedEndpoint?.path === e.path && selectedEndpoint?.method === e.method
            );

            return (
              <div key={group.label} className="border-b border-gray-100">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${hasSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-gray-400 text-xs flex-shrink-0 transition-transform duration-150 inline-block ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    <span className={`text-xs font-medium truncate ${hasSelected ? 'text-sap-blue' : 'text-gray-700'}`}>
                      {group.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{group.endpoints.length}</span>
                </button>

                {isOpen && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {group.endpoints.map((ep, idx) => {
                      const isSelected =
                        selectedEndpoint?.path === ep.path &&
                        selectedEndpoint?.method === ep.method;

                      return (
                        <button
                          key={idx}
                          onClick={() => onSelectEndpoint(ep)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors border-b border-gray-100 last:border-0 ${
                            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`method-badge flex-shrink-0 ${METHOD_COLORS[ep.method] || 'bg-gray-100 text-gray-600'}`}>
                            {ep.method}
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {ep.operation.summary || ep.path}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
