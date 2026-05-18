import { useState, useEffect } from 'react';
import type { Endpoint, Environment, ProxyResponse, OpenApiParameter, Variant, VariantList } from '../../types';
import { proxyApi, variantsApi } from '../../services/api';

interface Props {
  endpoint: Endpoint | null;
  environment: Environment | null;
  apiId: string;
  userId: number;
}

const METHOD_COLORS: Record<string, string> = {
  get: 'method-get',
  post: 'method-post',
  put: 'method-put',
  patch: 'method-patch',
  delete: 'method-delete',
};

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 bg-green-50 border-green-200';
  if (status >= 400 && status < 500) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  if (status >= 500) return 'text-red-600 bg-red-50 border-red-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

export default function TryOutPanel({ endpoint, environment, apiId, userId }: Props) {
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState('');
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'body' | 'response'>('params');
  const [showHeaders, setShowHeaders] = useState(false);

  const [variants, setVariants] = useState<VariantList>({ user: [], global: [] });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveScope, setSaveScope] = useState<'user' | 'global'>('user');
  const [variantName, setVariantName] = useState('');
  const [savingVariant, setSavingVariant] = useState(false);

  const isXmlEndpoint = !!(
    endpoint?.operation?.requestBody?.content?.['text/xml'] ||
    (endpoint?.operation as any)?.['x-content-type'] === 'xml'
  );

  useEffect(() => {
    setParamValues({});
    setBodyValue('');
    setResponse(null);
    setError('');
    setActiveTab('params');
    setVariants({ user: [], global: [] });

    if (endpoint?.operation.requestBody) {
      const xmlContent = endpoint.operation.requestBody.content?.['text/xml'];
      const jsonContent = endpoint.operation.requestBody.content?.['application/json'];
      if ((xmlContent?.schema as any)?.example) {
        setBodyValue((xmlContent?.schema as any).example as string);
        setActiveTab('body');
      } else if (jsonContent?.schema?.properties) {
        const example: Record<string, any> = {};
        Object.entries(jsonContent.schema.properties).forEach(([key, prop]) => {
          if ((prop as any).example !== undefined) example[key] = (prop as any).example;
        });
        if (Object.keys(example).length > 0) setBodyValue(JSON.stringify(example, null, 2));
      }
    }

    if (endpoint && environment) {
      loadVariants(endpoint, environment.id);
    }
  }, [endpoint, environment]);

  const loadVariants = async (ep: Endpoint, environmentId: number) => {
    try {
      const data = await variantsApi.getAll(environmentId, apiId, ep.method.toUpperCase(), ep.path);
      setVariants(data);
    } catch {
      setVariants({ user: [], global: [] });
    }
  };

  const applyVariant = (variant: Variant) => {
    const params = variant.params;
    if (params.body !== undefined) {
      setBodyValue(typeof params.body === 'string' ? params.body : JSON.stringify(params.body, null, 2));
    }
    if (params.fields) {
      setParamValues(params.fields);
    }
  };

  const collectCurrentParams = (): Record<string, any> => {
    const result: Record<string, any> = {};
    if (Object.keys(paramValues).some(k => paramValues[k])) {
      result.fields = { ...paramValues };
    }
    if (bodyValue.trim()) {
      try {
        result.body = JSON.parse(bodyValue);
      } catch {
        result.body = bodyValue;
      }
    }
    return result;
  };

  const handleSaveVariant = async () => {
    if (!variantName.trim() || !endpoint || !environment) return;
    setSavingVariant(true);
    try {
      const params = collectCurrentParams();
      if (saveScope === 'user') {
        const v = await variantsApi.createUser({ api_id: apiId, method: endpoint.method.toUpperCase(), path: endpoint.path, name: variantName.trim(), params });
        setVariants(prev => ({ ...prev, user: [...prev.user, v] }));
      } else {
        const v = await variantsApi.createGlobal({ environment_id: environment.id, api_id: apiId, method: endpoint.method.toUpperCase(), path: endpoint.path, name: variantName.trim(), params });
        setVariants(prev => ({ ...prev, global: [...prev.global, v] }));
      }
      setShowSaveModal(false);
      setVariantName('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variant: Variant) => {
    if (!confirm(`"${variant.name}" varyantını silmek istiyor musunuz?`)) return;
    try {
      if (variant.scope === 'user') {
        await variantsApi.deleteUser(variant.id);
        setVariants(prev => ({ ...prev, user: prev.user.filter(v => v.id !== variant.id) }));
      } else {
        await variantsApi.deleteGlobal(variant.id);
        setVariants(prev => ({ ...prev, global: prev.global.filter(v => v.id !== variant.id) }));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!endpoint) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🔌</div>
          <h3 className="text-lg font-medium text-gray-600 mb-1">Bir endpoint seçin</h3>
          <p className="text-sm text-gray-400">Sol panelden bir API ve endpoint seçerek test etmeye başlayın</p>
        </div>
      </div>
    );
  }

  const parameters = endpoint.operation.parameters || [];
  const pathParams = parameters.filter(p => p.in === 'path');
  const queryParams = parameters.filter(p => p.in === 'query');
  const hasBody = ['post', 'put', 'patch'].includes(endpoint.method.toLowerCase());
  const totalParams = pathParams.length + queryParams.length;
  const allVariants = [...variants.user, ...variants.global];
  const hasVariants = allVariants.length > 0;

  const buildPath = (): string => {
    let resolvedPath = endpoint.path;
    pathParams.forEach(p => {
      const val = paramValues[`path_${p.name}`] || `{${p.name}}`;
      resolvedPath = resolvedPath.replace(`{${p.name}}`, encodeURIComponent(val));
    });
    return resolvedPath;
  };

  const handleExecute = async () => {
    if (!environment) { setError('Lütfen önce bir ortam seçin'); return; }
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const resolvedPath = buildPath();
      const qp: Record<string, string> = {};
      queryParams.forEach(p => {
        const val = paramValues[`query_${p.name}`];
        if (val) qp[p.name] = val;
      });
      let bodyPayload: any = undefined;
      if (hasBody && bodyValue.trim()) {
        if (isXmlEndpoint) {
          bodyPayload = bodyValue;
        } else {
          try {
            bodyPayload = JSON.parse(bodyValue);
          } catch {
            setError('Request body geçerli bir JSON değil');
            setLoading(false);
            return;
          }
        }
      }
      const result = await proxyApi.execute({
        environmentId: environment.id,
        apiId,
        method: endpoint.method.toUpperCase(),
        path: resolvedPath,
        queryParams: Object.keys(qp).length > 0 ? qp : undefined,
        body: bodyPayload,
        headers: isXmlEndpoint ? { 'Content-Type': 'text/xml; charset=utf-8' } : undefined,
      });
      setResponse(result);
      setActiveTab('response');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (data: any): string => {
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
  };

  const formatXml = (xml: string): string => {
    try {
      let formatted = '';
      let indent = 0;
      const lines = xml.replace(/>\s*</g, '>\n<').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
          formatted += '  '.repeat(indent) + trimmed + '\n';
        } else if (trimmed.endsWith('/>') || trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
          formatted += '  '.repeat(indent) + trimmed + '\n';
        } else if (trimmed.startsWith('<') && !trimmed.includes('</')) {
          formatted += '  '.repeat(indent) + trimmed + '\n';
          indent++;
        } else {
          formatted += '  '.repeat(indent) + trimmed + '\n';
        }
      }
      return formatted.trim();
    } catch {
      return String(xml);
    }
  };

  const isXmlResponse = (body: any): boolean => {
    return typeof body === 'string' && (body.trimStart().startsWith('<') || body.includes('<?xml'));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`method-badge ${METHOD_COLORS[endpoint.method.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
            {endpoint.method.toUpperCase()}
          </span>
          <code className="text-sm font-mono text-gray-800 flex-1 min-w-0 break-all">{endpoint.path}</code>
        </div>
        {endpoint.operation.summary && (
          <p className="text-sm text-gray-500 mt-1">{endpoint.operation.summary}</p>
        )}

        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {environment ? (
              <div className="flex items-center gap-2 text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>{environment.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-1 rounded">
                Ortam seçilmedi
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasVariants && (
              <VariantDropdown
                variants={allVariants}
                userId={userId}
                onApply={applyVariant}
                onDelete={handleDeleteVariant}
              />
            )}
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-xs border border-gray-300 text-gray-600 hover:border-sap-blue hover:text-sap-blue px-2.5 py-1 rounded transition-colors"
            >
              + Varyant Kaydet
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('params')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'params' ? 'border-sap-blue text-sap-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Parametreler
          {totalParams > 0 && (
            <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{totalParams}</span>
          )}
        </button>
        {hasBody && (
          <button
            onClick={() => setActiveTab('body')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'body' ? 'border-sap-blue text-sap-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Request Body
          </button>
        )}
        <button
          onClick={() => setActiveTab('response')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'response' ? 'border-sap-blue text-sap-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Yanıt
          {response && (
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full border ${getStatusColor(response.status)}`}>
              {response.status}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'params' && (
          <div className="p-6 space-y-6">
            {pathParams.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Path Parametreleri</h3>
                <div className="space-y-3">
                  {pathParams.map(param => (
                    <ParamInput
                      key={param.name}
                      param={param}
                      value={paramValues[`path_${param.name}`] || ''}
                      onChange={val => setParamValues(prev => ({ ...prev, [`path_${param.name}`]: val }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {queryParams.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Query Parametreleri</h3>
                <div className="space-y-3">
                  {queryParams.map(param => (
                    <ParamInput
                      key={param.name}
                      param={param}
                      value={paramValues[`query_${param.name}`] || ''}
                      onChange={val => setParamValues(prev => ({ ...prev, [`query_${param.name}`]: val }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalParams === 0 && (
              <div className="text-center py-8 text-sm text-gray-400">Bu endpoint için parametre bulunmuyor</div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button onClick={handleExecute} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Gönderiliyor...</>
                ) : (
                  <><span>▶</span> Gönder</>
                )}
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}
          </div>
        )}

        {activeTab === 'body' && hasBody && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{isXmlEndpoint ? 'SOAP / XML Body' : 'JSON Body'}</h3>
              {endpoint.operation.requestBody?.content?.['application/json']?.schema?.required && (
                <span className="text-xs text-gray-400">
                  Zorunlu: {endpoint.operation.requestBody.content['application/json'].schema.required?.join(', ')}
                </span>
              )}
            </div>
            <textarea
              value={bodyValue}
              onChange={e => setBodyValue(e.target.value)}
              className="w-full h-64 font-mono text-xs border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-sap-blue resize-none"
              placeholder={isXmlEndpoint ? '<?xml version="1.0" encoding="UTF-8"?>\n<soapenv:Envelope>...</soapenv:Envelope>' : '{"key": "value"}'}
              spellCheck={false}
            />

            {endpoint.operation.requestBody?.content?.['application/json']?.schema?.properties && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Kullanılabilir Alanlar:</h4>
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                  {Object.entries(endpoint.operation.requestBody.content['application/json'].schema.properties || {}).map(([key, prop]: [string, any]) => (
                    <div key={key} className="flex items-start gap-3 px-3 py-2 border-b border-gray-100 last:border-0">
                      <code className="text-xs font-mono text-sap-blue font-medium">{key}</code>
                      <span className="text-xs text-gray-400">{prop.type}</span>
                      {prop.description && <span className="text-xs text-gray-500">{prop.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleExecute} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Gönderiliyor...</>
                ) : (
                  <><span>▶</span> Gönder</>
                )}
              </button>
            </div>

            {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}
          </div>
        )}

        {activeTab === 'response' && (
          <div className="p-6">
            {!response ? (
              <div className="text-center py-12 text-sm text-gray-400">Henüz istek gönderilmedi. "Gönder" butonuna basın.</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium ${getStatusColor(response.status)}`}>
                    <span>{response.status}</span>
                    <span>{response.statusText}</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">⏱ {response.duration_ms}ms</div>
                  <div className="text-xs text-gray-400 truncate flex-1" title={response.url}>{response.url}</div>
                </div>

                <div>
                  <button onClick={() => setShowHeaders(!showHeaders)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                    <span>{showHeaders ? '▼' : '▶'}</span> Response Headers
                  </button>
                  {showHeaders && (
                    <div className="bg-white border border-gray-200 rounded overflow-hidden text-xs">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex gap-3 px-3 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="font-medium text-gray-600 min-w-0 w-40 flex-shrink-0">{key}</span>
                          <span className="text-gray-500 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response Body</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(isXmlResponse(response.body) ? formatXml(response.body) : formatJson(response.body))}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Kopyala
                    </button>
                  </div>
                  <pre className="json-viewer bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs max-h-96 overflow-y-auto">
                    {isXmlResponse(response.body) ? formatXml(response.body) : formatJson(response.body)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Varyant Kaydet</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Varyant Adı</label>
                <input
                  type="text"
                  value={variantName}
                  onChange={e => setVariantName(e.target.value)}
                  placeholder="örn. Test Siparişi, Ocak Verisi..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sap-blue"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Kapsam</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSaveScope('user')}
                    className={`flex-1 text-xs py-2 px-3 rounded-lg border transition-colors ${saveScope === 'user' ? 'border-sap-blue bg-blue-50 text-sap-blue' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <div className="font-medium mb-0.5">Kişisel</div>
                    <div className="text-gray-400 text-xs">Sadece sen görebilirsin</div>
                  </button>
                  <button
                    onClick={() => setSaveScope('global')}
                    disabled={!environment}
                    className={`flex-1 text-xs py-2 px-3 rounded-lg border transition-colors ${saveScope === 'global' ? 'border-sap-blue bg-blue-50 text-sap-blue' : 'border-gray-200 text-gray-600 hover:border-gray-300'} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="font-medium mb-0.5">Global</div>
                    <div className="text-gray-400 text-xs">{environment?.name} kullanan herkes</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowSaveModal(false); setVariantName(''); }} className="flex-1 text-sm border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50">
                İptal
              </button>
              <button onClick={handleSaveVariant} disabled={!variantName.trim() || savingVariant} className="flex-1 text-sm bg-sap-blue text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {savingVariant ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VariantDropdown({ variants, userId, onApply, onDelete }: {
  variants: Variant[];
  userId: number;
  onApply: (v: Variant) => void;
  onDelete: (v: Variant) => void;
}) {
  const [open, setOpen] = useState(false);

  const userVariants = variants.filter(v => v.scope === 'user');
  const globalVariants = variants.filter(v => v.scope === 'global');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs border border-gray-300 text-gray-600 hover:border-sap-blue hover:text-sap-blue px-2.5 py-1 rounded transition-colors flex items-center gap-1"
      >
        Varyantlar
        <span className="bg-gray-100 text-gray-500 text-xs px-1.5 rounded-full">{variants.length}</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {userVariants.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kişisel</span>
                </div>
                {userVariants.map(v => (
                  <VariantItem key={v.id} variant={v} onApply={() => { onApply(v); setOpen(false); }} onDelete={() => onDelete(v)} canDelete={true} />
                ))}
              </div>
            )}
            {globalVariants.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Global</span>
                </div>
                {globalVariants.map(v => (
                  <VariantItem key={v.id} variant={v} onApply={() => { onApply(v); setOpen(false); }} onDelete={() => onDelete(v)} canDelete={v.created_by === userId} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function VariantItem({ variant, onApply, onDelete, canDelete }: {
  variant: Variant;
  onApply: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0 group">
      <button onClick={onApply} className="flex-1 text-left min-w-0">
        <div className="text-xs font-medium text-gray-700 truncate">{variant.name}</div>
        {variant.scope === 'global' && variant.created_by_email && (
          <div className="text-xs text-gray-400 truncate">{variant.created_by_email}</div>
        )}
      </button>
      {canDelete && (
        <button onClick={onDelete} className="ml-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs flex-shrink-0">
          Sil
        </button>
      )}
    </div>
  );
}

function ParamInput({ param, value, onChange }: {
  param: OpenApiParameter;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-700">{param.name}</label>
          {param.required && <span className="text-red-500 text-xs">*</span>}
        </div>
        {param.description && <p className="text-xs text-gray-400 mt-0.5 leading-tight">{param.description}</p>}
        <span className="text-xs text-gray-300">{param.schema?.type}</span>
      </div>
      <div className="flex-1">
        {param.schema?.enum ? (
          <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-xs">
            <option value="">-- Seçin --</option>
            {param.schema.enum.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={param.schema?.type === 'integer' ? 'number' : 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={String(param.schema?.example ?? '')}
            className="input-field text-xs"
          />
        )}
      </div>
    </div>
  );
}
