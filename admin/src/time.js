export const bucharestTimeZone = "Europe/Bucharest";

function partsFor(date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: bucharestTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
}

function localStamp(parts) {
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function toBucharestInput(isoTimestamp) {
  if (!isoTimestamp) return "";
  return localStamp(partsFor(new Date(isoTimestamp)));
}

export function toUtcIsoFromBucharest(localValue) {
  if (!localValue) return null;
  const match = localValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Use a valid Bucharest date and time");
  const [, year, month, day, hour, minute] = match;
  const localAsUtc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  let candidate = localAsUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const represented = partsFor(new Date(candidate));
    const representedAsUtc = Date.UTC(
      Number(represented.year), Number(represented.month) - 1, Number(represented.day),
      Number(represented.hour), Number(represented.minute), Number(represented.second),
    );
    candidate -= representedAsUtc - localAsUtc;
  }
  if (localStamp(partsFor(new Date(candidate))) !== localValue) {
    throw new Error("That local time does not exist in Europe/Bucharest due to daylight saving time");
  }
  return new Date(candidate).toISOString();
}

export function formatBucharest(isoTimestamp) {
  if (!isoTimestamp) return "No deadline";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: bucharestTimeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoTimestamp));
}

export function bucharestNowInput() {
  return toBucharestInput(new Date().toISOString());
}
