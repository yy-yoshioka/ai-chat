# Component Design Guidelines

## コンポーネント設計原則

### 1. 単一責任の原則

各コンポーネントは一つの責任のみを持つべきです。

```typescript
// ❌ 悪い例: 複数の責任を持つコンポーネント
function UserProfileWithChat() {
  // ユーザープロフィール表示 + チャット機能
}

// ✅ 良い例: 単一責任
function UserProfile() {
  // ユーザープロフィール表示のみ
}

function ChatWidget() {
  // チャット機能のみ
}
```

### 2. 合成可能性

小さなコンポーネントを組み合わせて複雑なUIを構築します。

```typescript
// Button.tsx
export function Button({ children, ...props }) {
  return <button {...props}>{children}</button>
}

// Modal.tsx
export function Modal({ children, isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children}
    </Dialog>
  )
}

// 組み合わせて使用
function DeleteConfirmation() {
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <p>削除してもよろしいですか？</p>
      <Button onClick={handleDelete}>削除</Button>
      <Button onClick={handleClose}>キャンセル</Button>
    </Modal>
  )
}
```

### 3. Props設計

#### TypeScript型定義

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

#### Default Props

```typescript
const defaultProps: Partial<ButtonProps> = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
};
```

### 4. スタイリング規約

#### Tailwind CSS使用

```typescript
const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  variants: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  },
  sizes: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
};
```

### 5. アクセシビリティ

#### ARIA属性

```typescript
function Button({ children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### キーボードナビゲーション

```typescript
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <Dialog
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </Dialog>
  )
}
```

## ディレクトリ構造

```
app/_components/
├── ui/                 # 基本UIコンポーネント
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── Modal/
├── feature/           # 機能固有コンポーネント
│   ├── chat/
│   ├── auth/
│   └── dashboard/
└── layout/           # レイアウトコンポーネント
    ├── Header/
    ├── Sidebar/
    └── Footer/
```

## テスト戦略

### Storybook

- コンポーネントの視覚的テスト
- 各stateの動作確認
- インタラクションテスト

### Unit Tests

- ロジックのテスト
- エッジケースの検証
- プロパティの検証

## パフォーマンス

### React.memo

```typescript
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data
}: {
  data: ComplexData
}) {
  // 重い計算処理
  return <div>{processedData}</div>
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id
})
```

### useMemo / useCallback

```typescript
function DataVisualization({ data }: { data: DataPoint[] }) {
  const processedData = useMemo(() => {
    return data.map(point => ({
      ...point,
      calculated: expensiveCalculation(point)
    }))
  }, [data])

  const handleClick = useCallback((id: string) => {
    // クリックハンドラー
  }, [])

  return <Chart data={processedData} onClick={handleClick} />
}
```

## コード品質

### ESLint Rules

- `react-hooks/rules-of-hooks`
- `react-hooks/exhaustive-deps`
- `@typescript-eslint/no-unused-vars`
- `jsx-a11y/accessible-emoji`

### Prettier設定

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```
