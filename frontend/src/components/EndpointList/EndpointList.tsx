import type { Endpoint, ApiCheckResult } from '../../types';

interface Props {
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint | null;
  onSelect: (endpoint: Endpoint) => void;
  loading: boolean;
  apiName: string;
  accessInfo?: ApiCheckResult;
}

const METHOD_COLORS: Record<string, string> = {
  get: 'method-get',
  post: 'method-post',
  put: 'method-put',
  patch: 'method-patch',
  delete: 'method-delete',
};

export default function EndpointList({ endpoints, selectedEndpoint, onSelect, loading, apiName, accessInfo }: Props) {
  if (loading) {
    return (
      <div className="w-80 border-r border-gray-200 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sap-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 truncate">{apiName}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{endpoints.length} endpoint</p>
      </div>

      {accessInfo && !accessInfo.accessible && (
        <div className="mx-3 mt-3 bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-base leading-none flex-shrink-0">⚠</span>
            <div>
              <p className="text-xs font-semibold text-red-700">Erişim Yetkisi Yok</p>
              <p className="text-xs text-red-600 mt-0.5">
                Bu API'yi kullanmak için SAP sisteminde aşağıdaki Communication Arrangement'ı oluşturun:
              </p>
              <code className="inline-block mt-1.5 bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-mono font-bold">
                {accessInfo.communicationScenario}
              </code>
              <p className="text-xs text-red-500 mt-1.5">
                SAP Fiori → Communication Arrangements → New → Scenario: {accessInfo.communicationScenario}
              </p>
            </div>
          </div>
        </div>
      )}

      {accessInfo?.accessible && (
        <div className="mx-3 mt-3 bg-green-50 border border-green-200 rounded px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-green-700 font-medium">Erişim aktif</span>
          <code className="text-xs text-green-600 ml-auto">{accessInfo.communicationScenario}</code>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mt-2">
        {endpoints.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400">
            Endpoint bulunamadı
          </div>
        ) : (
          endpoints.map((endpoint, idx) => {
            const isSelected =
              selectedEndpoint?.path === endpoint.path &&
              selectedEndpoint?.method === endpoint.method;

            return (
              <button
                key={idx}
                onClick={() => onSelect(endpoint)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-2 border-l-sap-blue'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
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
