import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_hooks/auth/useAuth';
import { getRedirectPath } from '@/app/_utils/auth/redirect';
import { LOGIN_REDIRECT_DEFAULT, ADMIN_QUICK_CREDENTIALS } from '@/app/_config/auth/constants';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email と Password は必須です');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const ok = await login(email, password);
      if (!ok) throw new Error('Invalid email / password');

      router.push(getRedirectPath(LOGIN_REDIRECT_DEFAULT));
    } catch (err) {
      setError('ログインに失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      setSubmitting(true);
      const ok = await login(ADMIN_QUICK_CREDENTIALS.email, ADMIN_QUICK_CREDENTIALS.password);
      if (ok) router.push('/admin/org-selector');
    } catch {
      setError('Admin ログイン失敗');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form: { email, password },
    state: { error, submitting },
    actions: {
      setEmail,
      setPassword,
      handleSubmit,
      handleQuickLogin,
    },
  };
}
