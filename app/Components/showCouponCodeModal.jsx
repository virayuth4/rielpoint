'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ShowCouponCodeModal({ state, onClose, merchantName }) {
  return (
    <Dialog open={state.open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Your {merchantName} coupon</DialogTitle>
          <DialogDescription>
            Show this code when you check out on Telegram or Instagram to receive cashback.
          </DialogDescription>
        </DialogHeader>

        {state.loading && (
          <p className="py-4 text-sm text-muted-foreground">Generating your code…</p>
        )}

        {state.error && (
          <p className="py-4 text-sm text-destructive">{state.error}</p>
        )}

        {state.code && (
          <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-3">
            <span className="font-mono text-lg font-semibold text-violet-900">
              {state.code}
            </span>
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(state.code)}
            >
              Copy
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}