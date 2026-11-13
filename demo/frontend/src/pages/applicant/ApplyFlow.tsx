/** Youth employment package applicant flow; original forms and rules come from the API. */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  createApplication,
  fetchApplication,
  fetchApplicationConsents,
  fetchPrograms,
  fetchStatus,
  fetchSubsidyItems,
  patchApplication,
  postConsents,
  postSelfCheck,
  type ApplicationRow,
  type ConsentPayload,
  type Identity,
  type Program,
  type SelfCheckResult,
  type SubmitResult,
  type SubsidyState,
} from '../../api.ts'
import DocumentUpload from './DocumentUpload.tsx'
import FinalCheck from './FinalCheck.tsx'
import IdentityCheck from './IdentityCheck.tsx'
import MyPage from './MyPage.tsx'
import SubsidyItems from './SubsidyItems.tsx'
import PdfFormsWorkspace, { ApplicantFormsBulkMenu } from '../../forms/PdfFormsWorkspace.tsx'
import { EMPTY_CONSENT, type ConsentValue } from '../../forms/consent-model.ts'
import { CONSENT_OPTIONS } from '../../forms/consent-model.ts'
import { EMPTY_FORM1, type Form1Value } from '../../forms/form1-model.ts'
import type { SelfCheckAnswers } from '../../forms/form2-model.ts'
import { currentParams, routeUrl } from '../../navigation-url.ts'
import './apply-flow.css'

type Stage =
  | 'identity'
  | 'forms'
  | 'subsidy'
  | 'upload'
  | 'final'
  | 'complete'
  | 'mypage'

const ACTIVE_APPLICATION_KEY = 'applicant.activeApplicationId'
const YOUTH_PROGRAM_CODE = 'job_package'
// Share an in-flight draft across StrictMode replay and history remounts.
let pendingDraft: Promise<ApplicationRow> | null = null
function youthDraft(): Promise<ApplicationRow> {
  if (!pendingDraft) {
    pendingDraft = createApplication(YOUTH_PROGRAM_CODE).then((application) => {
      try { window.sessionStorage.setItem(ACTIVE_APPLICATION_KEY, String(application.id)) } catch { /* In-memory flow still works. */ }
      return application
    }).catch((error: unknown) => { pendingDraft = null; throw error })
  }
  return pendingDraft.then((application) => fetchApplication(application.id))
}

function savedPage(): { appId: number; stage: Stage; previous: Stage } | null {
  const params = currentParams()
  const route = /^\/apply\/([a-z]+)\/?$/.exec(window.location.pathname)
  const stage = route?.[1] as Stage
  const previous = params.get('from') as Stage
  const stages: Stage[] = ['identity', 'forms', 'subsidy', 'upload', 'final', 'complete', 'mypage']
  const removedEntry = params.get('mode') === 'officer' || params.get('program') === 'double_savings' || [...params.keys()].some((key) => key.startsWith('o_'))
  const nextStage = stages.includes(stage) && !removedEntry ? stage : 'identity'
  try {
    const savedId = window.sessionStorage.getItem(ACTIVE_APPLICATION_KEY)
    if (!savedId || !/^[1-9]\d*$/.test(savedId)) return null
    const appId = Number(savedId)
    if (!Number.isSafeInteger(appId)) return null
    return { appId, stage: nextStage, previous: stages.includes(previous) ? previous : 'identity' }
  } catch {
    return null
  }
}

type Step = { key: 'identity' | 'forms' | 'upload' | 'final'; label: string }
type StepperProgress = { completed: number; total: number }
const APPLY_STEPS: Step[] = [
  { key: 'identity', label: '본인인증' },
  { key: 'forms', label: '서식 작성' },
  { key: 'upload', label: '서류 업로드' },
  { key: 'final', label: '확인 및 제출' },
]

/** 신청서의 성명·생년월일을 본인인증 값으로 덮는다 (서버도 같은 규칙으로 잠근다). */
function lockIdentity(form: Form1Value, identity: Identity | null): Form1Value {
  if (!identity) return form
  const [y, m, d] = identity.birth.split('-')
  return { ...form, name: identity.name, birth: { y, m: String(Number(m)), d: String(Number(d)) } }
}

export default function ApplyFlow({ headerHost }: { headerHost: HTMLElement | null }) {
  const [initialPage] = useState(savedPage)
  const initialUrlWrite = useRef(true)
  const [restoring, setRestoring] = useState(true)
  const [startupAttempt, setStartupAttempt] = useState(0)
  const [program, setProgram] = useState<Program | null>(null)
  const [appId, setAppId] = useState<number | null>(null)
  const [appNo, setAppNo] = useState('')
  const [stage, setStage] = useState<Stage>('identity')
  const [stageBeforeMypage, setStageBeforeMypage] = useState<Stage>('identity')
  const [error, setError] = useState('')
  const [identity, setIdentity] = useState<Identity | null>(null)

  const [answers, setAnswers] = useState<SelfCheckAnswers>({})
  const [checkResult, setCheckResult] = useState<SelfCheckResult | null>(null)

  const [form1, setForm1] = useState<Form1Value>(EMPTY_FORM1)

  const [consent, setConsent] = useState<ConsentValue>(EMPTY_CONSENT)

  const [submitted, setSubmitted] = useState<SubmitResult | null>(null)
  /** 지원 항목이 바뀌면 업로드 화면의 체크리스트를 다시 읽게 하는 키. */
  const [checklistKey, setChecklistKey] = useState(0)
  const [selectedSubsidyTypes, setSelectedSubsidyTypes] = useState(0)
  const [formContinuing, setFormContinuing] = useState(false)
  const [formError, setFormError] = useState('')
  const [formProgress, setFormProgress] = useState<StepperProgress>({ completed: 0, total: 0 })
  const [uploadProgress, setUploadProgress] = useState<StepperProgress>({ completed: 0, total: 0 })
  const saveQueue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let active = true
    if (!initialPage || initialPage.stage === 'identity') routeUrl('/apply/identity', {}, true)
    const restore = async () => {
      try {
        const programs = await fetchPrograms()
        if (!active) return
        const picked = programs.find((item) => item.code === YOUTH_PROGRAM_CODE)
        if (!picked) throw new Error('청년 취업지원패키지 설정을 불러오지 못했습니다.')
        let application: ApplicationRow | null = null
        let restored = false
        const pageToRestore = initialPage ?? savedPage()
        if (pageToRestore) {
          try {
            const saved = await fetchApplication(pageToRestore.appId)
            if (!active) return
            if (saved.program_code === YOUTH_PROGRAM_CODE) {
              application = saved
              restored = true
            } else {
              pendingDraft = null
              try { window.sessionStorage.removeItem(ACTIVE_APPLICATION_KEY) } catch { /* Storage may be disabled. */ }
            }
          } catch (error: unknown) {
            if (!active) return
            if (!(error instanceof Error) || !/실패 \(404\)/.test(error.message)) throw error
            pendingDraft = null
            try { window.sessionStorage.removeItem(ACTIVE_APPLICATION_KEY) } catch { /* Storage may be disabled. */ }
          }
        }
        if (!active) return
        if (!application) application = await youthDraft()
        const [consents, status, subsidy] = await Promise.all([
          fetchApplicationConsents(application.id), fetchStatus(application.id), fetchSubsidyItems(application.id),
        ])
        if (!active) return
        try {
          window.sessionStorage.setItem(ACTIVE_APPLICATION_KEY, String(application.id))
          pendingDraft = null
        } catch { /* Retain the shared promise in memory when storage is disabled. */ }
        setProgram(picked)
        setAppId(application.id)
        setAppNo(application.application_no)
        const savedIdentity = application.identity_json
        setIdentity(savedIdentity?.name && savedIdentity.birth ? savedIdentity as Identity : null)
        setForm1({ ...EMPTY_FORM1, ...application.form1_json } as Form1Value)
        setAnswers(application.self_check_json as SelfCheckAnswers)
        setSelectedSubsidyTypes(subsidy.selections.length)
        const consentValue = (type: string) => {
          const item = consents.find((row) => row.consent_type === type)
          return item ? CONSENT_OPTIONS[item.agreed ? 0 : 1] : ''
        }
        setConsent({ privacy: consentValue('privacy'), thirdParty: consentValue('third_party') })
        if (status.status !== 'draft') {
          setSubmitted({ application_no: status.application_no, submitted_at: status.submitted_at,
            status: status.status, message: '신청이 완료되었습니다.', next_steps: [],
            first_come: status.first_come, supplement: status.supplement, subsidy: status.subsidy, notice: status.result_notice })
        }
        const requestedStage = restored && initialPage ? initialPage.stage : 'identity'
        setStage(requestedStage === 'complete' && status.status === 'draft' ? 'final' : requestedStage)
        setStageBeforeMypage(restored && initialPage ? initialPage.previous : 'identity')
      } catch (error: unknown) {
        if (active) setError(error instanceof Error ? error.message : String(error))
      } finally {
        if (active) setRestoring(false)
      }
    }
    void restore()
    return () => { active = false }
  }, [initialPage, startupAttempt])

  useEffect(() => {
    if (restoring) return
    try {
      if (appId !== null) window.sessionStorage.setItem(ACTIVE_APPLICATION_KEY, String(appId))
    } catch {
      // Continue in memory when tab storage is unavailable; refresh returns to identity verification.
    }
    if (appId === null) {
      routeUrl('/apply/identity', {}, true)
    } else {
      routeUrl(`/apply/${stage}`, stage === 'mypage' ? { from: stageBeforeMypage } : {}, initialUrlWrite.current)
    }
    initialUrlWrite.current = false
  }, [appId, stage, stageBeforeMypage, restoring])

  const reportFormProgress = useCallback((completed: number, total: number) => {
    setFormProgress({ completed, total })
  }, [])
  const reportUploadProgress = useCallback((completed: number, total: number) => {
    setUploadProgress({ completed, total })
  }, [])

  const save = (body: { form1?: unknown; self_check?: unknown }): Promise<void> => {
    if (appId === null) return Promise.resolve()
    const next = saveQueue.current.catch(() => undefined).then(() => patchApplication(appId, body)).then(() => undefined)
    saveQueue.current = next.catch(() => undefined)
    return saveQueue.current
  }

  const continueFromForms = async () => {
    if (appId === null || program === null) return
    setFormContinuing(true)
    setFormError('')
    try {
      const payload = Object.fromEntries(Object.entries(answers).filter(([, v]) => v)) as Record<string, string>
      const result = await postSelfCheck(appId, payload)
      setCheckResult(result)
      if (!result.eligible) return
      if (!consentReady) {
        setFormError('필수 동의와 서명을 모두 마쳐 주세요.')
        return
      }
      await postConsents(appId, [
        { consent_type: 'privacy', agreed: consent.privacy === '동의함' },
        { consent_type: 'third_party', agreed: consent.thirdParty === '동의함' },
      ])
      setStage('subsidy')
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : String(e))
    } finally {
      setFormContinuing(false)
    }
  }

  /** 최종 확인의 수정 링크는 이미 도달한 단계로만 돌아가게 한다. */
  const jumpTo = (next: Stage) => {
    if (next === stage) return
    if (next === 'identity' && identity !== null) return
    setStage(next)
    window.scrollTo({ top: 0 })
  }

  if (restoring) return <p className="flow">신청 화면을 불러오는 중입니다...</p>
  if (error) return <div className="flow"><p className="flow-error" role="alert">{error}</p><button type="button" className="btn" onClick={() => { setError(''); setRestoring(true); setStartupAttempt((attempt) => attempt + 1) }}>다시 시도</button></div>

  if (program === null) return <p className="flow">신청 화면을 불러오는 중입니다...</p>
  const consentReady = consent.privacy === '동의함' && consent.thirdParty === '동의함'

  const submittedDone = submitted !== null
  const uploadComplete = uploadProgress.total > 0 && uploadProgress.completed >= uploadProgress.total
  const viewedStage = stage === 'mypage' && !submittedDone ? stageBeforeMypage : stage
  const currentIndex = viewedStage === 'identity' ? 0
    : viewedStage === 'forms' || viewedStage === 'subsidy' ? 1
      : viewedStage === 'upload' ? 2 : 3

  const openMyPage = () => {
    if (stage !== 'mypage') setStageBeforeMypage(stage)
    setStage('mypage')
    window.scrollTo({ top: 0 })
  }

  const stepStatus = (index: number): string => {
    if (submittedDone) return index === 3 ? '접수 완료' : '완료'
    const progress = index === 1 ? formProgress : index === 2 ? uploadProgress : null
    const count = progress && progress.total > 0 ? `${progress.completed} / ${progress.total}` : ''
    if (index < currentIndex) return index === 2 && count ? `완료 · ${count}` : '완료'
    if (index > currentIndex) {
      const state = index === 2 && uploadComplete ? '완료' : '예정'
      return count ? `${state} · ${count}` : state
    }
    return count ? `현재 · ${count}` : '현재 단계'
  }

  const stepperNavigate = (index: number) => {
    const previouslyReachedUpload = index === 2 && uploadProgress.total > 0
    if (submittedDone || stage === 'mypage' || index === 0) return
    if (index >= currentIndex && !previouslyReachedUpload) return
    setStage(index === 1 ? 'forms' : 'upload')
    window.scrollTo({ top: 0 })
  }

  /** 신청서 저장. 본인인증을 마쳤으면 성명·생년월일은 인증 값으로 고정된다. */
  const onForm1 = (next: Form1Value) => {
    const locked = lockIdentity(next, identity)
    setForm1(locked)
    save({ form1: locked })
  }

  return (
    <div className={`flow flow--active${stage === 'upload' ? ' flow--fluid' : ''}`}>
      {headerHost && appId !== null && createPortal(
        <div className="shell__application-controls">
          <span className="shell__application-number">신청번호 <strong>{appNo || '발급 중…'}</strong></span>
          <button type="button" className="shell__mypage" onClick={openMyPage} disabled={stage === 'mypage'}>마이페이지</button>
        </div>, headerHost,
      )}
      <div className="flow__overview">
        <header className="flow__head flow__head--compact">
          <h1>{program.name} 신청</h1>
          {program.is_first_come && <span className="flow__submission-order">선착순 접수</span>}
        </header>
        <ol className="flow__stages" aria-label="신청 단계">
          {APPLY_STEPS.map(({ key, label }, i) => {
            const complete = submittedDone || i < currentIndex || (i === 2 && uploadComplete)
            const current = i === currentIndex
            const canNavigate = !submittedDone && stage !== 'mypage' && i !== 0 &&
              (i < currentIndex || (i === 2 && uploadProgress.total > 0))
            const status = stepStatus(i)
            return (
            <li
              key={key}
              className={current ? 'is-current' : complete ? 'is-complete' : 'is-waiting'}
            >
              <button
                type="button"
                aria-current={current ? 'step' : undefined}
                aria-disabled={!canNavigate}
                title={i === 0 && identity ? '본인인증은 완료되었습니다' : undefined}
                onClick={() => stepperNavigate(i)}
              >
                <span className="flow__stage-no" aria-hidden="true">
                  {complete && !current && <span className="flow__stage-check" aria-hidden="true">✓</span>}
                </span>
                <span className="flow__stage-copy">
                  <span className="flow__stage-caption">
                    <span>{i + 1}단계</span>
                    <span className="flow__stage-status">{status}</span>
                  </span>
                  <span className="flow__stage-label">{label}</span>
                </span>
              </button>
            </li>
            )
          })}
        </ol>
      </div>

      {/* ── 본인인증 (데모) ── */}
      {stage === 'identity' && appId !== null && (
        <IdentityCheck
          appId={appId}
          identity={identity}
          onVerified={(verified, mobile) => {
            setIdentity(verified)
            const locked = lockIdentity({ ...form1, mobile }, verified)
            setForm1(locked)
            save({ form1: locked })
            setStage('forms')
            window.scrollTo({ top: 0 })
          }}
          onNext={() => setStage('forms')}
        />
      )}

      {/* ── [1] 자가진단 ── */}
      {stage === 'forms' && appId !== null && (
        <PdfFormsWorkspace
          key={`${appId}:${program.code}:${!!submitted}`}
          applicationId={appId}
          identity={identity}
          form1={form1}
          answers={answers}
          consent={consent}
          checkResult={checkResult}
          onForm1={onForm1}
          onAnswers={(next) => { setAnswers(next); setCheckResult(null); save({ self_check: next }) }}
          onConsent={setConsent}
          onFlush={async () => {
            if (appId === null) return
            await saveQueue.current
            await patchApplication(appId, { form1, self_check: answers })
            const values: ConsentPayload[] = [
              { consent_type: 'privacy', agreed: consent.privacy === '동의함' },
              { consent_type: 'third_party', agreed: consent.thirdParty === '동의함' },
            ]
            await postConsents(appId, values.filter((item) => {
              const selected = item.consent_type === 'privacy' ? consent.privacy : consent.thirdParty
              return selected === '동의함' || selected === '동의하지 않음'
            }))
          }}
          onChangedSubsidy={(state) => { setSelectedSubsidyTypes(state.selections.length); setChecklistKey((key) => key + 1) }}
          onContinue={() => void continueFromForms()}
          continuing={formContinuing}
          error={formError}
          readOnly={!!submitted}
          onProgress={reportFormProgress}
        />
      )}

      {/* ── [4] 지원 항목 (취업지원패키지) ── */}
      {stage === 'subsidy' && appId !== null && (
        <>
          <div className="flow-block flow-block--ok">
            <strong>신청서와 동의서 작성이 끝났습니다. 종이·자필서명 0건.</strong>
            <p>신청번호 {appNo}</p>
            <p>
              이제 지원받을 항목을 고르세요. 항목은 여러 개를 함께 신청할 수 있고,
              고른 항목에 따라 올려야 할 서류가 정해집니다.
            </p>
          </div>
          <div className="flow__gap" />
          <SubsidyItems
            applicationId={appId}
            onChanged={(state: SubsidyState) => {
              setSelectedSubsidyTypes(state.selections.length)
              setChecklistKey((k) => k + 1)
            }}
          />
          <div className="flow__actions">
            <button type="button" className="btn" onClick={() => setStage('forms')}>
              이전
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={selectedSubsidyTypes === 0}
              onClick={() => setStage('upload')}
            >
              서류 업로드로
            </button>
          </div>
          {selectedSubsidyTypes === 0 && (
            <p className="flow__validation" role="alert">지원받을 항목을 하나 이상 고르세요.</p>
          )}
        </>
      )}

      {/* ── [5] 서류 업로드 ── */}
      {stage === 'upload' && appId !== null && (
        <>
          {identity === null && (
            <div className="flow-block flow-block--warn">
              <strong>본인인증 전입니다.</strong>
              <p>
                지금 올리는 서류는 본인 명의인지 대조하지 않습니다.{' '}
                <button type="button" className="btn btn--small" onClick={() => jumpTo('identity')}>
                  본인인증 하러 가기
                </button>
              </p>
            </div>
          )}
          <DocumentUpload key={checklistKey} applicationId={appId} onProgress={reportUploadProgress} />
          <div className="flow__actions">
            <button
              type="button"
              className="btn"
              onClick={() => setStage('subsidy')}
            >
              이전
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setStage('final')}>
              제출 전 최종 확인
            </button>
          </div>
        </>
      )}

      {/* ── [6] 제출 전 최종 확인 ── */}
      {stage === 'final' && appId !== null && (
        <>
          <FinalCheck
            applicationId={appId}
            onSubmitted={(result) => {
              setSubmitted(result)
              setStage('complete')
              window.scrollTo({ top: 0 })
            }}
            onBack={() => jumpTo('upload')}
            onGoto={jumpTo}
          />
        </>
      )}

      {/* ── 제출 완료 ── */}
      {stage === 'complete' && submitted && appId !== null && (
        <>
          <div className="flow-block flow-block--ok">
            <strong>{submitted.message}</strong>
            <p>신청번호 {submitted.application_no}</p>
            {submitted.first_come && (
              <p className="flow-queue">
                접수 순번 <strong>{submitted.first_come.position}번</strong>
                {submitted.first_come.quota !== null &&
                  ` / 총 지원규모 ${submitted.first_come.quota.toLocaleString('ko-KR')}건`}
              </p>
            )}
            {submitted.subsidy && submitted.subsidy.lines.length > 0 && (
              <p className="flow-queue">
                신청하신 항목의 지급 예정액{' '}
                <strong>{submitted.subsidy.total_granted.toLocaleString('ko-KR')}원</strong>
              </p>
            )}
            <ol className="flow-steps-list">
              {submitted.next_steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <p className="flow-alt">{submitted.notice}</p>
            <ApplicantFormsBulkMenu applicationId={appId} refreshKey={1} />
            <button type="button" className="btn btn--primary" onClick={openMyPage}>마이페이지</button>
          </div>
        </>
      )}

      {stage === 'mypage' && appId !== null && (
        <>
          <div className="flow__mypage-return">
            <button type="button" className="btn" onClick={() => setStage(stageBeforeMypage)}>신청 화면으로 돌아가기</button>
          </div>
          <MyPage applicationId={appId} />
        </>
      )}
    </div>
  )
}
