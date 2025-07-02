#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 移行対象ファイルを検索
const files = glob.sync('app/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/*.test.{ts,tsx}']
});

let totalFiles = 0;
let swrUsages = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let hasSwrUsage = false;

  // import文の検査
  if (content.includes("from 'swr'") || content.includes('from "swr"')) {
    hasSwrUsage = true;
  }

  // useSWRパターンの検査
  if (content.includes('useSWR(') || content.includes('useSWR<')) {
    hasSwrUsage = true;
  }
  
  // useSWRMutationパターンの検査
  if (content.includes('useSWRMutation(')) {
    hasSwrUsage = true;
  }

  if (hasSwrUsage) {
    totalFiles++;
    
    // 詳細な使用パターンを抽出
    const patterns = [];
    
    // Import patterns
    const importMatches = content.match(/import.*from\s+['"]swr['"]/g);
    if (importMatches) {
      patterns.push(...importMatches);
    }
    
    // useSWR patterns
    const useSWRMatches = content.match(/useSWR[^(]*\([^)]+\)/g);
    if (useSWRMatches) {
      patterns.push(...useSWRMatches);
    }
    
    swrUsages.push({
      file,
      patterns
    });
  }
});

console.log('=== SWR to React Query Migration Report ===\n');
console.log(`Total files using SWR: ${totalFiles}\n`);

swrUsages.forEach(({ file, patterns }) => {
  console.log(`📝 ${file}`);
  patterns.forEach(pattern => {
    console.log(`   - ${pattern.trim()}`);
  });
  console.log('');
});

console.log('\n⚠️  自動移行を開始する前に、各ファイルを手動で確認してください。');
console.log('📋 移行順序の推奨:');
console.log('   1. シンプルなGETリクエスト (useQuery)');
console.log('   2. 条件付きフェッチ (enabled オプション)');
console.log('   3. ミューテーション (useMutation)');
console.log('   4. 楽観的更新 (onMutate, onError, onSettled)');