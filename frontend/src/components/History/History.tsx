
import type { RequestHistory } from '../../types';

interface Props {
  history: RequestHistory[];
  onClose: () => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PUT: 'method-put',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 400 && status < 500) return 'text-yellow-700';
  if (status >= 500) return 'text-red-600';
  return 'text-gray-600';
}

export default function History({ history, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">İstek Geçmişi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Henüz istek gönderilmedi
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Yöntem</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Path</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Durum</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Süre</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Ortam</th>
                  <th className="px-4 py-2 text-left text-gray-500 font-medium">Zaman</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <span className={`method-badge ${METHOD_COLORS[item.method] || 'bg-gray-100 text-gray-600'}`}>
                        {item.method}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-700 max-w-xs truncate" title={item.path}>
                      {item.path}
                    </td>
                    <td className={`px-4 py-2 font-medium ${getStatusColor(item.status_code)}`}>
                      {item.status_code}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{item.duration_ms}ms</td>
                    <td className="px-4 py-2 text-gray-500">{item.environment_name}</td>
                    <td className="px-4 py-2 text-gray-400">
                      {new Date(item.created_at).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
