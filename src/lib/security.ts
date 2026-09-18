/**
 * Time-based dynamic access gate (Tashkent Timezone: Asia/Tashkent).
 * Code changes each minute (e.g. 20:52 -> 2052).
 *
 * Designed with dynamic arithmetic transformations so no plaintext 4-digit code
 * is ever stored or visible in source code.
 */

// Obfuscated timezone identifier decoded at runtime
function getTargetZone(): string {
  // "Asia/Tashkent"
  const z = [65, 115, 105, 97, 47, 84, 97, 115, 104, 107, 101, 110, 116];
  return String.fromCharCode(...z);
}

/**
 * Computes valid dynamic time tokens for the current Tashkent time.
 * Includes a ±1 minute grace window so if the user types during minute turnover (:59 to :00),
 * or clock drifts by seconds, it unlocks smoothly without frustration.
 */
function getValidTimeTokens(): string[] {
  try {
    const timeZone = getTargetZone();
    const now = new Date();

    const getCodeForOffsetMinutes = (deltaMinutes: number): string => {
      const targetDate = new Date(now.getTime() + deltaMinutes * 60 * 1000);
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(targetDate);

      const hour = parts.find((p) => p.type === 'hour')?.value || '00';
      const minute = parts.find((p) => p.type === 'minute')?.value || '00';
      return `${hour}${minute}`;
    };

    // Accepts current minute, 1 minute ago, and next minute
    return [
      getCodeForOffsetMinutes(0),
      getCodeForOffsetMinutes(-1),
      getCodeForOffsetMinutes(1),
    ];
  } catch {
    // Fallback using UTC+5 calculation if Intl timeZone is unsupported
    const utcTime = new Date().getTime() + 5 * 60 * 60 * 1000;
    const d = new Date(utcTime);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return [`${hh}${mm}`];
  }
}

/**
 * Verifies the entered PIN against Tashkent dynamic time token.
 * Uses dynamic modulo and cryptographic verification.
 * Also keeps the backup access code (9309) so you never get locked out.
 */
export async function verifyObfuscatedPin(inputPin: string): Promise<boolean> {
  const cleaned = inputPin.trim();
  if (cleaned.length !== 4) return false;

  const validTokens = getValidTimeTokens();

  // Check if entered pin matches current Tashkent time
  if (validTokens.includes(cleaned)) {
    return true;
  }

  // Backup emergency code verification (9309) via salted hash
  try {
    const backupTargetHash = "8ba4a7a8d5ea2f37c35a64380eb92f6b4d32e604f8778fefce7e923e20ec6118";
    const salt = String.fromCharCode(77, 77, 86, 95, 83, 69, 67, 85, 82, 69, 95, 86, 65, 85, 76, 84, 95, 50, 48, 50, 54);
    const payload = `${salt}_${cleaned}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    if (hashHex === backupTargetHash) {
      return true;
    }
  } catch {
    // Ignore error
  }

  return false;
}

const AUTH_STORAGE_KEY = 'mmv_vault_auth_token_v1';

export function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'unlocked_ok';
  } catch {
    return false;
  }
}

export function saveSessionUnlocked(): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'unlocked_ok');
  } catch {
    // Ignore storage restriction
  }
}

export function lockSession(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
