import { useState, useEffect } from 'react';

interface CheckoutSession {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  trialEnd?: string;
  isTrialActive: boolean;
}

export function useCheckoutSession(sessionId: string | null) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('セッションIDが見つかりません');
      setLoading(false);
      return;
    }

    // Simulate fetching session data
    const fetchSession = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSession({
          id: sessionId,
          planName: 'Pro Plan',
          amount: 2980,
          currency: 'jpy',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          isTrialActive: true,
        });
      } catch {
        setError('セッション情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, loading, error };
}
