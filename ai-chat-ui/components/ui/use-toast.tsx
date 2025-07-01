import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>([]);

  const toast = (toastData: Toast) => {
    // In a real implementation, this would show a toast notification
    // For now, we'll just log it
    console.log('Toast:', toastData);
    setToasts((prev) => [...prev, toastData]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return { toast };
}
