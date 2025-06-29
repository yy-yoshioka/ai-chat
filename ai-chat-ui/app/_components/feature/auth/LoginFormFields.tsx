interface LoginFormFieldsProps {
  email: string;
  password: string;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginFormFields({
  email,
  password,
  submitting,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6">
        <label htmlFor="email" className="block text-slate-800 text-sm font-semibold mb-2">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <label htmlFor="password" className="block text-slate-800 text-sm font-semibold mb-2">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition ${
          submitting ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {submitting ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
