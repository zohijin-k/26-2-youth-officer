import type { OfficerRole } from './api.ts'

export const YOUTH_PROGRAM = 'job_package'

/** 서버의 역할·처리 권한을 유지하면서 화면의 점수제 사업 안내만 교체한다. */
export function youthOfficerRole(role: OfficerRole): OfficerRole {
  return {
    ...role,
    stage: '신청 서류 검토',
    notes: [
      '청년 취업지원패키지 신청 서류와 항목별 지원 내역을 확인합니다.',
      ...(role.can_bulk ? [] : ['구비서류는 건별로 확인합니다.']),
    ],
    actions: role.actions.map((action) => ({
      ...action,
      label: action.label.replace(/\s*\([^)]*%\)/g, ''),
    })),
  }
}
