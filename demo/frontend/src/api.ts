/** Officer API projections. The Vite dev server proxies /api to port 8000. */
/** 백엔드 호출. vite dev 서버가 /api 를 :8000 으로 프록시한다. */

import {
  MOCK_ROLES,
  isMockId,
  mockDecide,
  mockOfficerList,
  mockReviewDetail,
} from './pages/officer/mock-data.ts'

import { YOUTH_PROGRAM, youthOfficerRole } from './officer-scope.ts'

/** 지급 계산 한 줄. `calculation`이 "왜 이 금액인가"의 답이다. */
export interface SubsidyLine {
  item_type: string
  label: string
  index: number
  unit_cap: number
  actual_cost: boolean
  receipt_amount: number | null
  granted_amount: number
  calculation: string
  linked_interview_index: number | null
  pending: boolean
}

export interface SubsidyEstimate {
  lines: SubsidyLine[]
  total_granted: number
  warnings: string[]
  pending: boolean
}

/** 서류 보완 기한 (E12). 보완이 없는 사업에서는 null. */
export interface SupplementInfo {
  days: number | null
  deadline: string
  days_left: number
  hours_left: number
  expired: boolean
  targets: { label: string; reason: string }[]
  notice: string
}

/** 업로드 즉시 판정 결과 한 줄. 사유만 주면 신청자는 또 전화한다 — 해결 방법과 발급처가 함께 온다. */
export interface Finding {
  code: string
  message: string
  how_to_fix: string
  link: string
  severity: 'FAIL' | 'NEEDS_REVIEW'
}

export type DocStatus = 'PASS' | 'FAIL' | 'NEEDS_REVIEW'

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} 실패 (${res.status})`)
  return res.json() as Promise<T>
}

export type IssueRule = { mode: 'after_date' | 'after_notice' | 'within_days' | 'none'; date?: string; days?: number }

export type CriteriaSubsidyDoc = {
  suffix: string; doc_type: string; label: string; accepted: string[]; required_fields: string[];
  notes: string[]; warnings: string[]; date_basis: 'issue_date' | 'payment_date' | 'interview_date' | 'exam_date' | 'none'
}

export type CriteriaSubsidyItem = {
  item_type: string; label: string; description: string; unit_cap: number; max_count: number;
  count_scope: 'application' | 'year' | 'lifetime'
  actual_cost: boolean; note: string; extra_docs: CriteriaSubsidyDoc[]
}

export interface CriteriaData {
  version: number
  announcement_date: string
  application_period: string[]
  application_period_2: string[] | null
  document_issue_rules: Record<string, IssueRule>
  document_issue_fallback: IssueRule
  document_date_bases: Record<string, 'issue_date' | 'payment_date' | 'interview_date' | 'exam_date' | 'none'>
  nhis_payment_months: string[]
  nhis_acquisition_loss_years: number
  supplement: { allowed: boolean; days: number | null }
  subsidy_catalog: CriteriaSubsidyItem[]
  paper_forms: Record<string, boolean>
}

export interface CriteriaVersion extends CriteriaData { changed_at?: string; changed_role?: string }

export interface CriteriaHistory { current: CriteriaVersion; history: CriteriaVersion[] }

export const fetchOfficerCriteria = (code: string, role = 'province') =>
  json<CriteriaHistory>(`/api/officer/programs/${code}/criteria?role=${encodeURIComponent(role)}`)

export const saveOfficerCriteria = (code: string, role: string, data: Omit<CriteriaData, 'version'>) =>
  json<CriteriaVersion>(`/api/officer/programs/${code}/criteria?role=${encodeURIComponent(role)}`, {
    method: 'PUT', body: JSON.stringify(data),
  })

/* ------------------------------------------------------------------ 담당자 화면
 *
 * 원본 파일은 `/api/files/{id}`가 `inline`으로만 흘린다. 이 파일 어디에도 파일을
 * 로컬에 저장하는 경로를 만들지 않는다 — 뷰어가 URL을 직접 읽는 것이 전부다 (R4.1).
 */

/** 원본에서 값을 읽어낸 위치. PDF 포인트, **좌상단 원점**이다. */
export interface BBox {
  page: number
  x0: number
  y0: number
  x1: number
  y1: number
}

export type DecisionKey = 'approve' | 'reject' | 'hold'

export interface OfficerAction {
  key: DecisionKey
  /** 버튼 표기. 같은 approve라도 역할마다 뜻이 다르다. */
  label: string
  result_label: string
  tone: 'primary' | 'danger' | 'neutral'
}

export interface OfficerRole {
  key: string
  name: string
  stage: string
  scope: string
  requires_region: boolean
  requires_town: boolean
  can_bulk: boolean
  notes: string[]
  actions: OfficerAction[]
}

export interface OfficerRow {
  application_id: number
  application_no: string
  name: string
  region: string
  town: string
  program_code: string
  program_name: string
  ai_status: DocStatus | null
  ai_status_label: string
  missing_count: number
  submitted_at: string | null
  status: string
  decision: DecisionKey | null
  decision_label: string
  officer_role: string | null
  /**
   * 신청한 지원 항목 요약 ("면접비 2회 · 자격증 응시료 1회").
   *
   * 선착순 사업은 점수가 없고, 담당자가 목록에서 먼저 보는 것이 "이 사람이 무엇을
   * 신청했는가"다. 점수제 사업에서는 비어 온다.
   */
  items_label?: string | null

}

export interface OfficerListQuery {
  role: string
  region?: string
  town?: string
  program?: string
  status?: string
  ai_status?: string
  submitted_from?: string
  submitted_to?: string
  sort?: string
  page?: number
  page_size?: number
}

export interface OfficerList {
  role: OfficerRole
  scope: {
    region: string
    town: string
    region_locked: boolean
    town_locked: boolean
    regions: string[]
    towns: string[]
  }
  filters: {
    programs: { code: string; name: string }[]
    ai_statuses: { value: string; label: string }[]
    statuses: { value: string; label: string }[]
    sorts: { value: string; label: string }[]
    applied: Record<string, string | null>
  }
  /**
   * 목록 컬럼. 표의 헤더와 셀이 **둘 다** 이 배열을 따른다. 사업에 따라 컬럼이
   * 달라져도 같은 배열로 헤더와 셀을 렌더링한다.
   */
  columns: { key: string; label: string }[]
  /** 취업지원패키지 접수 진행률. */
  first_come: {
    program_code: string
    program_name: string
    quota: number
    applied: number
    selected: number
    remaining: number
    rate_percent: number
    supplement_days: number | null
    notice: string
  } | null
  total: number
  page: number
  page_size: number
  page_count: number
  rows: OfficerRow[]
}

export interface OfficerDocument {
  document_id: number
  slot_key: string
  label: string
  expected_doc_type: string | null
  detected_doc_type: string | null
  status: DocStatus | null
  findings: Finding[]
  /** 인라인 스트리밍 주소. 뷰어가 이 URL을 그대로 읽는다. */
  file_url: string
  file_name: string
  file_format: string
  page_index: number | null
  extracted: Record<string, string>
  bboxes: Record<string, BBox>
  ocr_confidence: number | null
  ocr_tier: string | null
  /** 실제로 글자를 읽은 엔진 (jbai·applevision·pdftext 등). 담당자 화면 전용 */
  ocr_engine: string | null
  /** 앞 엔진이 실패해 다른 엔진으로 대체한 사유 (예: 전북AI 응답 시간 초과) */
  ocr_fallback_reason: string | null
  /** 판독을 유지한 경우 담당자가 참고할 품질 메모 */
  ocr_quality_note: string | null
  declared_issue_date: string | null
  uploaded_at: string
}

/** 작성 서식 한 장 (P7 / R9). 업로드 서류와 같은 뷰어에서 인라인으로 연다. */
export interface FormExport {
  form_no: string
  public_form: string | null
  title: string
  label: string
  /** 인라인 스트리밍 주소. 저장 링크가 아니다. */
  file_url: string
  file_name: string
}

export interface ReviewDetailData {
  application_id: number
  application_no: string
  criteria_version?: number | null
  name: string
  /** 본인인증 여부. 목업 데이터에는 없다. */
  identity?: {
    verified: boolean
    method: string | null
    verified_at: string | null
    pledge_signed: boolean
    pledge_kind?: string | null
  }
  program_code: string
  program_name: string
  region: string
  town: string
  status: string
  submitted_at: string | null
  ai: {
    final_status: DocStatus | null
    final_status_label: string
    stage1_status: string | null
    stage2_status: string | null
    recommended_action: string
    reasons: { stage: string; code: string; message: string; doc_type: string | null }[]
  }
  /** 취업지원패키지 항목별 지급 내역. */
  subsidy: SubsidyEstimate | null
  /** 7일 보완 기한. 보완이 없는 사업이거나 보완 대상이 아니면 null. */
  supplement: SupplementInfo | null
  documents: OfficerDocument[]
  /** 신청자가 작성한 서식을 원본 서식 모양 그대로 내보낸 PDF. 없으면 빈 배열. */
  forms: FormExport[]
  eligibility: { key: string; label: string; ok: boolean; basis: string }[]
  exclusions: { label: string; answer: string; ok: boolean; source: string }[]
  decision: {
    decision: DecisionKey | null
    label: string
    memo: string | null
    officer_role: string | null
    decided_at: string | null
  }
  role: OfficerRole
}

function query(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  return search.toString()
}

// ---------------------------------------------------------------- 담당자 목업

/**
 * 담당자 화면 목업 전환 (`pages/officer/mock-data.ts`).
 *
 * 켜지는 조건은 둘이다.
 *
 *   - `?mock=1` — 강제로 켠다. 백엔드가 떠 있어도 목업을 본다.
 *   - 자동 — 담당자 목록 API가 실패했거나 **접수 건이 0건**일 때. 빈 표를 띄우고
 *     "데이터가 없습니다"로 시연이 끊기는 것보다, 예시로 채운 화면을 보여주고
 *     목업임을 상단에 밝히는 편이 낫다.
 *
 * `?mock=0`을 붙이면 어떤 경우에도 목업을 쓰지 않는다 — 실제 접수 건이 0건인 것을
 * 확인해야 할 때 쓴다.
 */
function mockMode() {
  const value = new URLSearchParams(window.location.search).get('mock')
  return { forced: value === '1' || value === 'on', blocked: value === '0' || value === 'off' }
}

let mockActive = false

export const isOfficerMockActive = () => {
  const mode = mockMode()
  return !mode.blocked && (mode.forced || mockActive)
}

const youthList = (list: OfficerList): OfficerList => ({
  ...list,
  role: youthOfficerRole(list.role),
  columns: list.columns.filter((column) => column.key !== 'total_score'),
  filters: {
    ...list.filters,
    programs: list.filters.programs.filter((program) => program.code === YOUTH_PROGRAM),
    sorts: [{ value: 'submitted', label: '접수순 (선착순)' }],
  },
  rows: list.rows.filter((row) => row.program_code === YOUTH_PROGRAM),
})

export const fetchOfficerRoles = async (): Promise<OfficerRole[]> => {
  if (isOfficerMockActive()) return MOCK_ROLES.map(youthOfficerRole)
  try {
    return (await json<OfficerRole[]>('/api/officer/roles')).map(youthOfficerRole)
  } catch (error) {
    if (mockMode().blocked) throw error
    mockActive = true
    return MOCK_ROLES.map(youthOfficerRole)
  }
}

export const fetchOfficerList = async (params: OfficerListQuery): Promise<OfficerList> => {
  const scoped = { ...params, program: YOUTH_PROGRAM, sort: 'submitted' }
  if (isOfficerMockActive()) return youthList(mockOfficerList(scoped))
  try {
    const body = await json<OfficerList>(`/api/officer/applications?${query(scoped)}`)
    const unfiltered = !params.region && !params.town && !params.status && !params.ai_status
      && !params.submitted_from && !params.submitted_to
    if (body.total === 0 && unfiltered && !mockMode().blocked) {
      mockActive = true
      return youthList(mockOfficerList(scoped))
    }
    return youthList(body)
  } catch (error) {
    if (mockMode().blocked) throw error
    mockActive = true
    return youthList(mockOfficerList(scoped))
  }
}

export const fetchReviewDetail = async (applicationId: number, role: string): Promise<ReviewDetailData> => {
  // A real youth detail ID must keep working even after an empty list activated mock mode.
  const detail = isMockId(applicationId) && !mockMode().blocked
    ? mockReviewDetail(applicationId, role)
    : await json<ReviewDetailData>(`/api/officer/applications/${applicationId}?${query({ role })}`)
  if (detail.program_code !== YOUTH_PROGRAM) {
    throw new Error('이 화면에서는 청년 취업지원패키지 신청만 확인할 수 있습니다.')
  }
  return { ...detail, role: youthOfficerRole(detail.role) }
}

export const postDecision = (
  applicationId: number,
  body: { role: string; decision: DecisionKey; memo: string },
) => {
  if (isMockId(applicationId) && !mockMode().blocked) {
    mockDecide([applicationId], body.role, body.decision, body.memo)
    const detail = mockReviewDetail(applicationId, body.role)
    return Promise.resolve({ decision: body.decision, label: detail.decision.label, decided_at: detail.decision.decided_at })
  }
  return json<{ decision: string; label: string; decided_at: string | null }>(
    `/api/officer/applications/${applicationId}/decision`,
    { method: 'POST', body: JSON.stringify(body) },
  )
}

export const postBulkDecision = (body: {
  role: string
  decision: DecisionKey
  memo: string
  application_ids: number[]
}) => {
  if (!mockMode().blocked && body.application_ids.every(isMockId)) {
    return Promise.resolve({ processed: mockDecide(body.application_ids, body.role, body.decision, body.memo) })
  }
  return json<{ processed: number }>('/api/officer/applications/decisions', {
    method: 'POST', body: JSON.stringify(body),
  })
}
