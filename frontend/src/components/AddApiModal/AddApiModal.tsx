import { useState, useEffect, useRef } from 'react';
import type { EnvironmentApi, CatalogApiResult } from '../../types';
import { environmentApisApi, sapCatalogApi } from '../../services/api';

interface Props {
  environmentId: number;
  onClose: () => void;
  onAdded: (api: EnvironmentApi) => void;
}

export default function AddApiModal({ environmentId, onClose, onAdded }: Props) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogApiResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [serviceName, setServiceName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchText.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await sapCatalogApi.search(searchText);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);
  }, [searchText]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: CatalogApiResult) => {
    setSearchText(item.title || item.name);
    setServiceName(item.name);
    if (!name) setName(item.title || item.name);
    if (!description) setDescription(item.description || '');
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalServiceName = serviceName || searchText.trim();
    if (!finalServiceName) return setError('Servis adı zorunludur');
    if (!name.trim()) return setError('API adı zorunludur');

    setSaving(true);
    try {
      const result = await environmentApisApi.add({
        environmentId,
        name: name.trim(),
        description: description.trim(),
        serviceName: finalServiceName.trim(),
      });
      onAdded(result.api);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">API Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Servis Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value);
                setServiceName('');
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="örn. API_SALES_ORDER_SRV"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sap-blue"
              autoFocus
            />
            {loadingSuggestions && (
              <div className="absolute right-3 top-8 w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            )}

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-800 truncate flex-1">
                        {item.title || item.name}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${
                        item.subType === 'ODATAV4' ? 'bg-blue-100 text-blue-700' :
                        item.subType === 'SOAP' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{item.subType}</span>
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{item.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              API Adı (görüntülenecek) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="örn. Sales Order"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sap-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="İsteğe bağlı"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sap-blue"
            />
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <div className="font-medium mb-1 text-gray-700">Ne olacak?</div>
            <ul className="space-y-1">
              <li>• SAP Catalog'dan spec ve endpoint listesi oluşturulacak</li>
              <li>• Seçilen ortama bağlantı test edilecek — erişilemiyorsa eklenmez</li>
              <li>• Communication Arrangement sonraki adımda <span className="font-medium">🔗</span> ile kurulabilir</li>
            </ul>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 text-sm rounded px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-sap-blue text-white text-sm rounded px-4 py-2 hover:bg-sap-darkblue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ekleniyor...
                </>
              ) : 'API Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
