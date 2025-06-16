import { useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  type: 'tooltip' | 'modal' | 'highlight';
}

const ProductTourPage = () => {
  const [tours, setTours] = useState<TourStep[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const addTour = () => {
    const newTour: TourStep = {
      id: `tour-${Date.now()}`,
      title: 'New Step',
      content: 'Step description',
      target: '#element',
      type: 'tooltip',
    };
    setTours([...tours, newTour]);
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Interactive Product Tour Builder</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{tours.length}</div>
            <div className="text-sm text-gray-600">ツアーステップ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">完了率</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-orange-600">Step 3</div>
            <div className="text-sm text-gray-600">最多離脱ポイント</div>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + ステップ追加
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">ツアーエディター</h2>
        <div className="space-y-3">
          {tours.map((tour, index) => (
            <div key={tour.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {index + 1}. {tour.title}
                </div>
                <div className="text-sm text-gray-600">{tour.content}</div>
                <div className="text-xs text-gray-500">Target: {tour.target}</div>
              </div>
              <div className="flex space-x-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    tour.type === 'tooltip'
                      ? 'bg-blue-100 text-blue-700'
                      : tour.type === 'modal'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {tour.type}
                </span>
                <button className="px-2 py-1 bg-gray-600 text-white text-xs rounded">編集</button>
              </div>
            </div>
          ))}

          {tours.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>ツアーステップがありません</p>
              <p className="text-sm">「ステップ追加」から開始してください</p>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">新しいステップ</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="ステップタイトル"
                className="w-full p-2 border rounded"
              />
              <textarea placeholder="説明" className="w-full p-2 border rounded h-20"></textarea>
              <input
                type="text"
                placeholder="ターゲット要素 (#id, .class)"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option value="tooltip">Tooltip</option>
                <option value="modal">Modal</option>
                <option value="highlight">Highlight</option>
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={addTour}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  作成
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 rounded"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTourPage;
