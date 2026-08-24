/**
 * Features built but deliberately switched off.
 *
 * Keeping them behind a flag rather than deleting them means they can come back
 * without rebuilding — but anything left off for a long time should eventually be
 * removed rather than rot here.
 */
export const FEATURES = {
  /**
   * Bit / PayBox payment link on the summary screen.
   *
   * Off: this app is for diners splitting a receipt between themselves. Nobody is
   * collecting money on anyone's behalf, so a "pay this person" link doesn't fit
   * the model. Revisit if a version aimed at restaurants/businesses happens.
   */
  paymentLink: false,
} as const;
