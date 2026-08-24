import Image from "next/image";

function formatDateRange(startAt, endAt, options = {}) {
  const { fallbackOpen = "From", includeYear = false } = options;
  const dateOpts = { 
    month: "short", 
    day: "numeric", 
    ...(includeYear && { year: "numeric" }) 
  };

  const start = startAt ? new Date(startAt).toLocaleDateString("en-US", dateOpts) : null;
  const end = endAt ? new Date(endAt).toLocaleDateString("en-US", dateOpts) : null;

  if (start && end) return `${start} – ${end}`;
  if (start && !end) return `From ${start}`; // or simply: `From ${start}`
  if (!start && end) return `Until ${end}`;
  
  return "Limited time offer"; // safer fallback than "Ongoing"
}
function isExpired(endAt) {
  if (!endAt) return false;
  return new Date(endAt).getTime() < Date.now();
}

function formatPostedDate(createdAt) {
  const date = new Date(createdAt);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;

  return `Posted ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}



export default function DealCard({ deal }) {
  const { merchant_name, title, description, promo, category, image_paths, start_at, end_at, map, created_at } = deal;

  const expired = isExpired(end_at);
  const image = image_paths?.[0];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl ">
      <div className="relative aspect-[5/5] w-full overflow-hidden rounded-xl bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}

        {promo && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow">
            {promo}
          </span>
        )}

         
          <div className="absolute inset-0 flex items-center justify-center ">
            <span className="absolute left-3 bottom-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-black ">
              {formatPostedDate(created_at)}
            </span>
          </div>
   

        {expired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
              Expired or Paused
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        
        <div className="flex items-center justify-between gap-2">
          
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-rose-600">
            {merchant_name}
          </p>
        
        </div>

        <h3 className="line-clamp-2 text-base font-bold text-slate-900">{title}</h3>

        {/* {description && (
          <p className="line-clamp-2 whitespace-pre-line text-sm text-slate-500">
            {description}
          </p>
        )} */}

        <div className="mt-auto font-black flex items-center justify-between pt-2 text-xs text-black">
          <span>Valid: {formatDateRange(start_at, end_at)}</span>
          {map && (
            <a
              href={map}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-rose-600 hover:underline"
            >
              Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}