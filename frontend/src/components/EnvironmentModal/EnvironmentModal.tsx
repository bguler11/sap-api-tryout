import React, { useState, useEffect } from 'react';
import type { Environment } from '../../types';
import { environmentsApi } from '../../services/api';

interface Props {
  environment?: Environment | null;
  onClose: () => void;
  onSaved: (env: Environment) => void;
}

export default function EnvironmentModal({ environment, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '',
    base_url: '',
    username: '',
    password: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (environment) {
      setForm({
        name: environment.name,
        base_url: environment.base_url,
        username: environment.username,
        password: '',
        description: environment.description || '',
      });
    }
  }, [environment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let saved: Environment;
      if (environment) {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password;
        saved = await environmentsApi.update(environment.id, payload);
      } else {
        saved = await environmentsApi.create(form);
      }
      onSaved(saved);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {environment ? 'Ortamı Düzenle' : 'Yeni Ortam Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="label">Ortam Adı *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Örn: S4H Dev"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Base URL *</label>
            <input
              name="base_url"
              value={form.base_url}
              onChange={handleChange}
              placeholder="https://my-tenant.s4hana.cloud.sap"
              required
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">SAP S/4HANA Cloud tenant URL'si</p>
          </div>

          <div>
            <label className="label">Kullanıcı Adı *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="your.user@company.com"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="label">
              Şifre {environment ? '(değiştirmek için doldurun)' : '*'}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder={environment ? 'Değiştirmek için girin' : 'Şifrenizi girin'}
              required={!environment}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Açıklama</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opsiyonel açıklama..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Kaydediliyor...' : environment ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
