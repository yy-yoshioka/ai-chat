'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium">
              🚀 早期アクセスベータ版受付中
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            顧客サポート革命
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent block">
              AI チャットボットで
            </span>
            <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              売上 3倍UP
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            <strong>わずか5分の設置</strong>で、24時間365日対応の AI
            チャットボットがあなたのウェブサイトに。
            <br />
            Intercom や Zendesk の<strong>1/10のコスト</strong>で、
            <strong>顧客満足度92%向上</strong>、<strong>問い合わせ対応時間80%短縮</strong>
            を実現。
          </p>

          {/* Key Benefits Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              '💰 月額コスト90%削減',
              '⚡ 5分で設置完了',
              '🎯 CV率3.2倍向上',
              '📈 顧客満足度92%UP',
              '🌍 100言語対応',
              '🔒 SOC2準拠',
            ].map((benefit, index) => (
              <span
                key={index}
                className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 shadow-sm"
              >
                {benefit}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              14日間無料トライアル
            </Link>
            <a
              href="#beta-invite"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
            >
              ベータ版早期アクセス
            </a>
          </div>
        </div>
      </div>

      {/* Social Proof Ticker */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm mb-4">信頼される企業に選ばれています</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {['スタートアップA', 'EC企業B', 'SaaS会社C', 'メディアD', 'コンサルE'].map(
            (company, index) => (
              <div key={index} className="text-gray-400 font-medium text-lg">
                {company}
              </div>
            )
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-indigo-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
      </div>
    </section>
  );
}
