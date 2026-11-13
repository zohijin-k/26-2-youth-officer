/**
 * 청년 취업지원패키지 진입점. 주소로 신청자 화면과 담당자 화면 중 하나를 고른다.
 *
 *   /officer...        담당자 화면
 *   /apply...          신청자 화면
 *   그 밖(/ 포함)      ?mode=officer면 담당자, 아니면 신청자
 *
 * 두 화면은 마운트되자마자 주소를 자기 경로(/officer, /apply/identity)로 고쳐 쓰고,
 * 신청자 화면은 신청 건을 만들거나 복원한다. 그래서 한 번에 하나만 마운트한다.
 */
import { lazy, Suspense, useEffect, useState } from 'react'

import { currentMode, goToHome, routeUrl, type Mode } from './navigation-url.ts'
import './app-shell.css'

/** 화면별로 나눠 싣는다. 한쪽의 전역 CSS(.btn 등)가 다른 쪽 화면에 섞이지 않는다. */
const ApplyFlow = lazy(() => import('./pages/applicant/ApplyFlow.tsx'))
const OfficerConsole = lazy(() => import('./pages/officer/OfficerConsole.tsx'))

const TITLES: Record<Mode, string> = {
  applicant: '청년 취업지원패키지 신청',
  officer: '청년 취업지원패키지 담당자',
}

export default function App() {
  const [mode, setMode] = useState<Mode>(currentMode)
  /** 값이 바뀌면 현재 화면이 새로 마운트돼 주소에서 상태를 다시 읽는다. */
  const [screenKey, setScreenKey] = useState(0)
  const [headerHost, setHeaderHost] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const onHistoryChange = () => {
      setMode(currentMode())
      setScreenKey((key) => key + 1)
    }
    window.addEventListener('popstate', onHistoryChange)
    return () => window.removeEventListener('popstate', onHistoryChange)
  }, [])

  useEffect(() => {
    document.title = TITLES[mode]
  }, [mode])

  const goHome = () => {
    if (mode === 'officer') routeUrl('/officer')
    else goToHome()
    setScreenKey((key) => key + 1)
    window.scrollTo({ top: 0 })
  }

  if (mode === 'officer') {
    return (
      <div className="app-shell app-shell--officer">
        <nav className="shell" aria-label="담당자 화면">
          <span className="shell__title">
            <button className="shell__mark" type="button" onClick={goHome} aria-label="신청 목록으로 이동">
              전북
            </button>
            <span>
              <strong>청년 취업지원패키지</strong>
              <small>담당자 신청서류 검토</small>
            </span>
          </span>
        </nav>
        <Suspense fallback={null}>
          <OfficerConsole key={screenKey} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="app-shell app-shell--applicant">
      <nav className="shell" aria-label="신청 서비스">
        <div className="shell__inner">
          <span className="shell__title">
            <button className="shell__mark" type="button" onClick={goHome} aria-label="신청 첫 단계로 이동">전북</button>
            <span><strong>청년 취업지원패키지 신청</strong></span>
          </span>
          <div ref={setHeaderHost} className="shell__application" />
        </div>
      </nav>
      <Suspense fallback={null}>
        <ApplyFlow key={screenKey} headerHost={headerHost} />
      </Suspense>
    </div>
  )
}
