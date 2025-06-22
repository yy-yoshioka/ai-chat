import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dashboard layout types and functions
interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'activity' | 'health';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data?: any;
  config?: Record<string, unknown>;
}

interface DashboardLayout {
  widgets: DashboardWidget[];
  grid: { cols: number; rows: number };
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    theme: 'light' | 'dark';
  };
}

// Mock layout reducer
type LayoutAction =
  | { type: 'ADD_WIDGET'; payload: DashboardWidget }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<DashboardWidget> } }
  | { type: 'DELETE_WIDGET'; payload: string }
  | { type: 'MOVE_WIDGET'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'RESIZE_WIDGET'; payload: { id: string; size: { w: number; h: number } } }
  | { type: 'RESET_LAYOUT'; payload: DashboardLayout }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<DashboardLayout['settings']> };

function layoutReducer(state: DashboardLayout, action: LayoutAction): DashboardLayout {
  switch (action.type) {
    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };

    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.payload.id ? { ...widget, ...action.payload.updates } : widget
        ),
      };

    case 'DELETE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter((widget) => widget.id !== action.payload),
      };

    case 'MOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.payload.id
            ? { ...widget, position: { ...widget.position, ...action.payload.position } }
            : widget
        ),
      };

    case 'RESIZE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.payload.id
            ? { ...widget, position: { ...widget.position, ...action.payload.size } }
            : widget
        ),
      };

    case 'RESET_LAYOUT':
      return action.payload;

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

// Mock layout validation functions
function validateWidget(widget: DashboardWidget): boolean {
  return !!(
    widget.id &&
    widget.type &&
    widget.title &&
    widget.position &&
    widget.position.x >= 0 &&
    widget.position.y >= 0 &&
    widget.position.w > 0 &&
    widget.position.h > 0
  );
}

function validateLayout(layout: DashboardLayout): boolean {
  return !!(
    layout.widgets &&
    Array.isArray(layout.widgets) &&
    layout.widgets.every(validateWidget) &&
    layout.grid &&
    layout.grid.cols > 0 &&
    layout.grid.rows > 0 &&
    layout.settings
  );
}

function detectCollisions(widgets: DashboardWidget[]): string[] {
  const collisions: string[] = [];

  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      const widget1 = widgets[i];
      const widget2 = widgets[j];

      const overlap = !(
        widget1.position.x >= widget2.position.x + widget2.position.w ||
        widget2.position.x >= widget1.position.x + widget1.position.w ||
        widget1.position.y >= widget2.position.y + widget2.position.h ||
        widget2.position.y >= widget1.position.y + widget1.position.h
      );

      if (overlap) {
        collisions.push(`${widget1.id}-${widget2.id}`);
      }
    }
  }

  return collisions;
}

describe('Dashboard Layout Reducer', () => {
  let initialState: DashboardLayout;

  beforeEach(() => {
    initialState = {
      widgets: [
        {
          id: 'widget-1',
          type: 'stat',
          title: 'Total Users',
          position: { x: 0, y: 0, w: 3, h: 2 },
          data: { value: 1250, icon: '👥', color: 'blue' },
        },
        {
          id: 'widget-2',
          type: 'chart',
          title: 'Messages Over Time',
          position: { x: 3, y: 0, w: 6, h: 4 },
          data: { chartType: 'line', data: [] },
        },
      ],
      grid: { cols: 12, rows: 8 },
      settings: {
        autoRefresh: true,
        refreshInterval: 30,
        theme: 'light',
      },
    };
  });

  describe('ADD_WIDGET', () => {
    it('should add a new widget to the layout', () => {
      const newWidget: DashboardWidget = {
        id: 'widget-3',
        type: 'activity',
        title: 'Recent Activity',
        position: { x: 0, y: 2, w: 6, h: 3 },
      };

      const result = layoutReducer(initialState, {
        type: 'ADD_WIDGET',
        payload: newWidget,
      });

      expect(result.widgets).toHaveLength(3);
      expect(result.widgets[2]).toEqual(newWidget);
      expect(result.widgets[0]).toEqual(initialState.widgets[0]); // Ensure existing widgets unchanged
    });

    it('should maintain grid and settings when adding widget', () => {
      const newWidget: DashboardWidget = {
        id: 'widget-3',
        type: 'health',
        title: 'System Health',
        position: { x: 6, y: 2, w: 6, h: 3 },
      };

      const result = layoutReducer(initialState, {
        type: 'ADD_WIDGET',
        payload: newWidget,
      });

      expect(result.grid).toEqual(initialState.grid);
      expect(result.settings).toEqual(initialState.settings);
    });
  });

  describe('UPDATE_WIDGET', () => {
    it('should update specific widget properties', () => {
      const result = layoutReducer(initialState, {
        type: 'UPDATE_WIDGET',
        payload: {
          id: 'widget-1',
          updates: { title: 'Updated Total Users', data: { value: 1500 } },
        },
      });

      const updatedWidget = result.widgets.find((w) => w.id === 'widget-1');
      expect(updatedWidget?.title).toBe('Updated Total Users');
      expect(updatedWidget?.data).toEqual({ value: 1500 });
      expect(updatedWidget?.type).toBe('stat'); // Unchanged properties should remain
    });

    it('should not affect other widgets when updating one', () => {
      const result = layoutReducer(initialState, {
        type: 'UPDATE_WIDGET',
        payload: {
          id: 'widget-1',
          updates: { title: 'New Title' },
        },
      });

      const unchangedWidget = result.widgets.find((w) => w.id === 'widget-2');
      expect(unchangedWidget).toEqual(initialState.widgets[1]);
    });

    it('should handle non-existent widget ID gracefully', () => {
      const result = layoutReducer(initialState, {
        type: 'UPDATE_WIDGET',
        payload: {
          id: 'non-existent',
          updates: { title: 'New Title' },
        },
      });

      expect(result.widgets).toEqual(initialState.widgets);
    });
  });

  describe('DELETE_WIDGET', () => {
    it('should remove widget with specified ID', () => {
      const result = layoutReducer(initialState, {
        type: 'DELETE_WIDGET',
        payload: 'widget-1',
      });

      expect(result.widgets).toHaveLength(1);
      expect(result.widgets[0].id).toBe('widget-2');
    });

    it('should handle non-existent widget ID gracefully', () => {
      const result = layoutReducer(initialState, {
        type: 'DELETE_WIDGET',
        payload: 'non-existent',
      });

      expect(result.widgets).toEqual(initialState.widgets);
    });
  });

  describe('MOVE_WIDGET', () => {
    it('should update widget position', () => {
      const result = layoutReducer(initialState, {
        type: 'MOVE_WIDGET',
        payload: {
          id: 'widget-1',
          position: { x: 2, y: 3 },
        },
      });

      const movedWidget = result.widgets.find((w) => w.id === 'widget-1');
      expect(movedWidget?.position.x).toBe(2);
      expect(movedWidget?.position.y).toBe(3);
      expect(movedWidget?.position.w).toBe(3); // Width should remain unchanged
      expect(movedWidget?.position.h).toBe(2); // Height should remain unchanged
    });
  });

  describe('RESIZE_WIDGET', () => {
    it('should update widget size', () => {
      const result = layoutReducer(initialState, {
        type: 'RESIZE_WIDGET',
        payload: {
          id: 'widget-2',
          size: { w: 8, h: 6 },
        },
      });

      const resizedWidget = result.widgets.find((w) => w.id === 'widget-2');
      expect(resizedWidget?.position.w).toBe(8);
      expect(resizedWidget?.position.h).toBe(6);
      expect(resizedWidget?.position.x).toBe(3); // Position should remain unchanged
      expect(resizedWidget?.position.y).toBe(0);
    });
  });

  describe('RESET_LAYOUT', () => {
    it('should replace entire layout', () => {
      const newLayout: DashboardLayout = {
        widgets: [
          {
            id: 'new-widget',
            type: 'stat',
            title: 'New Layout',
            position: { x: 0, y: 0, w: 12, h: 2 },
          },
        ],
        grid: { cols: 16, rows: 10 },
        settings: {
          autoRefresh: false,
          refreshInterval: 60,
          theme: 'dark',
        },
      };

      const result = layoutReducer(initialState, {
        type: 'RESET_LAYOUT',
        payload: newLayout,
      });

      expect(result).toEqual(newLayout);
    });
  });

  describe('UPDATE_SETTINGS', () => {
    it('should update specific settings while preserving others', () => {
      const result = layoutReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { theme: 'dark', refreshInterval: 60 },
      });

      expect(result.settings.theme).toBe('dark');
      expect(result.settings.refreshInterval).toBe(60);
      expect(result.settings.autoRefresh).toBe(true); // Should remain unchanged
    });
  });
});

describe('Layout Validation', () => {
  describe('validateWidget', () => {
    it('should validate correct widget', () => {
      const validWidget: DashboardWidget = {
        id: 'test-widget',
        type: 'stat',
        title: 'Test Widget',
        position: { x: 0, y: 0, w: 3, h: 2 },
      };

      expect(validateWidget(validWidget)).toBe(true);
    });

    it('should reject widget with missing required fields', () => {
      const invalidWidgets = [
        { type: 'stat', title: 'Test', position: { x: 0, y: 0, w: 3, h: 2 } }, // Missing id
        { id: 'test', title: 'Test', position: { x: 0, y: 0, w: 3, h: 2 } }, // Missing type
        { id: 'test', type: 'stat', position: { x: 0, y: 0, w: 3, h: 2 } }, // Missing title
        { id: 'test', type: 'stat', title: 'Test' }, // Missing position
      ];

      invalidWidgets.forEach((widget) => {
        expect(validateWidget(widget as DashboardWidget)).toBe(false);
      });
    });

    it('should reject widget with invalid position values', () => {
      const invalidPositions = [
        { x: -1, y: 0, w: 3, h: 2 }, // Negative x
        { x: 0, y: -1, w: 3, h: 2 }, // Negative y
        { x: 0, y: 0, w: 0, h: 2 }, // Zero width
        { x: 0, y: 0, w: 3, h: 0 }, // Zero height
      ];

      invalidPositions.forEach((position) => {
        const widget: DashboardWidget = {
          id: 'test',
          type: 'stat',
          title: 'Test',
          position,
        };
        expect(validateWidget(widget)).toBe(false);
      });
    });
  });

  describe('validateLayout', () => {
    it('should validate correct layout', () => {
      const validLayout: DashboardLayout = {
        widgets: [
          {
            id: 'widget-1',
            type: 'stat',
            title: 'Test',
            position: { x: 0, y: 0, w: 3, h: 2 },
          },
        ],
        grid: { cols: 12, rows: 8 },
        settings: { autoRefresh: true, refreshInterval: 30, theme: 'light' },
      };

      expect(validateLayout(validLayout)).toBe(true);
    });

    it('should reject layout with invalid widgets', () => {
      const invalidLayout: DashboardLayout = {
        widgets: [
          {
            id: '',
            type: 'stat',
            title: 'Invalid',
            position: { x: 0, y: 0, w: 3, h: 2 },
          },
        ],
        grid: { cols: 12, rows: 8 },
        settings: { autoRefresh: true, refreshInterval: 30, theme: 'light' },
      };

      expect(validateLayout(invalidLayout)).toBe(false);
    });

    it('should reject layout with invalid grid', () => {
      const invalidGrids = [
        { cols: 0, rows: 8 }, // Zero columns
        { cols: 12, rows: 0 }, // Zero rows
        { cols: -1, rows: 8 }, // Negative columns
      ];

      invalidGrids.forEach((grid) => {
        const layout: DashboardLayout = {
          widgets: [],
          grid,
          settings: { autoRefresh: true, refreshInterval: 30, theme: 'light' },
        };
        expect(validateLayout(layout)).toBe(false);
      });
    });
  });
});

describe('Collision Detection', () => {
  it('should detect overlapping widgets', () => {
    const overlappingWidgets: DashboardWidget[] = [
      {
        id: 'widget-1',
        type: 'stat',
        title: 'Widget 1',
        position: { x: 0, y: 0, w: 4, h: 2 },
      },
      {
        id: 'widget-2',
        type: 'stat',
        title: 'Widget 2',
        position: { x: 2, y: 1, w: 4, h: 2 }, // Overlaps with widget-1
      },
    ];

    const collisions = detectCollisions(overlappingWidgets);
    expect(collisions).toContain('widget-1-widget-2');
  });

  it('should not detect collision for non-overlapping widgets', () => {
    const nonOverlappingWidgets: DashboardWidget[] = [
      {
        id: 'widget-1',
        type: 'stat',
        title: 'Widget 1',
        position: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        id: 'widget-2',
        type: 'stat',
        title: 'Widget 2',
        position: { x: 3, y: 0, w: 3, h: 2 }, // Adjacent, no overlap
      },
    ];

    const collisions = detectCollisions(nonOverlappingWidgets);
    expect(collisions).toHaveLength(0);
  });

  it('should handle edge-touching widgets correctly', () => {
    const edgeTouchingWidgets: DashboardWidget[] = [
      {
        id: 'widget-1',
        type: 'stat',
        title: 'Widget 1',
        position: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        id: 'widget-2',
        type: 'stat',
        title: 'Widget 2',
        position: { x: 3, y: 0, w: 3, h: 2 }, // Shares edge, no overlap
      },
    ];

    const collisions = detectCollisions(edgeTouchingWidgets);
    expect(collisions).toHaveLength(0);
  });
});
