import { useEffect, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'error';

export function useCopyQuote(resetDelayMs = 2200) {
  const [status, setStatus] = useState<CopyState>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatus('idle');
    }, resetDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [status, resetDelayMs]);

  const copy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setStatus('copied');
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  };

  return {
    status,
    copy,
  };
}
