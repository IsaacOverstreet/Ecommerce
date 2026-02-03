export function formatDate(date: string | Date, locale = undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(locale || undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
