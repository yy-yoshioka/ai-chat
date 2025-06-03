import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

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
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    accentColor: '#007bff',
    logoUrl: '',
    companyId: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCompanies();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchWidgets(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      // For demo purposes, we'll create a mock company
      // In a real app, you'd fetch this from an API
      const mockCompanies: Company[] = [
        {
          id: 'test-company-id',
          name: 'Test Company',
          email: 'test@example.com',
          plan: 'pro',
        },
      ];
      setCompanies(mockCompanies);
      if (mockCompanies.length > 0) {
        setSelectedCompanyId(mockCompanies[0].id);
        setFormData({ ...formData, companyId: mockCompanies[0].id });
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

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
          accentColor: '#007bff',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Widgets</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Widget
            </button>
          </div>

          {/* Company Selection */}
          {companies.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.plan})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Create Widget Form */}
          {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold mb-4">Create New Widget</h2>
              <form onSubmit={handleCreateWidget}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Widget Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Main Website Chat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="block w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create Widget
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Widgets List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {widgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No widgets found. Create your first widget!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {widgets.map((widget) => (
                  <li key={widget.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{widget.name}</h3>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              widget.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {widget.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <p>Widget Key: {widget.widgetKey}</p>
                          <p>Company: {widget.company.name}</p>
                          <p>Chat Messages: {widget._count.chatLogs}</p>
                          <p>Created: {new Date(widget.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-2 flex items-center">
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: widget.accentColor }}
                          ></div>
                          <span className="text-sm text-gray-500">
                            Accent Color: {widget.accentColor}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyEmbedCode(widget.widgetKey)}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                          Copy Embed Code
                        </button>
                        <button
                          onClick={() => handleToggleActive(widget.widgetKey, widget.isActive)}
                          className={`${
                            widget.isActive
                              ? 'bg-red-500 hover:bg-red-700'
                              : 'bg-green-500 hover:bg-green-700'
                          } text-white font-bold py-2 px-4 rounded text-sm`}
                        >
                          {widget.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
