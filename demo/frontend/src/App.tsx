/** 청년 취업지원패키지 담당자 화면. 상세 주소와 브라우저 이력을 유지한다. */
import { useEffect, useState } from 'react'

import OfficerConsole from './pages/officer/OfficerConsole.tsx'
import { routeUrl } from './navigation-url.ts'
import './app-shell.css'

export default function App() {
  const [officerKey, setOfficerKey] = useState(0)

  useEffect(() => {
    const restore = () => setOfficerKey((key) => key + 1)
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  const goHome = () => {
    routeUrl('/officer')
    setOfficerKey((key) => key + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="app-shell">
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
      <OfficerConsole key={officerKey} />
    </div>
  )
}
