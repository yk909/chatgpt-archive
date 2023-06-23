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
