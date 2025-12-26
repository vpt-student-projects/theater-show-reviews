import Link from "next/link";

type Performance = {
  id: number;
  attributes: {
    date?: string;
    time?: string;
    venue?: { data?: { id: number; attributes: { name?: string } } };
    place?: string;
    price?: string;
  };
};

export default async function Performances({ playId }: { playId: string }) {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const url = `${base}/api/performances?filters[play][id][$eq]=${encodeURIComponent(
    playId
  )}&populate=venue&sort=date:asc`;

  let items: Performance[] = [];
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      items = json?.data || [];
    } else {
      console.error("Performances fetch failed", res.status);
    }
  } catch (e) {
    console.error("Performances fetch error", e);
  }

  if (!items.length) {
    return (
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Ближайшие представления</h2>
        <div className="text-sm text-gray-500 italic">Представления пока не запланированы.</div>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-labelledby="performances-heading">
      <h2 id="performances-heading" className="text-lg font-semibold mb-4">Ближайшие представления</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => {
          const attr = p.attributes || {};
          const date = attr.date ? new Date(attr.date) : undefined;
          const dateStr = date
            ? date.toLocaleString("ru-RU", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Дата уточняется";
          const venue = attr.venue?.data?.attributes?.name || attr.place || "Место уточняется";

          return (
            <article
              key={p.id}
              className="bg-white shadow-sm rounded-lg p-4 flex flex-col justify-between border border-gray-100"
            >
              <div>
                <time className="block text-sm text-gray-600 mb-1" dateTime={attr.date || ""}>
                  {dateStr}
                </time>
                <h3 className="text-sm font-medium text-gray-800">{venue}</h3>
                {attr.price && <div className="text-sm text-indigo-600 mt-2">{attr.price}</div>}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/performance/${p.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md"
                >
                  Подробнее
                </Link>
                <span className="text-xs text-gray-500">ID: {p.id}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}