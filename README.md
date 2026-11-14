# 청년 취업지원패키지 신청자·담당자 화면

청년 취업지원패키지 **신청자 화면과 담당자 화면을 함께 담은 데모 저장소**입니다. 신청자는 본인인증, 서식 작성·서명, 지원 항목 선택, 서류 업로드, 확인·제출과 신청 현황 조회를 진행하고, 담당자는 신청 목록과 제출 서류, 판독 결과·판정 근거를 확인하고 심사합니다. 두 화면은 프런트엔드 하나에 들어 있으며, 주소에 따라 둘 중 하나가 열립니다.

향후 공고문·서식 PDF를 등록하면 신청 페이지가 구성되는 범용 신청 서비스로 확장할 예정입니다.

## 관련 저장소

| 용도 | 저장소 |
|---|---|
| 전체 안내 | [26-2-capstone](https://github.com/zohijin-k/26-2-capstone) |
| 관련 화면 | [26-2-savings-applicant](https://github.com/zohijin-k/26-2-savings-applicant) |
| 관련 화면 | [26-2-savings-officer](https://github.com/zohijin-k/26-2-savings-officer) |

## 실행 방법 — Windows WSL2(Ubuntu)

엔진·백엔드·시나리오 기준선은 두 화면을 합치기 전 기준 커밋 `e449c55`에서 **WSL2 Ubuntu 24.04.5 LTS · Python 3.12.3 · Node 22.23.4 · npm 10.9.9**로 측정했습니다. 두 화면을 합친 뒤에는 macOS(Python 3.14.6 · Node 26.13.1 · npm 11.20.0)에서 같은 수치와 프런트엔드 lint·build·단위 시험을 확인했고, WSL2에서는 다시 실행하지 않았습니다. Python 3.12 이상, Node 22.13 이상과 GitHub CLI가 준비된 Ubuntu 터미널에서 실행합니다.

```bash
gh repo clone zohijin-k/26-2-youth
cd 26-2-youth
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r demo/backend/requirements.txt -r engine_v2/requirements.txt
python -m engine_v2.tools.fetch_own_models
cd demo/frontend
npm ci
cd ../..
```

own OCR 모델은 다운로드할 때 고정 SHA-256으로 검증합니다. 모델 파일은 저장소에 포함하지 않습니다. WSL2에서는 Apple Vision 패키지가 설치 대상에서 제외됩니다. JBAI_* 설정은 비워 둡니다.

터미널 두 개에서 실행합니다.

```bash
# 터미널 1: 저장소 루트
source .venv/bin/activate
python -m uvicorn demo.backend.main:app --reload --port 8000
```

```bash
# 터미널 2: 저장소 루트에서
cd demo/frontend
npm run dev
```

프런트 개발 서버 주소는 <http://localhost:5173>입니다. 주소에 따라 화면이 정해집니다.

| 주소 | 열리는 화면 |
|---|---|
| <http://localhost:5173/apply/identity> | 신청자 화면. 본인인증 단계에서 시작합니다. |
| <http://localhost:5173/officer> | 담당자 화면. 신청 목록에서 시작합니다. |
| <http://localhost:5173/> | 신청자 화면으로 이동합니다(주소가 `/apply/identity`로 바뀝니다). `/?mode=officer`로 열면 담당자 화면으로 이동합니다. |

`/api` 요청은 백엔드의 8000 포트로 전달됩니다. API 문서는 <http://localhost:8000/docs>입니다.

신청자 화면은 백엔드 API로 신청을 만들고 저장하므로 백엔드를 함께 실행합니다. 처음 열면 취업지원패키지 초안 신청이 만들어지고, 같은 탭에서 다시 열면 진행 중이던 신청을 이어서 엽니다. 서류 업로드 단계만 시험하는 개발용 도구는 [데모 안내](demo/README.md#3-기동)에 있습니다.

**Windows 네이티브: 이번에 검증하지 않음.**

### macOS — 설치 절차는 이번에 검증하지 않음

기존 macOS 안내를 기준으로, Python 3.12 이상과 Node 22.13 이상을 준비하고 위의 `gh repo clone`부터 설치·실행 명령을 그대로 사용합니다. 가상환경은 `python3 -m venv .venv`, `source .venv/bin/activate`로 생성·활성화합니다. macOS에서도 own 모델 다운로드가 필요하며, 엔진 의존성의 Apple Vision 패키지는 macOS에서만 설치됩니다.

## 합성 데이터로 시연하기

서버와 프런트를 실행한 뒤 <http://localhost:5173/officer?mock=1>을 엽니다. 기존 **합성 목업**으로 취업지원패키지 담당자 목록·상세·심사 동작을 확인할 수 있습니다. 화면의 목업 배너로 시연 데이터임을 구분합니다.

- 합성 목업은 담당자 화면에만 있습니다. 브라우저 메모리에서 생성되며 DB에 신청을 넣지 않습니다.
- 목업의 심사 처리 결과는 새로고침하면 초기화됩니다. 서류 미리보기도 합성 예시입니다.
- 심사 기준 편집은 백엔드 API를 사용하므로 백엔드를 함께 실행합니다.
- 실제 접수 목록만 확인하려면 <http://localhost:5173/officer?mock=0>을 엽니다. 접수 건이 없으면 빈 목록으로 표시됩니다.
- `mock` 값은 `/officer` 주소에 붙입니다. 루트 주소에 붙인 `/?mock=1`은 신청자 화면을 엽니다.

실서류는 시연·시험에 사용하지 않습니다. 신청자 화면에 올리는 서류도 합성 데이터만 사용합니다. 내려받은 모델, 생성 문서, 업로드 저장소와 SQLite DB는 커밋하지 않습니다.

## 검증

저장소 루트에서 가상환경을 활성화한 뒤 실행합니다.

```bash
python -m pip install pytest
python -m pytest engine_v2/tests -q -ra
python -m pytest demo/backend/tests -q -ra
cd demo/frontend
npm run lint
npm run build
node src/forms/phone.test.ts
```

기대 결과는 다음과 같습니다.

- 엔진: own 모델을 설치한 상태에서, 합성 글꼴을 `python -m engine_v2.tools.fetch_synth_fonts`로 받아 두었으면 1,267개 통과, 받지 않았으면 1,264개 통과·3개 건너뜀입니다. 글꼴은 `engine_v2/data/synth_fonts/`에 받으며 커밋하지 않습니다.
- 백엔드: 1,227개 통과입니다.
- `npm run lint`: 종료 코드 0, 경고 없음입니다.
- `npm run build`: 종료 코드 0입니다. 두 화면을 나눠 싣기 때문에 청크 크기 안내는 나오지 않습니다.
- `node src/forms/phone.test.ts`: 신청자 서식의 전화번호 형식 단위 시험입니다. Node가 TypeScript 파일을 직접 실행하므로 이 명령은 Node 22.18 이상에서 실행합니다. 통과하면 오류 없이 종료 코드 0으로 끝납니다.

시나리오 18개 모듈의 실행 방법은 [데모 안내](demo/README.md#5-검증-스크립트)에 있습니다. 시험은 합성 데이터와 임시 DB·저장소를 사용합니다.

## 참고 문서

- [개발 안내](docs/DEVELOPMENT.md): 저장소 구조·OCR 설정·검증
- [데모 안내](demo/README.md): 신청자·담당자 화면·시나리오·서식 기능
- [제3자 고지](THIRD_PARTY_NOTICES.md): 모델·글꼴·패키지 출처와 라이선스
