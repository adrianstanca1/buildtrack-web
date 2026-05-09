'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { syncQueue } from '@/lib/offlineStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function SyncStatus() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    const count = await syncQueue.getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 5000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const pending = await syncQueue.getAll();
      // Replay each queued request via the api client (which will re-queue on failure)
      for (const item of pending) {
        const event = new CustomEvent('BUILDTRACK_REPLAY_REQUEST', {
          detail: item,
        });
        window.dispatchEvent(event);
        // Small delay to avoid overwhelming the server
        await new Promise((r) => setTimeout(r, 200));
      }
      await refreshCount();
    } finally {
      setIsSyncing(false);
    }
  };

  if (pendingCount === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Synced</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSync}
      disabled={!isOnline || isSyncing}
      className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
      title={isOnline ? 'Click to sync now' : 'Connect to internet to sync'}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
      <span>
        {isSyncing
          ? 'Syncing...'
          : `${pendingCount} pending ${pendingCount === 1 ? 'change' : 'changes'}`}
      </span>
    </button>
  );
}
