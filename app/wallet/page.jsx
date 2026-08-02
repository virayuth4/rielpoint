'use client';

import { useEffect, useState } from 'react';
import { Inter, Space_Mono } from 'next/font/google';
import { getAuth } from 'firebase/auth'; // adjust to however you get the current user's ID token
import authenticatedFetch from '../auth/authenticatedFetch';
import { onAuthStateChanged } from 'firebase/auth';


const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
});

// --- mapping helpers -------------------------------------------------

function initialFor(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatCurrency(amount, currency) {
  if (amount == null) return '';
  const n = Number(amount);
  return `${currency ?? 'USD'} ${n.toFixed(2)}`;
}

// Maps a raw row from rielpoint_point_transactions -> the shape the UI wants.
// Matches the actual API response shape:
// { id, merchant_id, merchant_name, staff_id, customer_phone, amount, usd_amount,
//   currency, exchange_rate, points, points_rate, previous_balance, new_balance,
//   idempotency_key, created_at }
function mapTransaction(row) {
  return {
    id: row.id,
    shop: row.merchant_name ?? 'Unknown shop',
    initial: initialFor(row.merchant_name),
    date: formatDate(row.created_at),
    time: formatTime(row.created_at),
    points: row.points,
    amountLabel: formatCurrency(row.usd_amount ?? row.amount, row.currency),
    code: row.idempotency_key ? row.idempotency_key.slice(0, 8) : '',
    newBalance: row.new_balance,
  };
}

// --- data hook ---------------------------------------------------------

function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'



  useEffect(() => {
    let cancelled = false;
      const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
        // truly signed out
        setStatus('error');
        return;
        }
        load(user); // now safe to fetch
    });
    return () => unsubscribe();

    async function load() {
      try {


        

        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/points/transactions`);

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          const rows = data.transactions ?? [];
          const mapped = rows.map(mapTransaction);
          setTransactions(mapped);

          // Rows appear to come back most-recent-first (id: 4 was the only/most
          // recent row in the sample). Use its new_balance as the current balance.
          // If your API instead returns oldest-first, swap to rows[rows.length - 1].
          if (rows.length > 0) {
            setBalance(rows[0].new_balance);
          }

          setStatus('success');
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, balance, status };
}

// --- page ---------------------------------------------------------------

export default function WalletPage() {
  const { transactions, balance, status } = useTransactions();

  return (
    <main
      className={`${inter.variable} ${mono.variable} min-h-screen`}
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-body)' }}
    >
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        {/* Page label */}
        <p
          className="text-[11px] uppercase tracking-[0.18em] mb-6"
          style={{ color: '#9A9A9A' }}
        >
          Wallet
        </p>

        {/* Balance card */}
        <div
          className="rounded-2xl px-6 py-7 mb-10"
          style={{ background: '#0F0F0E' }}
        >
          <div className="flex items-center justify-between mb-8">
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: '#F5F5F0' }}
            >
              RielPoint
            </span>
            <span
              className="h-6 w-9 rounded-sm"
              style={{ background: '#1F5C3F' }}
              aria-hidden="true"
            />
          </div>

          <p className="text-xs mb-1" style={{ color: '#9A9A94' }}>
            Available balance
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-semibold"
              style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}
            >
              {(balance ?? 0).toLocaleString()}
            </span>
            <span className="text-sm" style={{ color: '#9A9A94' }}>
              pts
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span
              className="text-xs tracking-wider"
              style={{ color: '#6E6E68', fontFamily: 'var(--font-mono)' }}
            >
              •••• •••• •••• 4821
            </span>
            <span className="text-xs" style={{ color: '#6E6E68' }}>
              Sochea N.
            </span>
          </div>
        </div>

        {/* History */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
            Points history
          </h2>
          {status === 'success' && (
            <span className="text-xs" style={{ color: '#9A9A9A' }}>
              {transactions.length} this month
            </span>
          )}
        </div>

        {status === 'loading' && (
          <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
            Loading redemptions…
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
            Couldn&apos;t load your redemption history. Pull to refresh or try again later.
          </p>
        )}

        {status === 'success' && (
          <div>
            {transactions.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid #EFEFED',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: '#F3F3EF', color: '#0F0F0E' }}
                  >
                    {item.initial}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
                      {item.shop}
                    </p>
                    <p className="text-xs" style={{ color: '#9A9A9A' }}>
                      {item.date} &middot; {item.time}
                      {item.amountLabel ? ` \u00b7 ${item.amountLabel}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className="text-sm font-medium"
                    style={{ color: '#1F5C3F' }}
                  >
                    {item.points != null ? `+${item.points} pts` : ''}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: '#B8B8B2', fontFamily: 'var(--font-mono)' }}
                  >
                    {item.code}
                  </p>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                No redemptions yet.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}