// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

/* eslint import/no-anonymous-default-export: off */

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import boundaries from 'eslint-plugin-boundaries';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  /* 0) Next.js & Prettier 推奨 */
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:prettier/recommended'
  ) /* 1) 共通ルール */,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { boundaries },

    rules: {
      /* fetch 禁止（BFF 例外は下段） */
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: '❌ 直接 fetch せず app/_utils/fetcher.ts を使ってください。',
        },
      ],

      /* ファイル行数・関数行数 */
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],

      /* ---------- ▼ 追加：ネスト深さチェック ---------- */
      /* コードブロック（if, for, 関数 …）のネスト段数 */
      'max-depth': ['warn', 4], // 4 段まで

      /* callback ネスト（then, setTimeout, コールバックなど） */
      'max-nested-callbacks': ['warn', 3], // 3 段まで
    },
  } /* 2) 例外：BFF ルート & 共通 fetcher & テストは fetch OK */,
  {
    files: ['**/api/**/route.ts', 'app/_utils/fetcher.ts', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-globals': 'off' },
  } /* 3) Zod は _schemas/** 限定 */,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['app/_schemas/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          name: 'zod',
          message:
            '📐 Zod スキーマは app/_schemas/** に定義してください（route や hooks では import のみ可）。',
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
];

export default eslintConfig;
