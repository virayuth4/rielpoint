// app/auth/profileCache.js
let cache = null;
let cacheTimestamp = 0;
let inFlightRequest = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedProfile = () => {
  if (cache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cache;
  }
  return null;
};

export const setCachedProfile = (data) => {
  cache = data;
  cacheTimestamp = Date.now();
};

export const clearProfileCache = () => {
  cache = null;
  cacheTimestamp = 0;
};

// Dedupes concurrent calls — if ProfilePage mounts twice quickly,
// only one network request goes out
export const fetchProfileDeduped = async (fetcher) => {
  const cached = getCachedProfile();
  if (cached) return cached;

  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetcher().finally(() => {
    inFlightRequest = null;
  });

  return inFlightRequest;
};