/**
 * Formats a browser or OS name with its version for the Playground identification table.
 *
 * The Server API returns the literal string "Not Available" when it cannot detect a version,
 * for example `browser_full_version` for "Chromium-Based Browser" on Android tablets.
 * Printing it reads like the signal is broken, so we show just the name instead.
 * The raw value is still visible in the Server API Response JSON below the table.
 */
export function formatNameWithVersion(name: string | undefined, version: string | undefined): string {
  if (!version || version === 'Not Available') {
    return `${name}`;
  }
  return `${name} ${version}`;
}
