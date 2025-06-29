'use client';

import { useLoginForm } from '@/app/_hooks/auth/useLoginForm';
import { LoginFormFields } from './LoginFormFields';
import { LoginFormActions } from './LoginFormActions';

export const LoginForm: React.FC = () => {
  const { form, state, actions } = useLoginForm();

  return (
    <>
      {state.error && (
        <p className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6 text-sm">
          {state.error}
        </p>
      )}

      <LoginFormFields
        email={form.email}
        password={form.password}
        submitting={state.submitting}
        onEmailChange={actions.setEmail}
        onPasswordChange={actions.setPassword}
        onSubmit={actions.handleSubmit}
      />

      <LoginFormActions
        submitting={state.submitting}
        onQuickLogin={actions.handleQuickLogin}
      />
    </>
  );
};
