/** Youth package self-check presentation. Eligibility is validated by the API. */

export interface SelfCheckItem {
  no: number
  /** 문항 본문. **강조** 구간은 렌더러가 굵게 처리한다. */
  question: string
  note?: string
  /** 문항 아래 박스로 들어가는 하위 목록. */
  sublist?: string[]
  /** 하위 목록을 2단으로 조판할지 (원문 8번 문항). */
  sublistTwoCol?: boolean
  /**
   * "아니오"를 골랐을 때 신청자에게 보여줄 안내. 콜센터 문의의 38%가
   * 자격요건이었다 — 여기서 이유와 대안을 같이 줘야 문의가 줄어든다.
   */
  ineligibleReason: string
  alternative?: string
}

/**
 * 취업지원패키지 자가진단 (축소판).
 *
 * 사업계획서의 서류심사는 "신청자 자격요건 검토(나이, 거주지 등)"가 전부다.
 * 소득·근로·계좌명의 문항이 없으므로 2문항으로 줄어든다. 서식 원본이 없는
 * 항목이라 문구에 `(데모 추정치)` 라벨을 단다.
 */
export const JOB_PACKAGE_SELF_CHECK_ITEMS: SelfCheckItem[] = [
  {
    no: 1,
    question: '귀하는 **전북특별자치도 내에 거주**하는 청년입니까?',
    note: '※ 주민등록상 주소 기준 · 사업계획서 「신청대상 : 전북 도내 거주 청년(18세~39세)」',
    ineligibleReason: '이 사업은 전북특별자치도 내에 거주하는 청년만 신청할 수 있습니다.',
    alternative: '거주하시는 시·도의 청년 취업지원 사업을 확인해 보세요.',
  },
  {
    no: 2,
    question: '귀하의 연령은 **2026년 기준 18세 이상 ~ 39세 이하**입니까?',
    note: '※ 1987. 1. 1. ~ 2008. 12. 31.까지 출생자',
    ineligibleReason:
      '1987. 1. 1. ~ 2008. 12. 31. 출생자만 신청할 수 있습니다(2026년 기준 18~39세).',
  },
]

export const JOB_PACKAGE_SELF_CHECK_FOOTER = [
  '※ 예산 소진 시 조기 마감되며, 접수 순서(선착순)로 지원 대상자를 선정합니다.',
  '서류가 미비한 경우 7일 내 보완 안내를 드리며, 기한 내 보완하지 않으면 후순위자가 선정됩니다.',
  '※ 이 자가진단 양식은 사업계획서에 서식 원본이 없어 데모가 구성한 것입니다. (데모 추정치)',
]

/** 문항번호 → '예' | '아니오' */
export type SelfCheckAnswers = Record<number, '예' | '아니오' | undefined>

export function firstFailure(
  answers: SelfCheckAnswers,
  items: SelfCheckItem[] = JOB_PACKAGE_SELF_CHECK_ITEMS,
): SelfCheckItem | null {
  return items.find((i) => answers[i.no] === '아니오') ?? null
}

export function allAnswered(
  answers: SelfCheckAnswers,
  items: SelfCheckItem[] = JOB_PACKAGE_SELF_CHECK_ITEMS,
): boolean {
  return items.every((i) => answers[i.no] !== undefined)
}
