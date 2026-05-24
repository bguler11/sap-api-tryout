import { useState } from 'react';
import { environmentApisApi } from '../../services/api';

interface Props {
  apiId: number;
  apiName: string;
  serviceName: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function SpecUploadModal({ apiId, apiName, serviceName, onClose, onSaved }: Props) {
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
            <div className="text-xs text-gray-400 mt-0.5">{apiName} ({serviceName})</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3.5 flex-1 min-h-0 overflow-y-auto">
          {/* Adım Adım Kılavuz */}
          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5 text-xs border-b border-gray-200 pb-2">
              💡 OpenAPI Spec Kopyalama ve Yükleme Adımları:
            </div>
            <ol className="list-decimal pl-4 space-y-2 text-gray-600 leading-relaxed">
              <li>
                Aşağıdaki <strong className="text-sap-blue">"Orijinal JSON Kodunu Aç"</strong> butonuna tıklayarak spesifikasyon sayfasını yeni sekmede açın. (Eğer oturumunuz açık değilse SAP ID bilgilerinizle giriş yapın).
              </li>
              <li>
                Açılan tarayıcı sayfasındaki tüm yazıları seçip kopyalayın (Klavye kısayolu: <kbd className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-xs">Ctrl + A</kbd> ile tümünü seçin, ardından <kbd className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-xs">Ctrl + C</kbd> ile kopyalayın).
              </li>
              <li>
                Kopyaladığınız JSON içeriğini aşağıdaki metin kutusuna yapıştırın (<kbd className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-xs">Ctrl + V</kbd>) ve en alttaki <strong>"Spec Kaydet"</strong> butonuna tıklayın.
              </li>
            </ol>
            {serviceName && (
              <div className="mt-1 flex justify-end">
                <a
                  href={`https://api.sap.com/odata/1.0/catalog.svc/APIContent.APIs('${serviceName}')/$value?type=json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-sap-blue hover:bg-sap-darkblue text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  <span>🌐 Orijinal JSON Kodunu Aç (Sekmede)</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </div>
            )}
          </div>

          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            placeholder={'{\n  "openapi": "3.0.0",\n  ...\n}\n\n[İpucu: Kopyaladığınız OpenAPI JSON içeriğini buraya yapıştırın]'}
            className="flex-1 min-h-[250px] border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sap-blue resize-none"
            autoFocus
          />

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 text-sm rounded px-4 py-2 hover:bg-gray-50 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="flex-1 bg-sap-blue text-white text-sm rounded px-4 py-2 hover:bg-sap-darkblue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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
