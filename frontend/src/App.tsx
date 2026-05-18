import { useState, useEffect } from 'react';
import type { Environment, EnvironmentApi, Endpoint, OpenApiSpec, RequestHistory, ApiCheckResult, AuthState, User } from './types';
import { environmentsApi, environmentApisApi, historyApi } from './services/api';
import Sidebar from './components/Sidebar/Sidebar';
import TryOutPanel from './components/TryOutPanel/TryOutPanel';
import EnvironmentModal from './components/EnvironmentModal/EnvironmentModal';
import AddApiModal from './components/AddApiModal/AddApiModal';
import History from './components/History/History';
import LoginPage from './components/LoginPage/LoginPage';
import CommScenarioPage from './components/CommScenarioPage/CommScenarioPage';
import ApiCatalogPanel from './components/ApiCatalogPanel/ApiCatalogPanel';
import SpecUploadModal from './components/SpecUploadModal/SpecUploadModal';

function loadStoredAuth(): AuthState | null {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) as User };
  } catch {
    return null;
  }
}

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(loadStoredAuth);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = (e: CustomEvent<string>) => {
      setAuth(null);
      setLogoutMessage(e.detail);
      setTimeout(() => setLogoutMessage(null), 5000);
    };
    window.addEventListener('auth:logout', handleLogout as EventListener);
    return () => window.removeEventListener('auth:logout', handleLogout as EventListener);
  }, [setAuth]);

  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  const [apis, setApis] = useState<EnvironmentApi[]>([]);
  const [selectedApi, setSelectedApi] = useState<EnvironmentApi | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiAccessMap, setApiAccessMap] = useState<Record<number, ApiCheckResult>>({});
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [arrangementMap, setArrangementMap] = useState<Record<number, { exists: boolean; checkable: boolean; noMapping: boolean; scenarioId: string; status: string }>>({});

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [commScenario, setCommScenario] = useState<string | null>(null);

  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  const [showAddApiModal, setShowAddApiModal] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [showCommScenario, setShowCommScenario] = useState(false);
  const [specUploadApiId, setSpecUploadApiId] = useState<number | null>(null);

  useEffect(() => {
    if (!auth) return;
    environmentsApi.getAll().then(setEnvironments).catch(console.error);
  }, [auth]);

  useEffect(() => {
    if (!selectedEnvironment) {
      setApis([]);
      setApiAccessMap({});
      setArrangementMap({});
      return;
    }
    loadApis(selectedEnvironment.id);
  }, [selectedEnvironment]);

  const loadApis = async (environmentId: number) => {
    try {
      const list = await environmentApisApi.getAll(environmentId);
      setApis(list);
      checkAllApis(environmentId, list);
      checkAllArrangements(environmentId);
    } catch (err) {
      console.error(err);
    }
  };

  const checkAllArrangements = async (environmentId: number) => {
    try {
      const map = await environmentApisApi.checkArrangements(environmentId);
      setArrangementMap(map);
      setApis(prev => prev.map(a => {
        const r = map[a.id];
        if (r && r.status !== a.arrangement_status) return { ...a, arrangement_status: r.status as any };
        return a;
      }));
    } catch {
      // sessizce geç
    }
  };

  const checkAllApis = async (environmentId: number, apiList?: EnvironmentApi[]) => {
    const list = apiList ?? apis;
    if (list.length === 0) return;
    setCheckingAccess(true);
    setApiAccessMap({});
    try {
      const map = await environmentApisApi.checkAll(environmentId);
      setApiAccessMap(map);
    } catch {
      setApiAccessMap({});
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleAuth = (newAuth: AuthState) => {
    setAuth(newAuth);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuth(null);
    setEnvironments([]);
    setSelectedEnvironment(null);
    setApis([]);
    setSelectedApi(null);
    setApiAccessMap({});
  };

  const handleSelectEnvironment = (env: Environment) => {
    setSelectedEnvironment(env);
    setSelectedApi(null);
    setSelectedEndpoint(null);
    setEndpoints([]);
  };

  const handleSelectApi = async (api: EnvironmentApi) => {
    setSelectedApi(api);
    setSelectedEndpoint(null);
    setEndpoints([]);
    setCommScenario(null);
    setLoadingSpec(true);
    try {
      const spec: OpenApiSpec = await environmentApisApi.getSpec(api.id);
      setCommScenario(spec['x-sap-comm-scenario'] ?? null);
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

  const handleApiAdded = (api: EnvironmentApi) => {
    setApis(prev => [...prev, api]);
    setShowAddApiModal(false);
    if (selectedEnvironment) checkAllArrangements(selectedEnvironment.id);
  };

  const handleDeleteApi = async (id: number) => {
    if (!confirm('Bu API\'yi silmek istediğinize emin misiniz?')) return;
    await environmentApisApi.delete(id);
    setApis(prev => prev.filter(a => a.id !== id));
    if (selectedApi?.id === id) {
      setSelectedApi(null);
      setEndpoints([]);
      setSelectedEndpoint(null);
    }
  };

  const handleRefreshApi = async (id: number) => {
    try {
      const updated = await environmentApisApi.refresh(id);
      setApis(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedApi?.id === id) {
        await handleSelectApi(updated);
      }
    } catch (err: any) {
      alert(`Spec yenilenemedi: ${err.message}`);
    }
  };

  const handleArrangeApi = async (id: number) => {
    try {
      const result = await environmentApisApi.arrange(id);
      setApis(prev => prev.map(a => a.id === id ? { ...a, arrangement_status: result.status as any } : a));
      alert(result.message);
    } catch (err: any) {
      alert(`Arrangement hatası: ${err.message}`);
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

  if (!auth) {
    return (
      <>
        {logoutMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{logoutMessage}</span>
            <button onClick={() => setLogoutMessage(null)} className="ml-2 text-amber-700 hover:text-amber-900">✕</button>
          </div>
        )}
        <LoginPage onAuth={handleAuth} />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {logoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{logoutMessage}</span>
          <button onClick={() => setLogoutMessage(null)} className="ml-2 text-amber-700 hover:text-amber-900">✕</button>
        </div>
      )}

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
        onAddApi={() => setShowAddApiModal(true)}
        onDeleteApi={handleDeleteApi}
        onRefreshApi={handleRefreshApi}
        onArrangeApi={handleArrangeApi}
        onUploadSpec={setSpecUploadApiId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        apiAccessMap={apiAccessMap}
        checkingAccess={checkingAccess}
        arrangementMap={arrangementMap}
        user={auth.user}
        onLogout={handleLogout}
        onOpenCommScenario={() => setShowCommScenario(true)}
      />

      {selectedApi ? (
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden min-w-0">
          <ApiCatalogPanel
            api={selectedApi}
            endpoints={endpoints}
            loading={loadingSpec}
            accessInfo={apiAccessMap[selectedApi.id]}
            communicationScenario={commScenario}
            onSelectEndpoint={setSelectedEndpoint}
            selectedEndpoint={selectedEndpoint}
          />
          <TryOutPanel
            endpoint={selectedEndpoint}
            environment={selectedEnvironment}
            apiId={String(selectedApi.id)}
            userId={auth.user.id}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-sap-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">SAP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">SAP API Try-Out</h1>
            <p className="text-gray-500 text-sm mb-6">
              Sol panelden bir ortam tanımlayın, ardından test etmek istediğiniz API'yi ekleyin.
            </p>
            <div className="flex flex-col gap-2 text-left bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">1.</span>
                <span>"+ Ekle" ile SAP sisteminizi tanımlayın</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sap-blue font-bold">2.</span>
                <span>"+ API Ekle" ile test edeceğiniz servisi ekleyin</span>
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
        Geçmiş
      </button>

      {showEnvModal && (
        <EnvironmentModal
          environment={editingEnv}
          onClose={() => { setShowEnvModal(false); setEditingEnv(null); }}
          onSaved={handleEnvSaved}
        />
      )}

      {showAddApiModal && selectedEnvironment && (
        <AddApiModal
          environmentId={selectedEnvironment.id}
          onClose={() => setShowAddApiModal(false)}
          onAdded={handleApiAdded}
        />
      )}

      {showHistory && (
        <History history={history} onClose={() => setShowHistory(false)} />
      )}

      {showCommScenario && (
        <CommScenarioPage onClose={() => setShowCommScenario(false)} />
      )}

      {specUploadApiId !== null && (() => {
        const targetApi = apis.find(a => a.id === specUploadApiId);
        return (
          <SpecUploadModal
            apiId={specUploadApiId}
            apiName={targetApi?.name ?? ''}
            onClose={() => setSpecUploadApiId(null)}
            onSaved={() => {
              setSpecUploadApiId(null);
              if (targetApi) handleSelectApi(targetApi);
            }}
          />
        );
      })()}
    </div>
  );
}
