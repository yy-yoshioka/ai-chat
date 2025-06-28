import React, { useState, useEffect, FC } from 'react';
import Script from 'next/script';
import { API_BASE_URL, COMPANY_NAME } from '@/app/_config';

interface Widget {
  widgetKey: string;
  name: string;
  accentColor: string;
}

interface WidgetResponse {
  companyName: string;
  widgets: Widget[];
}

const DynamicWidgetLoader: FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available widgets dynamically
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/widgets/keys/${encodeURIComponent(COMPANY_NAME)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch widgets: ${response.status}`);
        }

        const data: WidgetResponse = await response.json();
        setWidgets(data.widgets);

        // Automatically select the first widget (or legacy widget if available)
        const legacyWidget = data.widgets.find((w) => w.widgetKey === 'test-widget-key-1');
        const defaultWidget = legacyWidget || data.widgets[0];
        setSelectedWidget(defaultWidget);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  if (loading) {
    return <div>Loading widgets...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dynamic Widget Loader Demo</h2>

      {/* Widget Selection */}
      <div className="mb-4">
        <label className="block mb-2">Select Widget:</label>
        <select
          value={selectedWidget?.widgetKey || ''}
          onChange={(e) => {
            const widget = widgets.find((w) => w.widgetKey === e.target.value);
            setSelectedWidget(widget || null);
          }}
          className="border p-2 rounded"
        >
          {widgets.map((widget) => (
            <option key={widget.widgetKey} value={widget.widgetKey}>
              {widget.name} ({widget.widgetKey.length > 20 ? 'New Format' : 'Legacy'})
            </option>
          ))}
        </select>
      </div>

      {/* Widget Info */}
      {selectedWidget && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold">{selectedWidget.name}</h3>
          <p>Key: {selectedWidget.widgetKey}</p>
          <p>
            Color:{' '}
            <span style={{ color: selectedWidget.accentColor }}>{selectedWidget.accentColor}</span>
          </p>
        </div>
      )}

      {/* Dynamic Script Loading */}
      {selectedWidget && (
        <Script
          src={`${API_BASE_URL}/widget-loader/${selectedWidget.widgetKey}.v1.js`}
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Widget script loaded successfully for:', selectedWidget.name);
          }}
          onError={(e) => {
            console.error('Widget script failed to load:', e);
          }}
        />
      )}

      {/* Available Widgets List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Available Widgets:</h3>
        <div className="grid gap-2">
          {widgets.map((widget) => (
            <div key={widget.widgetKey} className="p-3 border rounded">
              <div className="font-medium">{widget.name}</div>
              <div className="text-sm text-gray-600">Key: {widget.widgetKey}</div>
              <div className="text-sm">
                Color: <span style={{ color: widget.accentColor }}>{widget.accentColor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicWidgetLoader;
