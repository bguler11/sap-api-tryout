import { useState } from 'react';
import { authApi } from '../../services/api';
import type { AuthState } from '../../types';

interface Props {
  onAuth: (auth: AuthState) => void;
}

export default function LoginPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let auth: AuthState;
      if (mode === 'login') {
        auth = await authApi.login(email, password);
      } else {
        auth = await authApi.register(email, password, name || undefined);
      }
      localStorage.setItem('auth_token', auth.token);
      localStorage.setItem('auth_user', JSON.stringify(auth.user));
      onAuth(auth);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0B1120]">
      {/* Dekoratif arka plan */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-sap-blue/30 blur-[120px] animate-float-a" />
        <div className="absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-indigo-600/25 blur-[130px] animate-float-b" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-cyan-400/15 blur-[110px] animate-float-a" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }}
        />
      </div>

      <div className="relative w-full max-w-md animate-rise">
        <div className="text-center mb-8">
          <div className="w-[72px] h-[72px] bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow ring-1 ring-white/20">
            <span className="text-white text-2xl font-extrabold tracking-tight">NTT</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-sky-300 bg-clip-text text-transparent">
            NTT API Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-2">Entegrasyon sistemlerinizi test edin</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-2xl p-6 ring-1 ring-white/5">
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === 'login' ? 'bg-brand-gradient text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Giriş Yap
            </button>
            <button
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${mode === 'register' ? 'bg-brand-gradient text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Ad Soyad</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="İsminiz (opsiyonel)"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:border-sap-blue focus:ring-2 focus:ring-sap-blue/30 focus:bg-white/10"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:border-sap-blue focus:ring-2 focus:ring-sap-blue/30 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:border-sap-blue focus:ring-2 focus:ring-sap-blue/30 focus:bg-white/10"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? 'Lütfen bekleyin...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
