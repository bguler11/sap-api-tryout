import { useState, useEffect, useRef } from 'react';
import { commScenarioMapApi } from '../../services/api';

const UNLOCK_PASSWORD = 'SapM@pp1ng2024';

interface Entry {
  service_name: string;
  scenario_id: string;
  updated_at: string;
  api_title: string | null;
  scenario_description: string | null;
}

interface Props {
  onClose: () => void;
}

export default function CommScenarioPage({ onClose }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [newService, setNewService] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await commScenarioMapApi.getAll();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked]);

  function handlePasswordSubmit() {
    if (passwordInput === UNLOCK_PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function handleDelete(serviceName: string) {
    await commScenarioMapApi.delete(serviceName);
    setEntries(prev => prev.filter(e => e.service_name !== serviceName));
  }

  async function handleAddRow() {
    if (!newService.trim() || !newScenario.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await commScenarioMapApi.bulkUpsert([{ service_name: newService.trim().toUpperCase(), scenario_id: newScenario.trim().toUpperCase() }]);
      setNewService('');
      setNewScenario('');
      setSaveMsg('Kaydedildi');
      await load();
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  function handleExportJson() {
    const data = entries.map(e => ({
      service_name: e.service_name,
      scenario_id: e.scenario_id,
      ...(e.api_title ? { api_title: e.api_title } : {}),
      ...(e.scenario_description ? { scenario_description: e.scenario_description } : {}),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comm_scenario_map.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('Array bekleniyor');
        setSaving(true);
        setSaveMsg('');
        await commScenarioMapApi.bulkUpsert(parsed);
        setSaveMsg(`${parsed.length} kayıt yüklendi`);
        await load();
      } catch (err: any) {
        setSaveMsg(`Hata: ${err.message}`);
      } finally {
        setSaving(false);
        setTimeout(() => setSaveMsg(''), 3000);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  const filtered = entries.filter(
    e =>
      e.service_name.toLowerCase().includes(search.toLowerCase()) ||
      e.scenario_id.toLowerCase().includes(search.toLowerCase()) ||
      (e.api_title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.scenario_description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (!unlocked) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-80">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Erişim Parolası</h2>
          <input
            type="password"
            autoFocus
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="Parola"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sap-blue ${passwordError ? 'border-red-400' : 'border-gray-300'}`}
          />
          {passwordError && <p className="text-xs text-red-500 mt-1">Hatalı parola</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePasswordSubmit}
              className="flex-1 bg-sap-blue text-white text-sm py-2 rounded hover:bg-sap-darkblue"
            >
              Giriş
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 text-sm py-2 rounded hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl flex flex-col w-[1100px] max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">Communication Scenario Mapping</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ara..."
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue w-48"
          />
          <span className="text-xs text-gray-400 flex-1">{filtered.length} kayıt</span>
          <button
            onClick={handleExportJson}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-600"
          >
            JSON İndir
          </button>
          <label className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-600 cursor-pointer">
            JSON Yükle
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportJson} />
          </label>
          {saveMsg && (
            <span className={`text-xs font-medium ${saveMsg.startsWith('Hata') ? 'text-red-500' : 'text-green-600'}`}>
              {saveMsg}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-gray-500">Service Name</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-500">API Title</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-500">Scenario Description</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-500">Scenario ID</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.service_name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-gray-700">{e.service_name}</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">{e.api_title ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{e.scenario_description ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                        {e.scenario_id}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleDelete(e.service_name)}
                        className="text-gray-300 hover:text-red-500 text-base leading-none"
                        title="Sil"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={newService}
            onChange={e => setNewService(e.target.value)}
            placeholder="SERVICE_NAME"
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue flex-1 font-mono"
          />
          <input
            type="text"
            value={newScenario}
            onChange={e => setNewScenario(e.target.value)}
            placeholder="SAP_COM_XXXX"
            onKeyDown={e => e.key === 'Enter' && handleAddRow()}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sap-blue w-36 font-mono"
          />
          <button
            onClick={handleAddRow}
            disabled={saving || !newService.trim() || !newScenario.trim()}
            className="bg-sap-blue text-white text-xs px-3 py-1.5 rounded hover:bg-sap-darkblue disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
