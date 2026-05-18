import { useState } from 'react';
import { environmentApisApi } from '../../services/api';

interface Props {
  apiId: number;
  apiName: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function SpecUploadModal({ apiId, apiName, onClose, onSaved }: Props) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    let parsed: object;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      setError('Geçerli bir JSON değil — kontrol edip tekrar deneyin.');
      return;
    }
    setSaving(true);
    try {
      await environmentApisApi.uploadSpec(apiId, parsed);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Spec kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">OpenAPI Spec Yükle</h2>
            <div className="text-xs text-gray-400 mt-0.5">{apiName}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3 flex-1 min-h-0">
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            SAP API Hub'dan indirdiğiniz <span className="font-medium">OpenAPI JSON</span> spec'ini aşağıya yapıştırın. Mevcut spec varsa üzerine yazılır.
          </div>

          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            placeholder={'{\n  "openapi": "3.0.0",\n  ...\n}'}
            className="flex-1 min-h-[300px] border border-gray-300 rounded px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sap-blue resize-none"
            autoFocus
          />

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 text-sm rounded px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="flex-1 bg-sap-blue text-white text-sm rounded px-4 py-2 hover:bg-sap-darkblue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : 'Spec Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
