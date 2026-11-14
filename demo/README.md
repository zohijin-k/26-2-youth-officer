# 데모 사이트 — 청년 취업지원패키지 신청자·담당자 화면

청년 취업지원패키지 신청자가 본인인증부터 서식 작성·서명, 지원 항목 선택, 서류 업로드,
확인·제출까지 진행하는 신청자 화면과, 담당자가 접수 목록과 제출 원본·판독 결과·판정 근거를
확인하고 심사하는 담당자 화면을 함께 담은 데모다. 두 화면은 프런트엔드 하나에서 주소로 구분해
열며, 사업 선택 화면과 두배적금 화면은 없다. 신청·업로드·판정 저장 API와
두 사업의 백엔드 모델·규칙·서식 기능은 보존되어 있다.

- 요구사항: `.trellis/tasks/09-16-demo-site/prd.md`
- 설계: `.trellis/tasks/09-16-demo-site/design.md`
- 업무 규칙 관련 옛 기록: [보관 문서](../docs/archive/demo-site-dev-plan.md)
- 이전 통합 화면 기준 시연 대본: [`docs/demo-script.md`](docs/demo-script.md)
- 담당자 화면 목업 데이터의 옛 기록: [보관 문서](../docs/archive/officer-mock-data.md)

> **PC 화면 기준**이다. 넓은 신청 목록과 원본 서류를 함께 확인하며, 좁은 화면에서는 가로 스크롤이 생길 수 있다.

> ⚠️ **더미 데이터만 쓴다.** 이름·주민등록번호·주소·계좌번호는 전부 가짜이고,
> 실물 서류는 저장소에 두지 않는다(R7.1). 업로드 원본과 SQLite 파일은 커밋되지
> 않는다(루트 `.gitignore`).

---

## 1. 폴더

```
demo/
├── backend/            FastAPI — 신청·업로드·심사·담당자 API
│   ├── main.py         엔트리 (uvicorn 대상)
│   ├── reset.py        시연 초기화 (파괴적)
│   ├── engine_adapter.py   engine/ 와의 유일한 접점
│   ├── api/ ocr/ rules/    라우터 · 판독 3계층 · 업무 규칙
│   ├── forms/          원본 PDF 위 입력·서명 렌더링 및 서식 응답
│   └── tests/          P2\~P20 시나리오 검증 스크립트 (pytest 없이 실행)
├── frontend/           React + Vite (취업지원패키지 신청자 화면 · 담당자 화면)
├── fixtures/
│   ├── make_samples.py 시연용 더미 서류 생성기
│   ├── cut_templates.py     원본 공고 PDF에서 서식별 A4 쪽 템플릿 생성
│   ├── build_form_coords.py 템플릿 → 서식 좌표 맵 추출
│   ├── samples/        생성된 더미 PDF (gitignore)
│   ├── templates/      두 사업 신청자 서식 PDF 템플릿 (커밋 대상)
│   ├── form_coords/    서식별 필드 좌표 맵 JSON
│   └── expected/       시연 시나리오 10종의 기대 결과 JSON
├── docs/demo-script.md 이전 통합 화면 기준 시연 대본 (현재 화면과 다름)
├── storage/            업로드 원본 (gitignore)
└── demo.db             SQLite (gitignore)
```

`engine/`은 **복사하지 않는다.** `engine_adapter.py`가 저장소 루트를 `sys.path`에
올려 `from engine.pipeline import run_pipeline` 으로 직접 import 한다. 엔진 담당자의
수정이 그대로 반영되어야 하기 때문이다.

---

## 2. 준비 (최초 1회)

엔진·백엔드·시나리오 기준선은 두 화면을 합치기 전 기준 커밋 `e449c55`에서
**WSL2 Ubuntu 24.04.5 LTS · Python 3.12.3 · Node 22.23.4 · npm 10.9.9**로 측정했다. 두 화면을 합친 뒤에는
macOS(Python 3.14.6 · Node 26.13.1 · npm 11.20.0)에서 같은 수치와 프런트엔드 lint·build·단위 시험을 확인했고,
WSL2에서는 다시 실행하지 않았다. Python 3.12 이상, Node 22.13 이상이 필요하다. Windows 네이티브와 macOS의
설치 절차는 이번에 검증하지 않았다.

```bash
# 저장소 루트에서
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r demo/backend/requirements.txt -r engine_v2/requirements.txt
python -m engine_v2.tools.fetch_own_models
cd demo/frontend
npm ci
```

담당자 합성 목업 시연에는 별도 PDF 생성이나 DB 시드가 필요하지 않다.
시나리오 시험용 더미 PDF는 `demo/fixtures/samples/`에 생성되며, 없으면 시나리오가 자동 생성한다.
필요하면 저장소 루트에서 수동 생성할 수 있다.

```bash
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.fixtures.make_samples
```

위 환경변수 문법은 WSL2·macOS의 Bash 계열 터미널 기준이다.

---

## 3. 기동

터미널 2개가 필요하다. **백엔드는 반드시 저장소 루트에서** 띄운다 — 그래야
`engine/` 을 import 할 수 있다.

```bash
# 터미널 1 — 백엔드 (저장소 루트에서)
python -m uvicorn demo.backend.main:app --reload --port 8000
```

이번 제출에서는 전북AI를 사용하지 않는다(연동 코드는 있으나 이번 제출에서는 사용하지 않음). JBAI_* 설정은 비워 둔 채 실행한다. 데모 로컬 OCR은 macOS를 포함한 모든 환경에서 own이 기본이다. own 모델은 macOS에서도 설치해야 한다. 저장소 루트에서 `python -m pip install -r engine_v2/requirements.txt`와 `python -m engine_v2.tools.fetch_own_models`를 실행한다. 모델 파일은 저장소에 포함되지 않는다.

```bash
# 터미널 2 — 프론트엔드
cd demo/frontend
npm run dev
```

개발 서버 주소는 <http://localhost:5173>이다. 주소에 따라 두 화면 중 하나만 열린다.

| 주소 | 화면 |
|---|---|
| `/apply/...` | 신청자 화면. 시작 주소는 <http://localhost:5173/apply/identity>(본인인증)다. |
| `/officer...` | 담당자 화면. 시작 주소는 <http://localhost:5173/officer>(신청 목록)다. |
| 그 밖의 주소(`/` 포함) | `?mode=officer`가 있으면 담당자 화면, 없으면 신청자 화면이다. 화면이 열리면 주소는 각각 `/officer`, `/apply/identity`로 바뀐다. |

화면을 오가는 탭은 없으므로 주소로 이동한다. Vite가 `/api` 요청을 8000 포트로 프록시하므로 별도 설정은 없다.
담당자 화면의 취업지원패키지 신청 상세 URL은 직접 열거나 새로고침해도 복원된다.

신청자 흐름은 **본인인증 → 서식 작성 → 서류 업로드 → 확인 및 제출**이며, 서식 작성 뒤에 지원 항목을
고른다. 서식 화면은 공고문 원본 PDF 위에서 온라인 작성·서명하고, 마이페이지는 상단 신청번호 옆 버튼으로
연다. 신청자 화면은 열릴 때 같은 탭에 저장된 신청을 복원하고, 없으면 취업지원패키지 초안 신청을 새로
만든다. 그래서 백엔드가 떠 있어야 하며 신청 건은 `demo/demo.db`에 쌓인다. 제출 전 초안은 담당자
목록에 보이지 않는다.

### 서류 업로드 시험용 2단계 자동 입력

`demo.backend.tools.seed_application`은 본인인증된 초안의 2단계(자가진단·서식·동의·서명·지원 항목)만
가짜 값으로 채우는 개발용 도구다. 화면에서 사람이 **1단계 본인인증까지** 마친 뒤, 저장소 루트에서 실행한다.
기본 대상은 본인인증을 마친 초안 중 2단계가 미완료인 가장 최근 신청 한 건이다.

시드한 신청은 2단계를 다시 저장하지 말 것.

```bash
PYTHONPATH=. python -B -m demo.backend.tools.seed_application
PYTHONPATH=. python -B -m demo.backend.tools.seed_application --application-id 123
PYTHONPATH=. python -B -m demo.backend.tools.seed_application --address '전북특별자치도 익산시 가짜시험로 0 (SEED 가상주소)' --frontend-url http://localhost:5173
```

실행 후 출력대로 **1단계를 한 같은 탭 주소창에** `http://localhost:5173/apply/upload`를
입력한다. 이 화면은 같은 탭의 `sessionStorage` 신청 ID를 복원한다. 새 탭에서는 저장된 신청 ID가
없어 새 초안의 본인인증 단계가 열리므로, 도구가 채운 신청이 열리지 않는다. 화면이 이미 열려
있다면 주소창에서 새로 이동해야 서버에 채운 값을 다시 읽는다.

본인인증 값은 만들거나 바꾸지 않는다. 서식의 중복 성명·생년월일은 인증 값에서
옮기고, 연락처·이메일·계좌·서명 등은 시험값을 넣는다. 취업지원패키지 신청의 지원 항목은 면접비 1회로
채운다. 기본 주소는 사업 설정의 대상 시군에 속하는 가상 주소다. 취업지원패키지에는 근로유형 선택이
없어 출력의 근로유형은 `해당 없음`으로 나온다. 이 도구는 시험용이며 신청을 제출하지 않는다 —
담당자 목록에 접수 건으로 올리려면 화면의 확인 및 제출 단계까지 마쳐야 한다.

```bash
# 이 도구가 표시한 신청과 관련 행·파일만 삭제 (나중에 올린 서류와 최초 인증 서약도 포함)
PYTHONPATH=. python -B -m demo.backend.tools.seed_application --clean
# 표시된 신청 한 건만 삭제
PYTHONPATH=. python -B -m demo.backend.tools.seed_application --clean --application-id 123
```

이미 2단계를 마친 신청·미인증 신청은 변경하지 않는다. 이 저장소의 기존
`demo/demo.db` 외의 DB는 거부하며, 오류 시 고정 코드만 출력한다. 정리 표시는
`form1_json._seed_application`에 저장된다.

### 담당자 화면 목업

취업지원패키지 기본 목록에 접수 건이 없으면 담당자 화면은 **목업 데이터**로 채워진다(상단에 노란
배너가 뜬다). <http://localhost:5173/officer?mock=1>로 강제로 켜고
<http://localhost:5173/officer?mock=0>으로 끈다 —
[보관된 담당자 화면 목업 기록](../docs/archive/officer-mock-data.md).
목업은 담당자 화면에만 있으며 `mock` 값은 `/officer` 주소에 붙인다. 루트 주소에 붙인 `/?mock=1`은 신청자 화면을 연다.
목업은 브라우저 메모리에서 동작하며 처리 결과는 새로고침하면 초기화된다. 심사 기준 편집은 실제 백엔드 API를 사용한다.

확인용 엔드포인트:

```bash
curl http://localhost:8000/api/health     # {"status":"ok"}
curl http://localhost:8000/api/programs   # 사업 2종 설정
```

API 문서는 <http://localhost:8000/docs> (FastAPI 자동 생성).

담당자 화면은 업로드 원본과 작성 서식을 브라우저 안에서 확인하며, 원본 파일 저장 기능은 제공하지 않는다.

---

## 4. 시연 초기화

합성 목업 시연에는 초기화가 필요하지 않다. 개발 중 실제 데모 DB·업로드 파일(신청자 화면에서 만든 신청 건 포함)을 삭제해야 할 때만 사용한다.
기존 데이터가 삭제되므로 서버를 멈추고 먼저 삭제 대상만 확인한다.

```bash
# 무엇을 지울지 보기만 한다
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.reset --dry-run

# 확인을 묻고 지운다
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.reset

# 확인 없이 지운다 (개발용 DB 삭제)
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.reset --yes
```

지우는 것은 `demo/demo.db`와 `demo/storage/` **둘뿐**이다. 소스·시연 샘플·문서는
건드리지 않고, git이 추적하는 파일은 하나도 지워지지 않는다.

> **Windows에서는 uvicorn을 먼저 멈춰야 한다.** 실행 중이면 SQLite 파일이 잠겨
> 삭제가 실패한다. 그 경우 안내 문구와 함께 종료코드 3으로 끝난다.

빈 DB는 서버를 다음에 띄울 때 자동으로 만들어진다.

---

## 5. 검증 스크립트

시나리오는 pytest 없이 그대로 실행된다. 기본 실행은 임시 폴더를 사용하므로 `demo/demo.db`·
`demo/storage/`(시연용 데이터)를 건드리지 않는다.
`demo/fixtures/samples/`가 없으면 첫 시나리오 실행 시 `make_samples`가 더미 PDF를 자동 생성한다.

```bash
# 저장소 루트에서
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p2_scenarios  # 업로드 즉시 판정
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p3_scenarios  # 통합심사·채점
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p4_scenarios  # 담당자 원본 서류 인라인·저장 경로 검사
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p5_scenarios  # 취업지원패키지 분기
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p6_scenarios  # 리셋 후 시연 10종 재현
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p7_scenarios  # 작성 서식 PDF 내보내기
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p8_localocr_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p9_identity_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p11_criteria_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p12_subsidy_criteria_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p13_household_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p14_pdf_forms_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p15_jbai_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p16_job_docs_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p17_own_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p18_applicant_precheck_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p19_nhis_history_scenarios
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p20_nhis_continuation_scenarios
```

실패한 시나리오 뒤에도 나머지를 끝까지 실행하려면 아래 반복문을 쓴다. 파일 이름 순서상 P11\~P20이 P2\~P9보다 먼저라, 첫 실패에서 멈추면 뒤 시나리오 결과를 확인할 수 없다.

```bash
for f in demo/backend/tests/run_p*_scenarios.py; do echo "== $f"; python -m demo.backend.tests.$(basename "$f" .py) || echo "FAILED $f"; done
```

`run_p6_scenarios`는 **리셋 → S1\~S10 연속 실행 → 기대값 대조**를 두 번 반복해,
리셋이 실제로 동작하고 두 번째 시연에서도 같은 화면이 나오는지(신청번호까지)
확인한다. 기대값은 `fixtures/expected/S*.json`에 있다.

`--live`를 주면 임시 폴더가 아니라 **진짜 `demo/`를 리셋하고** 거기서 돌린다.
담당자 시연 데이터 준비에는 쓰지 않는다. 끝나면 다시 리셋된 상태로 정리된다.

```bash
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.backend.tests.run_p6_scenarios --live
```

프론트엔드 점검:

```bash
cd demo/frontend
npm run lint
npm run build
node src/forms/phone.test.ts
```

`npm run lint`는 종료 코드 0에 경고 없이 끝난다. `npm run build`는 종료 코드 0이며, 신청자 화면과 담당자 화면을 따로 나눠 싣기 때문에 청크 크기 안내는
나오지 않는다. `node src/forms/phone.test.ts`는 신청자 서식의 전화번호 형식 단위 시험으로, Node가 TypeScript
파일을 직접 실행하므로 Node 22.18 이상에서 실행한다. 통과하면 오류 없이 종료 코드 0으로 끝난다.

---

## 6. 신청 서식 온라인 작성·보관

취업지원패키지 신청서·동의서는 신청자가 서식 작성 단계에서 원본 서식 PDF 위에 온라인으로 작성하고 서명한다.
회사가 작성하는 면접확인서 양식은 서류 업로드 단계에서 화면으로 확인하고 인쇄할 수 있다.
서식 작성 화면의 **다운로드** 메뉴에서는 작성한 서식 PDF를 받고, 원본 HWP가 제공되는 경우 HWP도 받는다.
담당자는 취업지원패키지 신청 상세에서 작성 서식과 업로드 원본을 브라우저 안에서 확인한다.

두배적금 화면은 없지만, 두 사업의 서식 생성·서명·PDF 보관 API와 템플릿은 보존되어 있다.
두배적금 서식과 스캔본 제출 계약은 백엔드 시험 대상이며, 이 프런트에는 그 작성 화면이 없다.

템플릿과 좌표 맵은 **원본 공고 PDF의 서식 쪽**에서 생성한다. 원본이 개정되면 저장소 루트에
원본 PDF를 준비하고 다음 명령을 실행한다.

```bash
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.fixtures.cut_templates
PYTHONIOENCODING=utf-8 PYTHONUTF8=1 python -m demo.fixtures.build_form_coords
```

각 원본 쪽은 A4 세로 페이지이며, 생성기는 서식 제목을 확인한 뒤 해당 쪽을 템플릿으로 만든다.

### 서식 글꼴

신청자 서식 입력 화면은 Noto KR WOFF2 서브셋을, 서식 PDF 합성은 Noto KR TTF 서브셋을 사용한다.
각 글꼴 폴더에 SIL OFL `OFL.txt`를 함께 두며, 백엔드 서식·글꼴 회귀 시험이 이 파일들을 확인한다.

- 고딕: `frontend/src/assets/fonts/NotoSansKR/` — [Noto Sans KR 원본·라이선스](https://github.com/google/fonts/tree/main/ofl/notosanskr)
- 명조: `frontend/src/assets/fonts/NotoSerifKR/` — [Noto Serif KR 원본·라이선스](https://github.com/google/fonts/tree/main/ofl/notoserifkr)
- 서브셋: KS X 1001 한글 2,350자, ASCII 영문·숫자·문장부호, 서식 좌표의 라벨·보기와 가상 입력값에 쓰인 글자를 포함한다. 배경 PDF 문구는 원본 서식의 글꼴로 보존된다.
- 자동 글꼴 범위 검증: `run_p14_pdf_forms_scenarios`가 두 글꼴의 TTF/WOFF2/OFL 존재와 서식·가상 입력 글리프를 확인한다.

---

## 7. 알아 둘 것

- **판독(OCR)은 단계형 체인**이다. 판독 순서는 시연 고정 응답 → 로컬 OCR → PDF 텍스트다. 전북AI 연동 코드는 있으나 이번 제출에서는 사용하지 않으며 JBAI_* 설정은 비워 둔다.
- 데모 로컬 OCR은 macOS를 포함한 모든 환경에서 own이 기본이다. 기본 선택에서 own 모델 파일이 없을 때만 easyocr로 대체한다. 명시한 own의 모델 누락·해시 오류·추론 오류에는 다른 OCR 엔진으로 대체하지 않는다. own 모델 설치는 macOS에서도 필요하다.
- `ENGINE_V2_OCR`의 비어 있지 않은 값은 데모 엔진 선택에 우선한다. `off`는 데모 전용이고, `engine_v2.engine.run`과 CLI 선택값은 `own` / `applevision` / `easyocr` / `paddle`이다.
- **점수는 신청자에게 절대 보이지 않는다**(공고문: "평가결과는 공개하지 않음").
  신청자 화면(마이페이지)이 쓰는 신청 상태 API 응답에 점수 관련 필드가 섞이는지는 계속 검증한다.
- **미확정 가정값**에는 `(데모 추정치)` 라벨이 붙어 있다. 중위소득 100\~130% 환산
  기준선, 판독 신뢰도·화질 컷라인, 취업패키지 서식 구성, 선착순 기준 시각이
  여기 해당한다. 화면과 코드 양쪽에 같은 문구로 노출된다.
- **서식 좌표는 손으로 적지 않았다.** 원본 PDF의 표 선(`get_drawings`)과 글자
  원점(`get_text("rawdict")`)에서 뽑는다. `run_p7_scenarios`가 좌표를 다시 뽑아
  커밋된 JSON과 대조하므로, 좌표를 손으로 고치면 검증이 깨진다.
- 담당자는 신청자가 올린 원본 서류를 화면에서만 본다. 신청자는 본인이 작성한 서식만
  내려받을 수 있다. P4 시나리오는 담당자 화면·API와 원본 파일 경로를 검사하고, 신청자용
  서식 제공 파일만 명시적 허용 목록에 둔다.

## 8. 취업지원패키지 기준 확인 (2026 공고)

- [2026년 전북청년 취업지원패키지 모집 공고](https://youth.wanju.go.kr/board/view.wanju?boardId=BBS_0000001&dataSid=77474&menuCd=DOM_000000114001000000&paging=ok&startPage=1)는 면접비·정장비 각 5만원 최대 2회, 사진비 2만원 1회, 응시료 5만원 최대 2회와 항목별 추가 서류를 안내한다. 공고 페이지는 한도 횟수가 신청서·연간·생애 중 어디에 누적되는지 명시하지 않는다. 현재 데모는 기준의 `count_scope`를 설정할 수 있게 하고 기본값은 기존 동작인 신청서 단위다. 운영 전 담당 기관 확인이 필요하다.
- 공고는 면접비와 면접정장비 모두 면접확인서를 요구하지만, 정장 대여 회차를 특정 면접 회차와 연결하라고 정하지 않는다. 데모에서는 확인서 중복 업로드를 막도록 신청자가 연결 면접 회차를 고르게 하며, 이 연결 규칙은 접수서류 요구를 구현하기 위한 데모 가정이다.
- 면접비 대상 기업은 사업장 고용보험 가입자 5인 이상이며 결격 사유가 없어야 한다. 공개 공고에는 그 가입자 수를 어떤 서류나 조회 절차로 검증할지 적혀 있지 않아, 데모는 자동 판정을 하지 않는다.
- 공고 페이지는 인정 시험 목록을 별도 첨부 파일로 안내한다. 현재 공개 페이지 본문에는 목록이 없어 연도별 첨부 내용을 기준에 복사하지 않았다. 시험 목록 자동 판정은 담당 기관이 2026년 첨부 내용을 확정한 뒤 연결해야 한다.
