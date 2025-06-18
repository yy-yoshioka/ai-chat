import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/Layout';

interface Widget {
  id: string;
  widgetKey: string;
  name: string;
  companyId: string;
  isActive: boolean;
  accentColor: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    plan: string;
  };
  _count: {
    chatLogs: number;
  };
}

interface Company {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export default function WidgetsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    accentColor: '#3b82f6',
    logoUrl: '',
    companyId: '',
  });

  const fetchCompanies = useCallback(async () => {
    try {
      console.log('Fetching companies...');
      const response = await fetch('/api/companies', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Companies fetched:', data);
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
          setFormData((prev) => ({ ...prev, companyId: data[0].id }));
        }
      } else {
        console.error('Failed to fetch companies:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  }, []);

  useEffect(() => {
    console.log('Auth effect - loading:', loading, 'user:', !!user);
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCompanies();
    }
  }, [user, loading, router, fetchCompanies]);

  useEffect(() => {
    console.log('Selected company effect - selectedCompanyId:', selectedCompanyId);
    if (selectedCompanyId) {
      fetchWidgets(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchWidgets = async (companyId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/widgets?companyId=${companyId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      } else {
        console.error('Failed to fetch widgets');
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newWidget = await response.json();
        setWidgets([newWidget, ...widgets]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          accentColor: '#3b82f6',
          logoUrl: '',
          companyId: selectedCompanyId,
        });
      } else {
        const error = await response.json();
        alert(`Error creating widget: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating widget:', error);
      alert('Failed to create widget');
    }
  };

  const handleToggleActive = async (widgetKey: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/widgets/${widgetKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setWidgets(
          widgets.map((w) => (w.widgetKey === widgetKey ? { ...w, isActive: !isActive } : w))
        );
      }
    } catch (error) {
      console.error('Error toggling widget status:', error);
    }
  };

  const copyEmbedCode = (widgetKey: string) => {
    const embedCode = `<script src="${window.location.origin}/widget-loader/${widgetKey}.v1.js"></script>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-slate-600 text-lg font-medium">Loading widgets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-slate-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl font-bold text-slate-900">Chat Widgets</h1>
                <p className="mt-2 text-lg text-slate-600">
                  Manage your embedded chat widgets across different platforms
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Widget
              </button>
            </div>
          </div>

          {/* Company Selection */}
          {companies.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Active Company
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-colors"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} - {company.plan.toUpperCase()} Plan
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Create Widget Form */}
          {showCreateForm && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Create New Widget</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateWidget} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Widget Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-colors"
                        placeholder="e.g., Main Website Chat"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Accent Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.accentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, accentColor: e.target.value })
                          }
                          className="w-16 h-12 border-2 border-slate-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.accentColor}
                          onChange={(e) =>
                            setFormData({ ...formData, accentColor: e.target.value })
                          }
                          className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-colors"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-slate-800 mb-2">
                        Logo URL (optional)
                      </label>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 transition-colors"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                    >
                      Create Widget
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Widgets Grid */}
          {widgets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No widgets found</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first chat widget</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Widget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  {/* Widget Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{widget.name}</h3>
                      <p className="text-sm text-slate-500">ID: {widget.widgetKey}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          widget.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 ${
                            widget.isActive ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        ></div>
                        {widget.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Widget Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-slate-800">
                        {widget._count.chatLogs}
                      </div>
                      <div className="text-sm text-slate-600">Messages</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-slate-800">
                        {widget.company.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {widget.company.plan.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="flex items-center mb-6">
                    <div
                      className="w-6 h-6 rounded-lg mr-3 border-2 border-slate-300"
                      style={{ backgroundColor: widget.accentColor }}
                    ></div>
                    <span className="text-sm text-slate-600">Theme: {widget.accentColor}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => copyEmbedCode(widget.widgetKey)}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Embed Code
                    </button>
                    <button
                      onClick={() => handleToggleActive(widget.widgetKey, widget.isActive)}
                      className={`w-full flex items-center justify-center px-4 py-2.5 font-semibold rounded-lg transition-colors ${
                        widget.isActive
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={
                            widget.isActive
                              ? 'M10 14L12 12L10 10M14 10L12 12L14 14'
                              : 'M5 3v4M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M19 7V3M9 1h6'
                          }
                        />
                      </svg>
                      {widget.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {/* Creation Date */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Created{' '}
                      {new Date(widget.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
