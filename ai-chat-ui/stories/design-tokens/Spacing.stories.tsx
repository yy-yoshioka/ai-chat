import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design Tokens/Spacing',
  parameters: {
    docs: {
      description: {
        component: 'Spacing scale used for margins, padding, and gaps throughout the application',
      },
    },
  },
};

export default meta;

const SpacingItem = ({ name, value, pixels }: { name: string; value: string; pixels: string }) => (
  <div className="flex items-center gap-4 p-4 border rounded-lg">
    <div className="flex items-center gap-2">
      <div className="bg-blue-500" style={{ width: pixels, height: '32px' }} />
      <div className="w-px h-8 bg-gray-300" />
    </div>
    <div>
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">
        <span className="font-mono">{value}</span> = {pixels}
      </p>
    </div>
  </div>
);

export const SpacingScale: StoryObj = {
  render: () => (
    <div className="grid gap-4">
      <SpacingItem name="Space 1" value="space-1" pixels="4px" />
      <SpacingItem name="Space 2" value="space-2" pixels="8px" />
      <SpacingItem name="Space 3" value="space-3" pixels="12px" />
      <SpacingItem name="Space 4" value="space-4" pixels="16px" />
      <SpacingItem name="Space 6" value="space-6" pixels="24px" />
      <SpacingItem name="Space 8" value="space-8" pixels="32px" />
      <SpacingItem name="Space 12" value="space-12" pixels="48px" />
      <SpacingItem name="Space 16" value="space-16" pixels="64px" />
    </div>
  ),
};

export const PaddingExamples: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 inline-block">
        <div className="p-1 bg-blue-100">
          <div className="bg-blue-500 text-white px-2 py-1 text-sm">p-1 (4px)</div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 inline-block">
        <div className="p-2 bg-blue-100">
          <div className="bg-blue-500 text-white px-2 py-1 text-sm">p-2 (8px)</div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 inline-block">
        <div className="p-4 bg-blue-100">
          <div className="bg-blue-500 text-white px-2 py-1 text-sm">p-4 (16px)</div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 inline-block">
        <div className="p-6 bg-blue-100">
          <div className="bg-blue-500 text-white px-2 py-1 text-sm">p-6 (24px)</div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 inline-block">
        <div className="p-8 bg-blue-100">
          <div className="bg-blue-500 text-white px-2 py-1 text-sm">p-8 (32px)</div>
        </div>
      </div>
    </div>
  ),
};

export const MarginExamples: StoryObj = {
  render: () => (
    <div className="border-2 border-gray-200 p-4">
      <div className="bg-gray-100 inline-block">
        <div className="bg-blue-500 text-white px-3 py-2 text-sm">First Element</div>
      </div>

      <div className="bg-gray-100 inline-block mt-2">
        <div className="bg-green-500 text-white px-3 py-2 text-sm">mt-2 (8px margin-top)</div>
      </div>

      <div className="bg-gray-100 inline-block mt-4">
        <div className="bg-yellow-500 text-white px-3 py-2 text-sm">mt-4 (16px margin-top)</div>
      </div>

      <div className="bg-gray-100 inline-block mt-6">
        <div className="bg-red-500 text-white px-3 py-2 text-sm">mt-6 (24px margin-top)</div>
      </div>

      <div className="bg-gray-100 inline-block mt-8">
        <div className="bg-purple-500 text-white px-3 py-2 text-sm">mt-8 (32px margin-top)</div>
      </div>
    </div>
  ),
};

export const GapExamples: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">gap-2 (8px)</h3>
        <div className="flex gap-2 bg-gray-100 p-4 rounded">
          <div className="bg-blue-500 text-white px-3 py-2 text-sm rounded">Item 1</div>
          <div className="bg-blue-500 text-white px-3 py-2 text-sm rounded">Item 2</div>
          <div className="bg-blue-500 text-white px-3 py-2 text-sm rounded">Item 3</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">gap-4 (16px)</h3>
        <div className="flex gap-4 bg-gray-100 p-4 rounded">
          <div className="bg-green-500 text-white px-3 py-2 text-sm rounded">Item 1</div>
          <div className="bg-green-500 text-white px-3 py-2 text-sm rounded">Item 2</div>
          <div className="bg-green-500 text-white px-3 py-2 text-sm rounded">Item 3</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">gap-6 (24px)</h3>
        <div className="flex gap-6 bg-gray-100 p-4 rounded">
          <div className="bg-purple-500 text-white px-3 py-2 text-sm rounded">Item 1</div>
          <div className="bg-purple-500 text-white px-3 py-2 text-sm rounded">Item 2</div>
          <div className="bg-purple-500 text-white px-3 py-2 text-sm rounded">Item 3</div>
        </div>
      </div>
    </div>
  ),
};

export const ComponentSpacing: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Card Component</h3>
        <p className="text-gray-600 mb-4">Standard card with p-6 (24px) padding</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Action Button</button>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Card Header</h3>
          <p className="text-sm text-gray-600">With p-4 (16px) padding</p>
        </div>
        <div className="p-4">
          <p className="text-gray-700">Card body content with consistent spacing</p>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <button className="text-sm text-blue-600">Card Footer Action</button>
        </div>
      </div>
    </div>
  ),
};
