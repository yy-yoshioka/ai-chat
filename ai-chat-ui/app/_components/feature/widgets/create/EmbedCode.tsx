import React from 'react';

interface EmbedCodeProps {
  embedCode: string;
}

export function EmbedCode({ embedCode }: EmbedCodeProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">埋め込みコード</h3>
      <div className="bg-gray-900 rounded-lg p-4 text-white text-sm font-mono overflow-x-auto">
        {embedCode}
      </div>
      <p className="text-sm text-gray-500 mt-2">このコードをサイトのHTMLに貼り付けてください</p>
    </div>
  );
}
