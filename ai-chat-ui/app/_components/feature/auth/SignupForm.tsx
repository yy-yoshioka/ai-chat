'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { isValidEmail, isValidPassword } from '@/app/_utils/auth/validation';
import { PASSWORD_MIN_LENGTH } from '@/app/_config/auth/constants';

export const SignupForm: React.FC = () => {
  /* ------------- State ------------- */
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  /* ------------- Handler ------------- */
  const onChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = form;

    // --- validation ---
    if (!isValidEmail(email)) {
      setError('メールアドレスの形式が正しくありません');
      return;
    }
    if (!isValidPassword(password)) {
      setError(`パスワードは最低 ${PASSWORD_MIN_LENGTH} 文字です`);
      return;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    // --- signup ---
    try {
      setPending(true);
      setError('');
      const ok = await signup(email, password, name || undefined);
      if (!ok) throw new Error('failed');

      router.push('/onboarding/step-plan');
    } catch (err) {
      console.error(err);
      setError('新規登録に失敗しました');
    } finally {
      setPending(false);
    }
  };

  /* ------------- View ------------- */
  return (
    <>
      {error && (
        <p className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 text-sm">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit}>
        {/* Name (optional) */}
        <Input
          id="name"
          label="お名前 (任意)"
          type="text"
          placeholder="山田 太郎"
          value={form.name}
          onChange={onChange('name')}
        />

        {/* Email */}
        <Input
          id="email"
          label="メールアドレス"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={onChange('email')}
        />

        {/* Password */}
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

        {/* Confirm */}
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

        {/* Submit button */}
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

/* ---------- 小さな汎用 Input コンポーネント ---------- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ id, label, children, className, ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-slate-800 text-sm font-semibold mb-2">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${className ?? ''}`}
    />
    {children}
  </div>
);
