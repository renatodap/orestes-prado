'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ClearBriefingsButton() {
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const handleClear = async () => {
    if (!confirm('Apagar TODOS os briefings? Isso não pode ser desfeito.')) {
      return;
    }

    setIsClearing(true);
    try {
      const res = await fetch('/api/briefing/clear', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`${data.deleted} briefing(s) apagado(s)`);
        router.refresh();
      } else {
        alert('Erro ao apagar briefings');
      }
    } catch (error) {
      alert('Erro ao apagar briefings');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={isClearing}
      className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-colors"
    >
      {isClearing ? 'Apagando...' : 'TEMP: Apagar Todos Briefings'}
    </button>
  );
}
