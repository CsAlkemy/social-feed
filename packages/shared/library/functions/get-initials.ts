export function getInitials(...names: Array<string | null | undefined>): string {
  return names
    .filter((name): name is string => Boolean(name && name.trim()))
    .map((name) => name.trim().charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}
