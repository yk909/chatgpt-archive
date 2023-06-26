export function formatDates(s: string): string {
  const date = new Date(s);
  return date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
    .replace(",", "");
}

export function getCurrentConversationId(): string {
  const conId = window.location.pathname.split("/")[2];
  return conId;
}

export async function batchPromises<T>(
  funcs: Array<() => Promise<T>>,
  limit = 5
): Promise<T[]> {
  const results: T[] = [];
  const totalFuncs = funcs.length;

  let i = 0;

  while (i < totalFuncs) {
    const funcsBatch = funcs.slice(i, i + limit);
    i += limit;

    const batchResults = await Promise.all(funcsBatch.map((f) => f()));

    results.push(...batchResults);
  }

  return results;
}
