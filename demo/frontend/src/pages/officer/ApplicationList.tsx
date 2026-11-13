/** 청년 취업지원패키지 접수 목록. */
import type { OfficerList, OfficerListQuery, DecisionKey, OfficerRow } from '../../api.ts'
import StatusBadge from '../../components/StatusBadge.tsx'
import { shortTime } from './format.ts'

function Cell({ row, column }: { row: OfficerRow; column: { key: string } }) {
  switch (column.key) {
    case 'application_no': return <td className="grid__no">{row.application_no}</td>
    case 'name': return <td>{row.name}</td>
    case 'region': return <td>{row.region} {row.town}</td>
    case 'items': return <td className="grid__items">{row.items_label || '-'}</td>
    case 'ai_status': return <td><StatusBadge status={row.ai_status ?? 'NEEDS_REVIEW'} /></td>
    case 'missing_count': return <td className={row.missing_count > 0 ? 'grid__missing' : undefined}>{row.missing_count}</td>
    case 'submitted_at': return <td>{shortTime(row.submitted_at)}</td>
    case 'decision': return <td>{row.decision_label}</td>
    default: return <td>-</td>
  }
}

interface Props {
  list: OfficerList
  query: OfficerListQuery
  onQuery: (patch: Partial<OfficerListQuery>) => void
  /**
   * 상세 열기. `slotKey`가 있으면 상세가 그 서류 탭을 연 채로 시작한다 —
   * 목록의 서류 칸을 눌러 들어오는 경로다.
   */
  onOpen: (applicationId: number, slotKey?: string) => void
  selected: number[]
  onSelect: (ids: number[]) => void
  onBulk: (decision: DecisionKey) => void
  busy: boolean
}

export default function ApplicationList({
  list,
  query,
  onQuery,
  onOpen,
  selected,
  onSelect,
  onBulk,
  busy,
}: Props) {
  const allIds = list.rows.map((r) => r.application_id)
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.includes(id))

  return (
    <div className="list">
      {/* 지원 항목 총규모 대비 접수 진행률. */}
      {list.first_come && (
        <div className="fcfs">
          <span className="fcfs__name">{list.first_come.program_name}</span>
          <span className="fcfs__count">
            접수 {list.first_come.applied.toLocaleString('ko-KR')} /{' '}
            {list.first_come.quota.toLocaleString('ko-KR')}건
          </span>
          <span className="fcfs__bar">
            <i style={{ width: `${Math.min(100, list.first_come.rate_percent)}%` }} />
          </span>
          <span className="fcfs__meta">
            선정 {list.first_come.selected}건 · 남은 규모 {list.first_come.remaining}건
            {list.first_come.supplement_days !== null && (
              <> · 보완 {list.first_come.supplement_days}일</>
            )}
          </span>
          <span className="fcfs__notice">{list.first_come.notice}</span>
        </div>
      )}

      <div className="filters">
        {list.scope.region_locked && (
          <label>
            시군
            <select
              value={list.scope.region}
              onChange={(e) => onQuery({ region: e.target.value, town: '', page: 1 })}
            >
              {list.scope.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

        {list.scope.town_locked && (
          <label>
            읍·면·동
            <select
              value={list.scope.town}
              onChange={(e) => onQuery({ town: e.target.value, page: 1 })}
            >
              {list.scope.towns.length === 0 && <option value="">(접수 없음)</option>}
              {list.scope.towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          처리상태
          <select
            value={query.status ?? ''}
            onChange={(e) => onQuery({ status: e.target.value, page: 1 })}
          >
            <option value="">전체</option>
            {list.filters.statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          AI판정
          <select
            value={query.ai_status ?? ''}
            onChange={(e) => onQuery({ ai_status: e.target.value, page: 1 })}
          >
            <option value="">전체</option>
            {list.filters.ai_statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          신청일
          <input
            type="date"
            aria-label="신청일 시작"
            value={query.submitted_from ?? ''}
            onChange={(e) => onQuery({ submitted_from: e.target.value, page: 1 })}
          />
          <span className="filters__tilde">~</span>
          <input
            type="date"
            aria-label="신청일 종료"
            value={query.submitted_to ?? ''}
            onChange={(e) => onQuery({ submitted_to: e.target.value, page: 1 })}
          />
        </label>

        <span className="filters__sort">접수순 (선착순)</span>

        <span className="filters__total">{list.total}건</span>
      </div>

      {list.role.can_bulk ? (
        <div className="bulk">
          <span>선택 {selected.length}건</span>
          {list.role.actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`btn btn--${a.tone}`}
              disabled={busy || selected.length === 0}
              onClick={() => onBulk(a.key)}
            >
              일괄 {a.result_label}
            </button>
          ))}
        </div>
      ) : (
        <p className="bulk bulk--off">
          {list.role.name}은 구비서류를 건별로 확인하는 단계라 일괄 처리를 제공하지 않습니다.
        </p>
      )}

      <div className="grid-scroll">
        <table className="grid">
        <thead>
          <tr>
            {list.role.can_bulk && (
              <th className="grid__check">
                <input
                  type="checkbox"
                  aria-label="전체 선택"
                  checked={allChecked}
                  onChange={() => onSelect(allChecked ? [] : allIds)}
                />
              </th>
            )}
            <th>순번</th>
            {list.columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.rows.map((row, rowIndex) => (
            <tr key={row.application_id} onClick={() => onOpen(row.application_id)}>
              {list.role.can_bulk && (
                <td className="grid__check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`${row.application_no} 선택`}
                    checked={selected.includes(row.application_id)}
                    onChange={() =>
                      onSelect(
                        selected.includes(row.application_id)
                          ? selected.filter((id) => id !== row.application_id)
                          : [...selected, row.application_id],
                      )
                    }
                  />
                </td>
              )}
              <td className="grid__rank">{(list.page - 1) * list.page_size + rowIndex + 1}</td>
              {list.columns.map((c) => (
                <Cell key={c.key} row={row} column={c} />
              ))}
            </tr>
          ))}
          {list.rows.length === 0 && (
            <tr>
              <td className="grid__empty" colSpan={list.columns.length + 2}>
                조건에 맞는 접수 건이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>

      {list.page_count > 1 && (
        <div className="pager">
          {Array.from({ length: list.page_count }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={p === list.page ? 'pager__on' : undefined}
              onClick={() => onQuery({ page: p })}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
