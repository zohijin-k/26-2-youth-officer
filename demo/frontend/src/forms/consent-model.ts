/** Youth application privacy and third-party consent values. */

export interface ConsentValue {
  /** 개인정보 수집·이용 */
  privacy: string
  /** 제3자 제공 */
  thirdParty: string
}

export const EMPTY_CONSENT: ConsentValue = { privacy: '', thirdParty: '' }

export const CONSENT_OPTIONS = ['동의함', '동의하지 않음'] as const
