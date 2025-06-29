import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { isValidEmail, isValidPassword } from '@/app/_utils/auth/validation';
import { PASSWORD_MIN_LENGTH } from '@/app/_config/auth/constants';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useSignupForm() {
  const [form, setForm] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const onChange = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = form;

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

  return {
    form,
    error,
    pending,
    onChange,
    onSubmit,
  };
}
