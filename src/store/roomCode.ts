/**
 * Excludes visually ambiguous characters (0/O, 1/I/L) so a code can be read aloud
 * across a table or typed from a photo without confusion.
 */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;

/**
 * Uses crypto randomness, not `Math.random()`. `Math.random()` is a predictable
 * formula — given a handful of observed codes its future output can be derived,
 * and the app lets anyone check whether a code exists, so guesses are cheap to
 * test. The code is the only thing protecting a room's contents.
 *
 * Rejection sampling avoids modulo bias: 256 isn't a multiple of the alphabet
 * length, so plain `byte % length` would make early characters more likely.
 */
export function generateRoomCode(): string {
  const alphabetLength = ROOM_CODE_ALPHABET.length;
  const limit = Math.floor(256 / alphabetLength) * alphabetLength;

  let code = '';
  const buffer = new Uint8Array(1);
  while (code.length < ROOM_CODE_LENGTH) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) code += ROOM_CODE_ALPHABET[buffer[0] % alphabetLength];
  }
  return code;
}
