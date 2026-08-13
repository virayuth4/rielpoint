export function formatCashback(offer) {
  if (!offer) return null;
  if (offer.cashback_type === "percentage" && offer.cashback_rate != null) {
    return `Up to ${offer.cashback_rate}% Cashback`;
  }
  if (offer.cashback_type === "fixed" && offer.fixed_cashback_amount != null) {
    return `Up to ${offer.currency || "$"} ${offer.fixed_cashback_amount} Cashback`;
  }
  return null;
}

export function bestOffer(offers) {
  const active = (offers || []).filter((o) => o.is_active);
  if (active.length === 0) return null;
  return active.reduce((best, o) => {
    const bestValue = best.cashback_rate ?? best.fixed_cashback_amount ?? 0;
    const value = o.cashback_rate ?? o.fixed_cashback_amount ?? 0;
    return value > bestValue ? o : best;
  }, active[0]);
}

export function endsInLabel(endAt) {
  if (!endAt) return null;
  const diffMs = new Date(endAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `Ends in ${hours}:${String(minutes).padStart(2, "0")}`;
}