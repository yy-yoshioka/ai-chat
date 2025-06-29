'use client';

import { useSignupForm } from '@/app/_hooks/auth/useSignupForm';
import { Input } from '@/app/_components/ui/Input';
import { PASSWORD_MIN_LENGTH } from '@/app/_config/auth/constants';

export const SignupForm: React.FC = () => {
  const { form, error, pending, onChange, onSubmit } = useSignupForm();

  return (
    <>
      {error && (
        <p className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit}>
        <Input
          id="name"
          label="お名前 (任意)"
          type="text"
          placeholder="山田 太郎"
          value={form.name}
          onChange={onChange('name')}
        />

        <Input
          id="email"
          label="メールアドレス"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={onChange('email')}
        />

        <Input
          id="password"
          label="パスワード"
          type="password"
          placeholder="••••••••"
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={form.password}
          onChange={onChange('password')}
        >
          <p className="text-xs text-slate-500 mt-1">
            {PASSWORD_MIN_LENGTH} 文字以上で入力してください
          </p>
        </Input>

        <Input
          id="confirm"
          label="パスワード（確認）"
          type="password"
          placeholder="••••••••"
          required
          minLength={PASSWORD_MIN_LENGTH}
          value={form.confirmPassword}
          onChange={onChange('confirmPassword')}
        />

        <button
          type="submit"
          disabled={pending}
          className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition ${
            pending ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {pending ? '登録中…' : '新規登録'}
        </button>
      </form>
    </>
  );
};
