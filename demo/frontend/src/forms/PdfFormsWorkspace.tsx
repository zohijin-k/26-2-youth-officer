import { Fragment, useEffect, useRef, useState } from 'react'

import {
  fetchFormLayout,
  fetchApplicantForms,
  fetchOriginalHwpOptions,
  fetchSubsidyItems,
  saveSubsidyItems,
  type FormFieldLayout,
  type FormLayout,
  type Identity,
  type SubsidySelection,
  type SelfCheckResult,
  type SubsidyState,
} from '../api.ts'
import Modal from '../components/Modal.tsx'
import SignaturePad from '../components/SignaturePad.tsx'
import type { ConsentValue } from './consent-model.ts'
import { isValidEmail, normalizeEmail } from './email.ts'
import { formatPhone, isValidPhone, phoneCursorPosition } from './phone.ts'
import { EMPTY_FORM1, type Form1Value } from './form1-model.ts'
import { JOB_PACKAGE_SELF_CHECK_ITEMS, type SelfCheckAnswers } from './form2-model.ts'
import './pdf-forms-workspace.css'

type ActiveForm = { formNo: string; mode: 'edit' | 'preview' }

interface Props {
  applicationId: number
  identity: Identity | null
  form1: Form1Value
  answers: SelfCheckAnswers
  consent: ConsentValue
  checkResult: SelfCheckResult | null
  onForm1: (value: Form1Value) => void
  onAnswers: (value: SelfCheckAnswers) => void
  onConsent: (value: ConsentValue) => void
  onFlush: () => Promise<void>
  onChangedSubsidy?: (state: SubsidyState) => void
  onContinue: () => void
  continuing: boolean
  error: string
  readOnly?: boolean
  onProgress: (completed: number, total: number) => void
}

function truthy(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object' && 'y' in value) {
    const date = value as { y?: string; m?: string; d?: string }
    return !!(date.y && date.m && date.d)
  }
  return Boolean(value)
}

function dateText(value: unknown): string {
  if (!value || typeof value !== 'object' || !('y' in value)) return ''
  const date = value as { y?: string; m?: string; d?: string }
  return [date.y, date.m, date.d].filter(Boolean).join('. ')
}

function applyFieldFormat(value: string, format: FormFieldLayout['format']): string {
  if (format === 'yy') {
    const digits = value.replace(/\D/g, '')
    return digits.length >= 2 ? digits.slice(-2) : digits
  }
  return value
}

function autoDateText(layout: FormLayout, field: FormFieldLayout): string {
  if (!field.date_part) return ''
  const [year, month, day] = layout.auto_date.split('-')
  if (field.date_part === 'year') return field.format === 'yy' ? year.slice(-2) : year
  return String(Number(field.date_part === 'month' ? month : day))
}

function readForm(form1: Form1Value, key: string): unknown {
  return (form1 as unknown as Record<string, unknown>)[key]
}

function requiredKeys(formNo: string): string[] {
  if (formNo === 'job_application') return [
    'name', 'birth', 'address', 'mobile', 'email', 'bankName', 'accountNo', 'job.signature',
  ]
  if (formNo === 'job_consent') return ['consent.privacy', 'consent.thirdParty', 'consent.job.signature']
  return ['self_check.1', 'self_check.2']
}

function fieldGroup(key: string): string {
  if (key.startsWith('self_check.')) return key.split('.').slice(0, 2).join('.')
  if (key.startsWith('consent.')) return key.split('.').slice(0, 2).join('.')
  if (key.startsWith('subsidy.')) return key.split('.').slice(0, 2).join('.')
  return key.split('.')[0]
}

export function ApplicantFormsBulkMenu({ applicationId, refreshKey }: { applicationId: number; refreshKey?: number }) {
  const [hwp, setHwp] = useState<{ url: string | null; label: string | null }>({ url: null, label: null })

  useEffect(() => {
    let alive = true
    const refresh = () => {
      fetchOriginalHwpOptions(applicationId)
        .then((hwpOptions) => {
          if (!alive) return
          setHwp(hwpOptions)
        }).catch(() => undefined)
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      alive = false
      window.removeEventListener('focus', refresh)
    }
  }, [applicationId, refreshKey])

  return (
    <details className="pdf-forms__bulk-menu"><summary className="btn"><DownloadIcon /> 다운로드 <span aria-hidden="true">▾</span></summary>
      <a href={`/api/applications/${applicationId}/forms/files/written.pdf`}><DownloadIcon /> <span>PDF 다운로드</span></a>
      {hwp.url && hwp.label && <a href={hwp.url}><DownloadIcon /> <span>HWP 다운로드</span></a>}
    </details>
  )
}

function DownloadIcon() {
  return <svg className="pdf-forms__download-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13v3.5h13V13" />
  </svg>
}

export default function PdfFormsWorkspace({
  applicationId, identity, form1, answers, consent,
  checkResult, onForm1, onAnswers, onConsent,
  onFlush, onChangedSubsidy, onContinue, continuing, error, readOnly = false, onProgress,
}: Props) {
  const [formNos, setFormNos] = useState<string[]>([])
  const [layouts, setLayouts] = useState<Record<string, FormLayout>>({})
  const [availableFormCount, setAvailableFormCount] = useState(0)
  const [active, setActive] = useState<ActiveForm | null>(null)
  const [page, setPage] = useState(0)
  const [localError, setLocalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [signatureTarget, setSignatureTarget] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [thumbnailVersion, setThumbnailVersion] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [subsidySelections, setSubsidySelections] = useState<SubsidySelection[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const sessionEpoch = useRef(0)
  const pendingOperation = useRef<number | null>(null)
  const resetPending = useRef<number | null>(null)
  const [availablePageWidth, setAvailablePageWidth] = useState(794)
  const selfCheckItems = JOB_PACKAGE_SELF_CHECK_ITEMS

  useEffect(() => {
    let alive = true
    sessionEpoch.current += 1
    pendingOperation.current = null
    fetchApplicantForms(applicationId)
      .then(async (availableForms) => {
        const items = await Promise.all(availableForms.map(({ form_no }) => fetchFormLayout(applicationId, form_no)))
        if (!alive) return
        setFormNos(availableForms.map((item) => item.form_no))
        setLayouts(Object.fromEntries(items.map((item) => [item.form_no, item])))
        setAvailableFormCount(availableForms.length)
      })
      .catch((e: unknown) => {
        if (alive) setLocalError(e instanceof Error ? e.message : String(e))
      })
    {
      fetchSubsidyItems(applicationId).then((state) => {
        if (!alive) return
        setSelectedItems(state.selections.map((item) => item.item_type))
        setSubsidySelections(state.selections)
      }).catch(() => undefined)
    }
    return () => { alive = false; sessionEpoch.current += 1 }
  }, [applicationId])

  const runSavedAction = async (action: (isCurrent: () => boolean) => void | Promise<void>, flush = true) => {
    if (pendingOperation.current !== null || continuing) return
    const epoch = sessionEpoch.current
    const isCurrent = () => epoch === sessionEpoch.current
    pendingOperation.current = epoch
    setSaving(true)
    setLocalError('')
    try {
      if (!readOnly && flush) await onFlush()
      if (!isCurrent()) return
      await action(isCurrent)
      if (isCurrent()) setThumbnailVersion((key) => key + 1)
    } catch (e: unknown) {
      if (isCurrent()) setLocalError(e instanceof Error ? e.message : String(e))
    } finally {
      if (isCurrent()) {
        pendingOperation.current = null
        setSaving(false)
      }
    }
  }

  useEffect(() => {
    const epoch = resetPending.current
    if (epoch === null) return
    resetPending.current = null
    void onFlush().then(() => {
      if (epoch !== sessionEpoch.current) return
      setThumbnailVersion((version) => version + 1)
    }).catch((e: unknown) => {
      if (epoch === sessionEpoch.current) setLocalError(e instanceof Error ? e.message : String(e))
    }).finally(() => {
      if (epoch === sessionEpoch.current) { pendingOperation.current = null; setSaving(false) }
    })
  }, [answers, consent, form1, onFlush])

  useEffect(() => {
    const viewport = scrollRef.current
    if (!viewport) return
    const update = () => setAvailablePageWidth(Math.max(1, viewport.clientWidth - 28))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [active])

  const currentLayout = active ? layouts[active.formNo] : undefined
  const pageSize = currentLayout?.page_sizes[page]
  const pageWidth = Math.min(794, availablePageWidth)
  const scale = pageSize ? pageWidth / pageSize.width : 1

  const readChoice = (key: string): boolean => {
    const [group, option] = [fieldGroup(key), key.split('.').slice(-1)[0]]
    if (group.startsWith('self_check.')) return answers[Number(group.split('.')[1])] === option
    if (group === 'consent.privacy') return consent.privacy === option
    if (group === 'consent.thirdParty') return consent.thirdParty === option
    if (group.startsWith('subsidy.')) return selectedItems.includes(group.split('.')[1])
    return readForm(form1, group) === option
  }

  const readText = (key: string): string => {
    if (key === 'birth') return dateText(form1.birth)
    if (key === 'name' && identity) return identity.name
    if (key.startsWith('consent.job.') && !key.endsWith('signature')) {
      const date = new Date()
      if (key.endsWith('.year')) return String(date.getFullYear())
      if (key.endsWith('.month')) return String(date.getMonth() + 1)
      if (key.endsWith('.day')) return String(date.getDate())
    }
    if (key.startsWith('job.application')) {
      const date = new Date()
      if (key.endsWith('Month')) return String(date.getMonth() + 1)
      if (key.endsWith('Day')) return String(date.getDate())
    }
    if (key.startsWith('consent.job.')) return ''
    const suitLink = key.match(/^job\.suit\.(\d+)\.(company|location|date)$/)
    if (suitLink && selectedItems.includes('interview')) {
      const selection = subsidySelections.find((item) => item.item_type === 'suit')
      const interviewTurn = selection?.linked_interview_indices[Number(suitLink[1]) - 1]
      if (interviewTurn) return String(readForm(form1, `job.interview.${interviewTurn}.${suitLink[2]}`) || '')
    }
    const value = readForm(form1, key)
    if (typeof value === 'string') return value
    if (key === 'birth') return dateText(value)
    return ''
  }

  const requiredItems = (formNo: string): string[] => {
    const keys = requiredKeys(formNo)
    for (const rule of layouts[formNo]?.requirements || []) {
      if (rule.kind === 'all_or_none') {
        if (rule.fields.some((field) => truthy(readForm(form1, field)))) keys.push(...rule.fields)
      } else if (readForm(form1, rule.field) === rule.equals) {
        keys.push(...rule.required)
      }
    }
    return keys
  }

  const requirementSatisfied = (key: string): boolean => {
    if (key.startsWith('self_check.')) return !!answers[Number(key.split('.')[1])]
    if (key === 'consent.privacy') return !!consent.privacy
    if (key === 'consent.thirdParty') return !!consent.thirdParty
    if (key === 'ecContact') return isValidPhone(String(readForm(form1, key) || ''))
    if (key === 'email') return isValidEmail(normalizeEmail(String(readForm(form1, key) || '')))
    if (key.endsWith('.signature')) return !!readForm(form1, key)
    return truthy(readForm(form1, key))
  }

  const missing = (formNo: string): string[] => requiredItems(formNo).filter((key) => !requirementSatisfied(key))

  const missingGroupBoxes = (formNo: string, targetPage: number): [number, number, number, number][] => {
    const fields = layouts[formNo]?.fields || {}
    const groups = new Map<string, [number, number, number, number]>()
    for (const missingKey of missing(formNo)) {
      const entry = Object.entries(fields).find(([fieldKey, field]) => field.type === 'check' && (fieldKey === missingKey || fieldGroup(fieldKey) === missingKey))
      if (!entry) continue
      const group = fieldGroup(entry[0])
      const groupBox = entry[1].choice_group_box || entry[1].group_box || entry[1].choice_box || entry[1].box
      if (entry[1].page !== targetPage) continue
      const box: [number, number, number, number] = [...groupBox] as [number, number, number, number]
      groups.set(`${targetPage}-${group}`, box)
    }
    return [...groups.values()]
  }

  const hasStarted = (formNo: string): boolean => requiredItems(formNo).some(requirementSatisfied)

  const allReady = availableFormCount > 0 && formNos.every((formNo) => !!layouts[formNo] && (missing(formNo).length === 0)) &&
    selfCheckItems.every((item) => !!answers[item.no])
  const completedFormCount = formNos.filter(
    (formNo) => !!layouts[formNo] && (missing(formNo).length === 0),
  ).length

  const setText = (key: string, value: string) => {
    if (key === 'name' && identity) return
    if (key === 'birth' && identity) return
    if (key === 'consent.privacy') { onConsent({ ...consent, privacy: value }); return }
    if (key === 'consent.thirdParty') { onConsent({ ...consent, thirdParty: value }); return }
    if (key === 'birth' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-')
      onForm1({ ...form1, birth: { y, m: String(Number(m)), d: String(Number(d)) } })
      return
    }
    if (key === 'mobile' || key === 'ecContact') value = formatPhone(value)
    onForm1({ ...(form1 as unknown as Record<string, unknown>), [key]: value } as unknown as Form1Value)
  }

  const toggleChoice = (key: string, checked: boolean) => {
    const group = fieldGroup(key)
    const option = key.split('.').slice(-1)[0]
    if (group.startsWith('self_check.')) {
      const no = group.split('.')[1]
      const answer = option as '예' | '아니오'
      onAnswers({ ...answers, [Number(no)]: checked ? answer : undefined })
      return
    }
    if (group === 'consent.privacy') { onConsent({ ...consent, privacy: checked ? option : '' }); return }
    if (group === 'consent.thirdParty') { onConsent({ ...consent, thirdParty: checked ? option : '' }); return }
    if (group.startsWith('subsidy.')) {
      const itemType = group.split('.')[1]
      void (async () => {
        const state = await fetchSubsidyItems(applicationId)
        const selections = state.selections.filter((item) => item.item_type !== itemType)
        if (checked) selections.push({ item_type: itemType, count: 1, receipts: [null], linked_interview_indices: [1] })
        const saved = await saveSubsidyItems(applicationId, selections)
        setSelectedItems(saved.selections.map((item) => item.item_type))
        setSubsidySelections(saved.selections)
        onChangedSubsidy?.(saved)
      })().catch((e: unknown) => setLocalError(e instanceof Error ? e.message : String(e)))
      return
    }
    const value = readForm(form1, group)
    onForm1({ ...(form1 as unknown as Record<string, unknown>), [group]: checked ? option : value === option ? '' : value } as unknown as Form1Value)
  }

  const setSignature = (formNo: string, value: string) => {
    const storeKey = formNo === 'job_consent' ? 'consent.job.signature' : 'job.signature'
    onForm1({ ...(form1 as unknown as Record<string, unknown>), [storeKey]: value } as unknown as Form1Value)
  }

  const signatureValue = (formNo: string): string => {
    const key = formNo === 'job_consent' ? 'consent.job.signature' : 'job.signature'
    const value = readForm(form1, key)
    return typeof value === 'string' ? value : ''
  }

  const resetForm = async (formNo: string) => {
    if (readOnly || pendingOperation.current !== null || continuing) return
    if (!window.confirm('작성한 내용과 서명이 모두 지워집니다. 다시 작성할까요?')) return
    const epoch = sessionEpoch.current
    pendingOperation.current = epoch
    setSaving(true)
    setLocalError('')
    try {
      if (epoch !== sessionEpoch.current) return
      resetPending.current = epoch
      if (formNo === 'job_consent') {
        onConsent({ ...consent, privacy: '', thirdParty: '' })
        onForm1({ ...(form1 as unknown as Record<string, unknown>), 'consent.job.signature': '' } as unknown as Form1Value)
      } else {
        const reset = { ...EMPTY_FORM1 }
        if (identity) {
          reset.name = identity.name
          const [y, m, d] = identity.birth.split('-')
          reset.birth = { y, m: String(Number(m)), d: String(Number(d)) }
        }
        onForm1(reset)
      }
      setSignatureTarget(null)
    } catch (e: unknown) {
      if (epoch !== sessionEpoch.current) return
      resetPending.current = null
      pendingOperation.current = null
      setSaving(false)
      setLocalError(e instanceof Error ? e.message : String(e))
    }
  }

  const startPreview = async (formNo: string) => {
    await runSavedAction(() => {
      setPreviewKey((key) => key + 1)
      setPage(0)
      setSignatureTarget(null)
      setActive({ formNo, mode: 'preview' })
      scrollRef.current?.scrollTo({ top: 0, left: 0 })
    })
  }

  const saveAndClose = async () => {
    await runSavedAction(() => {
      setActive(null)
      setSignatureTarget(null)
    })
  }

  const submitWorkspace = () => {
    if (readOnly || pendingOperation.current !== null || continuing) return
    if (!allReady) {
      setLocalError('필수 칸과 자가진단 문항을 모두 작성해 주세요.')
      return
    }
    onContinue()
  }

  const pageImageUrl = active
    ? `/api/applications/${applicationId}/forms/${encodeURIComponent(active.formNo)}/pages/${page + 1}.png?preview=${active.mode === 'preview' ? 'true' : 'false'}&v=${previewKey}`
    : ''

  const renderField = ([key, field]: [string, FormFieldLayout], fieldIndex: number) => {
    if (!active || field.page !== page) return null
    const [x0, y0, x1, y1] = field.box
    const boxStyle = {
      left: x0 * scale,
      top: y0 * scale,
      width: Math.max(8, (x1 - x0) * scale),
      height: Math.max(8, (y1 - y0) * scale),
    }
    const isMissing = missing(active.formNo).some((required) => required === key || fieldGroup(key) === required)
    const label = field.anchor || field.label || '입력 항목'
    const publicId = `pdf-input-${fieldIndex}`
    const fieldRef = `${field.page}-${fieldIndex}`
    if (field.type === 'check') {
      const checked = readChoice(key)
      if (field.control === 'radio_text') {
        const optionGroup = fieldGroup(key)
        const [gx0, gy0, gx1, gy1] = field.group_box || field.box
        const groupWidth = (gx1 - gx0) * scale
        const groupHeight = (gy1 - gy0) * scale
        const isYes = key.endsWith('.예')
        const half = groupWidth / 2
        const radioStyle = { left: gx0 * scale + (isYes ? 0 : half), top: gy0 * scale, width: half, height: groupHeight, fontSize: Number(field.size || 9) * scale }
        const groupKeys = Object.keys(layouts[active.formNo].fields).filter((fieldKey) => fieldGroup(fieldKey) === optionGroup)
        const radioName = `pdf-radio-${active.formNo}-${Object.keys(layouts[active.formNo].fields).indexOf(groupKeys[0])}`
        return (
          <Fragment key={key}>
            <label data-field-ref={fieldRef} className={`pdf-form__radio-text pdf-form__radio-text--${field.font_family || 'sans'}`} style={radioStyle}>
              <input id={publicId} type="radio" name={radioName} checked={checked} disabled={readOnly} aria-label={`${label} ${field.label || '선택'}`} onChange={() => toggleChoice(key, true)} />
              <svg className={`pdf-form__radio-box ${checked ? 'is-checked' : ''}`} aria-hidden="true" style={{ width: Number(field.size || 9) * scale * 0.78, height: Number(field.size || 9) * scale * 0.78 }} viewBox="0 0 20 20"><rect x="1.5" y="1.5" width="17" height="17" /><path d="M4.5 10.5 8.2 14 15.5 6" /></svg>
              <span>{field.label || (isYes ? '예' : '아니오')}</span>
            </label>
          </Fragment>
        )
      }
      const [cx0, cy0, cx1, cy1] = field.click_box || field.box
      const clickStyle = {
        left: cx0 * scale,
        top: cy0 * scale,
        width: Math.max(8, (cx1 - cx0) * scale),
        height: Math.max(8, (cy1 - cy0) * scale),
      }
      const markSize = (Math.max(x1 - x0, y1 - y0) + 3) * scale
      return (
        <label key={key} data-field-ref={fieldRef} className="pdf-form__check" style={clickStyle}>
          <input
            id={publicId}
            type="checkbox"
            checked={checked}
            disabled={readOnly}
            aria-label={`${label} ${field.label || '선택'}`}
            onChange={(event) => toggleChoice(key, event.currentTarget.checked)}
          />
          {checked && <svg
            className="pdf-form__check-mark"
            width={markSize}
            height={markSize}
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ left: (x0 - cx0 + (x1 - x0) / 2) * scale, top: (y0 - cy0 + (y1 - y0) / 2) * scale }}
          ><rect x="1" y="1" width="22" height="22" rx="1" /><path d="M5 12.5 10 17 19 7" /></svg>}
        </label>
      )
    }
    if (field.type === 'image') {
      const value = signatureValue(active.formNo)
      return (
        <button
          key={key}
          type="button"
          id={publicId}
          data-field-ref={fieldRef}
          disabled={readOnly}
          className={`pdf-form__sign ${isMissing && !requirementSatisfied(key) ? 'is-missing' : ''}`}
          style={boxStyle}
          aria-label="서명 입력란"
          title="눌러서 서명"
          onClick={() => { setLocalError(''); setSignatureTarget(key) }}
        >
          {value && <img src={value} alt="입력한 서명" />}
        </button>
      )
    }
    const value = readText(key)
    const invalidEmail = key === 'email' && !!value && !isValidEmail(normalizeEmail(value))
    const required = requiredItems(active.formNo).includes(key)
    const round = key.match(/^job\.(interview|suit|certificate)\.(\d+)\./)
    const roundEnabled = !round || (subsidySelections.find((item) => item.item_type === round[1])?.count ?? 0) >= Number(round[2])
    const photoEnabled = !key.startsWith('job.photo.') || selectedItems.includes('photo')
    const suitField = key.match(/^job\.suit\.(\d+)\.(company|location|date)$/)
    const suitLink = suitField
      ? subsidySelections.find((item) => item.item_type === 'suit')?.linked_interview_indices[Number(suitField[1]) - 1]
      : null
    const suitFieldsLinked = !!suitField && selectedItems.includes('interview') && !!suitLink
    const locked = !!identity && (key === 'name' || key === 'birth')
    const dateValue = key === 'birth'
      ? (() => {
          const b = form1.birth
          if (!b.y || !b.m || !b.d) return ''
          return `${b.y}-${String(Number(b.m)).padStart(2, '0')}-${String(Number(b.d)).padStart(2, '0')}`
        })()
      : value
    if (field.auto_date) {
      const text = autoDateText(layouts[active.formNo], field)
      const reference = field.date_reference
      const autoSize = (reference?.size || Number(field.size || 10)) * (reference?.render_size_scale || 1) * scale
      const baseline = (reference?.render_baseline ?? reference?.baseline ?? field.y ?? y1) * scale
      return <span key={key} className={`pdf-form__auto-date pdf-form__auto-date--${reference?.font_family || 'sans'}`} aria-hidden="true" data-auto-date="true" style={{ left: x0 * scale, top: baseline - autoSize * 0.79, width: boxStyle.width, height: autoSize, fontSize: autoSize, lineHeight: `${autoSize}px`, textAlign: field.align || 'center' }}>{text}</span>
    }
    const baseFont = Math.min(12, Math.max(8, Number(field.size || 9) * scale))
    const fitFont = value.length > 0 ? Math.max(7, Math.min(baseFont, boxStyle.width / (value.length * 0.62))) : baseFont
    return (
      <Fragment key={key}>
        <input
        id={publicId}
        data-field-ref={fieldRef}
        type={key === 'email' ? 'email' : 'text'}
        className={`pdf-form__text pdf-form__text--${field.font_family || 'sans'} ${isMissing && required ? 'is-missing' : ''}`}
        style={{ ...boxStyle, fontSize: fitFont, textAlign: field.align || 'left' }}
        aria-label={label}
        aria-invalid={invalidEmail || undefined}
        value={applyFieldFormat(dateValue, field.format)}
        readOnly={readOnly || locked || !roundEnabled || !photoEnabled || suitFieldsLinked || key.startsWith('written') || key.includes('.year') || key.includes('.month') || key.includes('.day') || key.startsWith('job.application')}
        inputMode={key === 'ecContact' ? 'numeric' : undefined}
        maxLength={key === 'ecContact' ? 13 : undefined}
        onChange={(event) => {
          const input = event.currentTarget
          const next = event.currentTarget.value
          if (key === 'ecContact' || key === 'mobile') {
            const digitCount = next.slice(0, event.currentTarget.selectionStart ?? next.length).replace(/\D/g, '').length
            const formatted = formatPhone(next)
            setText(key, formatted)
            requestAnimationFrame(() => {
              input.setSelectionRange(phoneCursorPosition(formatted, digitCount), phoneCursorPosition(formatted, digitCount))
            })
          } else setText(key, key === 'email' ? normalizeEmail(next) : next)
        }}
        onBlur={key === 'email' ? () => setText(key, normalizeEmail(value)) : undefined}
        />
        {invalidEmail && <span className="pdf-form__email-hint" role="alert" style={{ left: x0 * scale, top: y1 * scale + 2, width: Math.max(150, 190 * scale), fontSize: Math.max(10, 10 * scale) }}>이메일 형식으로 입력해 주세요.</span>}
      </Fragment>
    )
  }

  const itemLabelForStatus = (formNo: string) => {
    if (!layouts[formNo]) return { state: 'loading', label: '불러오는 중', remaining: 0 }
    const remaining = missing(formNo).length
    if (remaining === 0) return { state: 'done', label: '작성 완료', remaining }
    if (hasStarted(formNo)) return { state: 'draft', label: `작성 중 · 남은 항목 ${remaining}개`, remaining }
    return { state: 'empty', label: '미작성', remaining }
  }

  useEffect(() => {
    if (availableFormCount === 0) return
    onProgress(completedFormCount, availableFormCount)
  }, [availableFormCount, completedFormCount, onProgress])

  const formLabel = (formNo: string) => {
    const layout = layouts[formNo]
    if (!layout) return formNo
    if (!layout.public_form) return layout.title
    const shortTitle = layout.title.replace(/ 및 필수사항.*$/, '')
    return `${layout.public_form} ${shortTitle}`
  }

  const viewerContent = active && currentLayout ? (
    <fieldset className="pdf-form__contents" disabled={saving || continuing}>
      <div className="pdf-form__toolbar">
        <button type="button" className="btn" aria-label="이전 쪽" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>◀</button>
        <span>{page + 1} / {currentLayout.page_sizes.length}쪽</span>
        <button type="button" className="btn" aria-label="다음 쪽" disabled={page >= currentLayout.page_sizes.length - 1} onClick={() => setPage((p) => Math.min(currentLayout.page_sizes.length - 1, p + 1))}>▶</button>
      </div>
      <div className="pdf-form__scroll" ref={scrollRef} data-form-scroll>
        <div
          className="pdf-form__page"
          data-form-page
          style={{ width: pageWidth, height: pageSize ? pageSize.height * scale : 'auto' }}
        >
          <img
            className="pdf-form__background"
            src={pageImageUrl}
            alt={`${formLabel(active.formNo)} ${page + 1}쪽 원본 서식`}
            draggable={false}
          />
          {active.mode === 'edit' && (
            <div className="pdf-form__overlay" style={{ width: pageWidth, height: pageSize ? pageSize.height * scale : 'auto' }}>
              {(currentLayout.masks || []).filter((mask) => mask.page === page).map((mask, index) => {
                const [x0, y0, x1, y1] = mask.box
                return <div
                  key={`mask-${index}`}
                  className="pdf-form__mask"
                  aria-hidden="true"
                  style={{ left: x0 * scale, top: y0 * scale, width: (x1 - x0) * scale, height: (y1 - y0) * scale }}
                />
              })}
              {Array.from(new Map(Object.entries(currentLayout.fields).filter(([, field]) => field.control === 'radio_text' && field.group_box).map(([, field]) => [JSON.stringify([field.page, field.group_box]), { page: field.page, box: field.group_box! }])).values()).filter((mask) => mask.page === page).map((mask, index) => {
                const [x0, y0, x1, y1] = mask.box
                return <span key={`selfcheck-cover-${index}`} className="pdf-form__mask" aria-hidden="true" style={{ left: x0 * scale, top: y0 * scale, width: (x1 - x0) * scale, height: (y1 - y0) * scale }} />
              })}
              {missingGroupBoxes(active.formNo, page).map((box, index) => {
                const [x0, y0, x1, y1] = box
                return <span key={`missing-choice-${index}`} className="pdf-form__group-missing" aria-hidden="true" style={{ left: x0 * scale, top: y0 * scale, width: (x1 - x0) * scale, height: (y1 - y0) * scale }} />
              })}
              {Object.entries(currentLayout.fields)
                .sort((a, b) => a[1].page - b[1].page || a[1].box[1] - b[1].box[1] || a[1].box[0] - b[1].box[0])
                .map(renderField)}
            </div>
          )}
        </div>
      </div>
      {active.mode === 'edit' && !readOnly && signatureTarget && (
        <div className="pdf-form__sign-pad">
          <h4>서명 입력 <button type="button" className="btn" onClick={() => setSignatureTarget(null)}>완료</button></h4>
          <SignaturePad value={signatureValue(active.formNo)} onChange={(value) => setSignature(active.formNo, value)} width={260} height={90} />
          <button type="button" className="btn" onClick={() => setSignature(active.formNo, '')}>서명 다시 하기</button>
        </div>
      )}
    </fieldset>
  ) : null

  return (
    <section className="pdf-forms">
      <header className="pdf-forms__intro">
        <div>
          <h2>신청 서식 작성</h2>
          <p>원본 서식 위에 직접 입력합니다. 작성 내용은 자동 저장됩니다.</p>
        </div>
        <ApplicantFormsBulkMenu applicationId={applicationId} refreshKey={thumbnailVersion} />
      </header>
      <ul className="pdf-forms__list">
        {formNos.map((formNo) => {
          const state = itemLabelForStatus(formNo)
          return (
            <li key={formNo} className={`pdf-form-row pdf-form-row--${state.state}`}>
              <button type="button" className="pdf-form-row__thumb" disabled={!layouts[formNo]} onClick={() => void startPreview(formNo)} aria-label={`${formLabel(formNo)} 미리보기`}>
                <img src={`/api/applications/${applicationId}/forms/${encodeURIComponent(formNo)}/pages/1.png?preview=true&dpi=50&v=${thumbnailVersion}`} alt="" />
              </button>
              <div className="pdf-form-row__info">
                <strong>{formLabel(formNo)}</strong>
                <span>{state.label}</span>
              </div>
              <div className="pdf-form-row__actions">
                {!readOnly && <button type="button" className="btn btn--primary" disabled={!layouts[formNo]} onClick={() => { setPage(0); setSignatureTarget(null); setActive({ formNo, mode: 'edit' }) }}>
                  {state.state === 'done' ? '수정' : '작성하기'}
                </button>}
                <button type="button" className="btn" disabled={!layouts[formNo] || saving} onClick={() => void startPreview(formNo)}>미리보기</button>
                {!readOnly && <button type="button" className="btn" disabled={!layouts[formNo] || state.state === 'empty'} onClick={() => resetForm(formNo)}>다시 작성</button>}
              </div>
            </li>
          )
        })}
      </ul>

      {(
        <section className="pdf-forms__selfcheck">
          <h3>지원 자격 확인</h3>
          {selfCheckItems.map((item) => (
            <fieldset key={item.no}>
              <legend>{item.question}</legend>
              {(['예', '아니오'] as const).map((answer) => (
                <label key={answer}>
                  <input type="radio" disabled={readOnly} name={`job-selfcheck-${item.no}`} checked={answers[item.no] === answer} onChange={() => onAnswers({ ...answers, [item.no]: answer })} />
                  {answer}
                </label>
              ))}
            </fieldset>
          ))}
        </section>
      )}

      {checkResult && !checkResult.eligible && checkResult.failed_item && (
        <p className="pdf-forms__error" role="alert">{checkResult.failed_item}번 문항: {checkResult.reason}</p>
      )}
      {(localError || error) && <p className="pdf-forms__error" role="alert">{localError || error}</p>}
      <div className="flow__actions">
        <button type="button" className="btn" onClick={() => window.scrollTo({ top: 0 })}>서식 목록</button>
        {!readOnly && <button type="button" className="btn btn--primary" disabled={!allReady || continuing || saving} onClick={submitWorkspace}>
          {continuing ? '저장 중…' : '지원 항목 단계로'}
        </button>}
      </div>

      {active && currentLayout && (
        <Modal
          title={`${formLabel(active.formNo)} ${active.mode === 'preview' ? '미리보기' : '작성'}`}
          onClose={() => { if (signatureTarget) setSignatureTarget(null); else void saveAndClose() }}
          variant="viewer"
          footer={active.mode === 'edit' && !readOnly ? (
            <>
              <span className="pdf-form__remaining">{missing(active.formNo).length === 0 ? '작성 완료' : `남은 항목 ${missing(active.formNo).length}개`}</span>
              <button type="button" className="btn" onClick={() => void startPreview(active.formNo)}>미리보기</button>
              <button type="button" className="btn" onClick={() => void saveAndClose()}>저장하고 닫기</button>
            </>
          ) : active.mode === 'preview' && !readOnly ? (
            <button type="button" className="btn btn--primary" onClick={() => setActive({ ...active, mode: 'edit' })}>수정</button>
          ) : null}
        >
          {viewerContent}
        </Modal>
      )}
    </section>
  )
}
