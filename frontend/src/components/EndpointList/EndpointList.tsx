import { useState } from 'react';
import type { Endpoint, ApiCheckResult } from '../../types';

interface Props {
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint | null;
  onSelect: (endpoint: Endpoint) => void;
  loading: boolean;
  apiName: string;
  accessInfo?: ApiCheckResult;
  protocol?: string;
  communicationScenario?: string | null;
}

const METHOD_COLORS: Record<string, string> = {
  get: 'method-get',
  post: 'method-post',
  put: 'method-put',
  patch: 'method-patch',
  delete: 'method-delete',
};

const ALL_METHODS = ['get', 'post', 'patch', 'put', 'delete'];

export default function EndpointList({ endpoints, selectedEndpoint, onSelect, loading, apiName, accessInfo, protocol, communicationScenario }: Props) {
  const [search, setSearch] = useState('');
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sap-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const availableMethods = ALL_METHODS.filter(m => endpoints.some(e => e.method === m));

  const filtered = endpoints.filter(e => {
    const matchMethod = !activeMethod || e.method === activeMethod;
    const q = search.toLowerCase();
    const matchSearch = !q || e.path.toLowerCase().includes(q) || (e.operation.summary || '').toLowerCase().includes(q);
    return matchMethod && matchSearch;
  });

  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700 truncate">{apiName}</h2>
          {protocol === 'SOAP' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">SOAP</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-gray-400">{filtered.length}/{endpoints.length} endpoint</p>
          {communicationScenario && (
            <span
              title="Communication Scenario"
              className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-mono flex-shrink-0"
            >
              {communicationScenario}
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pt-2 pb-1 space-y-1.5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Endpoint ara..."
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue"
        />
        {availableMethods.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setActiveMethod(null)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                !activeMethod ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Tümü
            </button>
            {availableMethods.map(m => (
              <button
                key={m}
                onClick={() => setActiveMethod(activeMethod === m ? null : m)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors font-medium uppercase ${
                  activeMethod === m
                    ? `method-badge ${METHOD_COLORS[m]}`
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {protocol === 'SOAP' && (
        <div className="mx-3 mt-1 bg-purple-50 border border-purple-200 rounded px-3 py-2">
          <p className="text-xs text-purple-700 font-medium">SOAP Servisi</p>
          <p className="text-xs text-purple-600 mt-0.5">Bu API SOAP/XML protokolü kullanır.</p>
        </div>
      )}

      {accessInfo && !accessInfo.accessible && (
        <div className="mx-3 mt-1 bg-red-50 border border-red-200 rounded p-2.5">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm leading-none flex-shrink-0">⚠</span>
            <p className="text-xs text-red-600">
              Communication Arrangement gerekli. Sidebar'dan 🔗 butonunu kullanın.
            </p>
          </div>
        </div>
      )}

      {accessInfo?.accessible && (
        <div className="mx-3 mt-1 bg-green-50 border border-green-200 rounded px-3 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-green-700 font-medium">Erişim aktif</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mt-1">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            {endpoints.length === 0 ? 'Endpoint bulunamadı' : 'Arama sonucu yok'}
          </div>
        ) : (
          filtered.map((endpoint, idx) => {
            const isSelected =
              selectedEndpoint?.path === endpoint.path &&
              selectedEndpoint?.method === endpoint.method;

            return (
              <button
                key={idx}
                onClick={() => onSelect(endpoint)}
                className={`w-full text-left px-3 py-2 border-b border-gray-50 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-2 border-l-sap-blue'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`method-badge ${METHOD_COLORS[endpoint.method] || 'bg-gray-100 text-gray-600'}`}>
                    {endpoint.method}
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-700 truncate" title={endpoint.path}>
                  {endpoint.path}
                </div>
                {endpoint.operation.summary && (
                  <div className="text-xs text-gray-400 mt-0.5 truncate">
                    {endpoint.operation.summary}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
