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
import { ConfirmHost, confirmDialog } from './components/ConfirmDialog/ConfirmDialog';

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
  const [isSpecUploaded, setIsSpecUploaded] = useState(false);

  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  const [showAddApiModal, setShowAddApiModal] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [showCommScenario, setShowCommScenario] = useState(false);
  const [specUploadApiId, setSpecUploadApiId] = useState<number | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [catalogCollapsed, setCatalogCollapsed] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const [catalogWidth, setCatalogWidth] = useState(288);
  const [isResizingCatalog, setIsResizingCatalog] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1024;
      setSidebarCollapsed(isSmall);
      setCatalogCollapsed(isSmall);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const newWidth = e.clientX;
        if (newWidth > 150 && newWidth < 450) {
          setSidebarWidth(newWidth);
        }
      } else if (isResizingCatalog) {
        const sidebarOffset = sidebarCollapsed ? 0 : sidebarWidth;
        const newWidth = e.clientX - sidebarOffset;
        if (newWidth > 150 && newWidth < 450) {
          setCatalogWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingCatalog(false);
    };

    if (isResizingSidebar || isResizingCatalog) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingCatalog, sidebarCollapsed, sidebarWidth]);

  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  const startResizeCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingCatalog(true);
  };

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
    setIsSpecUploaded(false);
    setLoadingSpec(true);
    try {
      const spec = (await environmentApisApi.getSpec(api.id)) as OpenApiSpec & { 'x-spec-uploaded'?: boolean };
      setCommScenario(spec['x-sap-comm-scenario'] ?? null);
      setIsSpecUploaded(spec['x-spec-uploaded'] === true);
      const parsed: Endpoint[] = [];
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
        methods.forEach(method => {
          const item = pathItem as any;
          if (item && item[method]) {
            parsed.push({ path, method, operation: item[method]! });
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
    const updatedList = [...apis, api];
    setApis(updatedList);
    setShowAddApiModal(false);
    if (selectedEnvironment) {
      checkAllApis(selectedEnvironment.id, updatedList);
      checkAllArrangements(selectedEnvironment.id);
    }
  };

  const handleDeleteApi = async (id: number) => {
    if (!(await confirmDialog('Bu API\'yi silmek istediğinize emin misiniz?'))) return;
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
      if (selectedEnvironment) {
        await Promise.all([
          checkAllApis(selectedEnvironment.id),
          checkAllArrangements(selectedEnvironment.id)
        ]);
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
      if (selectedEnvironment) {
        await Promise.all([
          checkAllApis(selectedEnvironment.id),
          checkAllArrangements(selectedEnvironment.id)
        ]);
      }
    } catch (err: any) {
      alert(`Arrangement hatası: ${err.message}`);
    }
  };

  const handleRefreshAllStatuses = async () => {
    if (selectedEnvironment) {
      await Promise.all([
        checkAllApis(selectedEnvironment.id),
        checkAllArrangements(selectedEnvironment.id)
      ]);
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
    if (!(await confirmDialog('Bu ortamı silmek istediğinize emin misiniz?'))) return;
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
    <div className="flex h-screen overflow-hidden relative">
      <ConfirmHost />
      {logoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{logoutMessage}</span>
          <button onClick={() => setLogoutMessage(null)} className="ml-2 text-amber-700 hover:text-amber-900">✕</button>
        </div>
      )}

      {/* Sidebar Container */}
      <div 
        style={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
        className={`transition-all duration-150 flex-shrink-0 z-40 relative h-full bg-[#0B1120] flex ${
          sidebarCollapsed
            ? 'w-0 overflow-hidden lg:w-0'
            : 'absolute lg:relative left-0 top-0 shadow-2xl lg:shadow-none'
        }`}
      >
        <div className="flex-1 overflow-hidden h-full">
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
            onRefreshAllStatuses={handleRefreshAllStatuses}
          />
        </div>

        {/* Custom Drag Splitter Handle (only on desktop lg) */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={startResizeSidebar}
            className="hidden lg:block absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 group hover:bg-sap-blue/20 active:bg-sap-blue/40 transition-colors"
          >
            <div className="w-[2px] h-full bg-gray-200 group-hover:bg-sap-blue/40 mx-auto" />
          </div>
        )}
      </div>

      {/* Reopen Sidebar Trigger Button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 border-l-0 shadow-md rounded-r-xl items-center justify-center text-[10px] text-gray-400 hover:text-sap-blue hover:bg-gray-50 z-50 transition-colors"
          title="Ortam & API Panelini Göster"
        >
          ▶
        </button>
      )}

      {/* Sidebar Backdrop for Mobile */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-35 lg:hidden" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {selectedApi ? (
        <div className="flex flex-1 overflow-x-auto overflow-y-hidden min-w-0 relative h-full">
          {/* ApiCatalogPanel Container */}
          <div 
            style={{ width: catalogCollapsed ? 0 : catalogWidth }}
            className={`transition-all duration-150 flex-shrink-0 z-30 relative h-full bg-white flex ${
              catalogCollapsed 
                ? 'w-0 overflow-hidden lg:w-0' 
                : 'absolute lg:relative left-0 top-0 shadow-2xl lg:shadow-none'
            }`}
          >
            <div className="flex-1 overflow-hidden h-full">
              <ApiCatalogPanel
                api={selectedApi}
                endpoints={endpoints}
                loading={loadingSpec}
                accessInfo={apiAccessMap[selectedApi.id]}
                communicationScenario={commScenario}
                onSelectEndpoint={setSelectedEndpoint}
                selectedEndpoint={selectedEndpoint}
                onUploadSpec={setSpecUploadApiId}
                isSpecUploaded={isSpecUploaded}
              />
            </div>

            {/* Custom Drag Splitter Handle (only on desktop lg) */}
            {!catalogCollapsed && (
              <div
                onMouseDown={startResizeCatalog}
                className="hidden lg:block absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 group hover:bg-sap-blue/20 active:bg-sap-blue/40 transition-colors"
              >
                <div className="w-[2px] h-full bg-gray-200 group-hover:bg-sap-blue/40 mx-auto" />
              </div>
            )}
          </div>

          {/* Catalog Backdrop for Mobile */}
          {!catalogCollapsed && (
            <div 
              className="fixed inset-0 bg-black/40 z-25 lg:hidden" 
              onClick={() => setCatalogCollapsed(true)}
            />
          )}

          {/* Reopen Catalog Trigger Button */}
          {catalogCollapsed && (
            <button
              onClick={() => setCatalogCollapsed(false)}
              className="hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 border-l-0 shadow-md rounded-r-xl items-center justify-center text-[10px] text-gray-400 hover:text-sap-blue hover:bg-gray-50 z-50 transition-colors"
              title="Endpoint Listesini Göster"
            >
              ▶
            </button>
          )}

          <TryOutPanel
            endpoint={selectedEndpoint}
            environment={selectedEnvironment}
            apiId={String(selectedApi.id)}
            userId={auth.user.id}
            onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
            onToggleCatalog={() => setCatalogCollapsed(prev => !prev)}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-y-auto">
          {/* Mobile Header when welcome screen is open */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-2 lg:hidden">
            <button 
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium border border-gray-200 transition-colors"
            >
              <span>☰</span> Ortam & API
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 bg-brand-radial">
            <div className="text-center max-w-sm animate-fade-in">
              <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                <span className="text-white text-2xl font-extrabold tracking-tight">NTT</span>
              </div>
              <h1 className="text-2xl font-bold text-ink-900 mb-2 tracking-tight">NTT API Explorer</h1>
              <p className="text-ink-500 text-sm mb-6">
                Sol panelden bir ortam tanımlayın, ardından test etmek istediğiniz API'yi ekleyin.
              </p>
              <div className="flex flex-col gap-2.5 text-left card p-5 text-sm text-ink-600">
                {[
                  '"+ Ekle" ile sistemlerinizi tanımlayın',
                  '"+ API Ekle" ile test edeceğiniz servisi ekleyin',
                  'Endpoint seçip parametreleri doldurun',
                  '"Gönder" ile gerçek verinizi görün',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 flex items-center justify-center rounded-md bg-sap-blue/10 text-sap-blue font-bold text-xs flex-shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleOpenHistory}
        className="fixed bottom-4 right-4 bg-sap-darkgray text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-card hover:brightness-125 transition-all"
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
            serviceName={targetApi?.service_name ?? ''}
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
