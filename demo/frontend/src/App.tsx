/** Youth employment package applicant shell. */
import { useEffect, useState } from 'react'
import ApplyFlow from './pages/applicant/ApplyFlow.tsx'
import { goToHome } from './navigation-url.ts'
import './app-shell.css'

export default function App() {
  const [applicantKey, setApplicantKey] = useState(0)
  const [headerHost, setHeaderHost] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    const onHistoryChange = () => setApplicantKey((key) => key + 1)
    window.addEventListener('popstate', onHistoryChange)
    return () => window.removeEventListener('popstate', onHistoryChange)
  }, [])
  const goHome = () => {
    goToHome()
    setApplicantKey((key) => key + 1)
    window.scrollTo({ top: 0 })
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
      <ApplyFlow key={applicantKey} headerHost={headerHost} />
    </div>
  )
}
