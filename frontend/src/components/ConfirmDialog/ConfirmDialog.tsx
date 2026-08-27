import { useEffect, useState } from 'react';

// Native window.confirm() gömülü/sandbox tarayıcılarda ve bazı kurumsal
// ortamlarda dialog göstermeden false döndürebiliyor; bu da silme gibi
// işlemleri sessizce bloke ediyor. Bunun yerine promise tabanlı, uygulama içi
// bir onay modalı kullanıyoruz.

let openModal: ((message: string) => void) | null = null;
let resolver: ((result: boolean) => void) | null = null;

export function confirmDialog(message: string): Promise<boolean> {
  return new Promise(resolve => {
    resolver = resolve;
    if (openModal) {
      openModal(message);
    } else {
      // ConfirmHost henüz mount edilmediyse native confirm'e düş
      resolve(window.confirm(message));
    }
  });
}

export function ConfirmHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    openModal = (msg: string) => setMessage(msg);
    return () => { openModal = null; };
  }, []);

  const close = (result: boolean) => {
    setMessage(null);
    if (resolver) {
      resolver(result);
      resolver = null;
    }
  };

  if (message === null) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={() => close(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg flex-shrink-0">
            ⚠️
          </div>
          <p className="text-sm text-gray-700 mt-1.5">{message}</p>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => close(false)} className="btn-secondary text-sm">
            Vazgeç
          </button>
          <button onClick={() => close(true)} className="btn-danger text-sm" autoFocus>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
