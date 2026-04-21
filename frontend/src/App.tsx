import { useState, useEffect } from 'react';
import type { Environment, SapApi, Endpoint, OpenApiSpec, RequestHistory, ApiCheckResult } from './types';
import { environmentsApi, sapApisApi, historyApi } from './services/api';
import Sidebar from './components/Sidebar/Sidebar';
import EndpointList from './components/EndpointList/EndpointList';
import TryOutPanel from './components/TryOutPanel/TryOutPanel';
import EnvironmentModal from './components/EnvironmentModal/EnvironmentModal';
import History from './components/History/History';

export default function App() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  const [apis, setApis] = useState<SapApi[]>([]);
  const [selectedApi, setSelectedApi] = useState<SapApi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiAccessMap, setApiAccessMap] = useState<Record<string, ApiCheckResult>>({});
  const [checkingAccess, setCheckingAccess] = useState(false);

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [loadingSpec, setLoadingSpec] = useState(false);

  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  useEffect(() => {
    environmentsApi.getAll().then(setEnvironments).catch(console.error);
    sapApisApi.getAll().then(setApis).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedEnvironment || apis.length === 0) return;
    checkAllApis(selectedEnvironment, apis);
  }, [selectedEnvironment, apis]);

  const checkAllApis = async (env: Environment, apiList: SapApi[]) => {
    setCheckingAccess(true);
    setApiAccessMap({});
    const results = await Promise.all(
      apiList.map(async api => {
        try {
          const result = await sapApisApi.checkAccess(api.id, env.id);
          return { id: api.id, result };
        } catch {
          return { id: api.id, result: { accessible: false, status: 0, communicationScenario: api.communicationScenario } };
        }
      })
    );
    const map: Record<string, ApiCheckResult> = {};
    results.forEach(({ id, result }) => { map[id] = result; });
    setApiAccessMap(map);
    setCheckingAccess(false);
  };

  const handleSelectEnvironment = (env: Environment) => {
    setSelectedEnvironment(env);
    setSelectedApi(null);
    setSelectedEndpoint(null);
    setEndpoints([]);
  };

  const handleSelectApi = async (api: SapApi) => {
    setSelectedApi(api);
    setSelectedEndpoint(null);
    setEndpoints([]);
    setLoadingSpec(true);
    try {
      const spec: OpenApiSpec = await sapApisApi.getSpec(api.id);
      const parsed: Endpoint[] = [];
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
        methods.forEach(method => {
          if (pathItem[method]) {
            parsed.push({ path, method, operation: pathItem[method]! });
          }
        });
      });
      setEndpoints(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSpec(false);
    }
  };

  const handleEnvSaved = (env: Environment) => {
    setEnvironments(prev => {
      const idx = prev.findIndex(e => e.id === env.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = env;
        return updated;
      }
      return [...prev, env];
    });
    if (!selectedEnvironment) setSelectedEnvironment(env);
    setShowEnvModal(false);
    setEditingEnv(null);
  };

  const handleDeleteEnv = async (id: number) => {
    if (!confirm('Bu ortamı silmek istediğinize emin misiniz?')) return;
    await environmentsApi.delete(id);
    setEnvironments(prev => prev.filter(e => e.id !== id));
    if (selectedEnvironment?.id === id) {
      setSelectedEnvironment(null);
      setApiAccessMap({});
    }
  };

  const handleOpenHistory = async () => {
    const h = await historyApi.getAll(50);
    setHistory(h);
    setShowHistory(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        environments={environments}
        selectedEnvironment={selectedEnvironment}
        onSelectEnvironment={handleSelectEnvironment}
        onAddEnvironment={() => { setEditingEnv(null); setShowEnvModal(true); }}
        onEditEnvironment={env => { setEditingEnv(env); setShowEnvModal(true); }}
        onDeleteEnvironment={handleDeleteEnv}
        apis={apis}
        selectedApi={selectedApi}
        onSelectApi={handleSelectApi}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        apiAccessMap={apiAccessMap}
        checkingAccess={checkingAccess}
      />

      {selectedApi ? (
        <>
          <EndpointList
            endpoints={endpoints}
            selectedEndpoint={selectedEndpoint}
            onSelect={setSelectedEndpoint}
            loading={loadingSpec}
            apiName={selectedApi.name}
            accessInfo={apiAccessMap[selectedApi.id]}
          />
          <TryOutPanel
            endpoint={selectedEndpoint}
            environment={selectedEnvironment}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-sap-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">SAP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">SAP API Try-Out</h1>
            <p className="text-gray-500 text-sm mb-6">
              Sol panelden bir ortam tanımlayın, ardından test etmek istediğiniz API'yi seçin.
            </p>
            <div className="flex flex-col gap-2 text-left bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">1.</span>
                <span>"+ Ekle" ile SAP sisteminizi tanımlayın</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">2.</span>
                <span>Sol panelden bir API seçin</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">3.</span>
                <span>Endpoint seçip parametreleri doldurun</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">4.</span>
                <span>"Gönder" ile gerçek SAP verinizi görün</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleOpenHistory}
        className="fixed bottom-4 right-4 bg-sap-darkgray text-white text-xs px-3 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      >
        📋 Geçmiş
      </button>

      {showEnvModal && (
        <EnvironmentModal
          environment={editingEnv}
          onClose={() => { setShowEnvModal(false); setEditingEnv(null); }}
          onSaved={handleEnvSaved}
        />
      )}

      {showHistory && (
        <History history={history} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
