# 청년 취업지원패키지 담당자 화면

청년 취업지원패키지 신청 목록과 제출 서류, 판독 결과·판정 근거를 확인하고 심사하는 **담당자 전용 데모 저장소**입니다. 앱을 열면 바로 담당자 신청 목록으로 이동합니다.

향후 공고문·서식 PDF를 등록하면 신청 페이지가 구성되는 범용 신청 서비스로 확장할 예정입니다.

## 관련 저장소

| 용도 | 저장소 |
|---|---|
| 전체 안내 | [26-2-capstone](https://github.com/zohijin-k/26-2-capstone) |
| 관련 화면 | [26-2-savings-applicant](https://github.com/zohijin-k/26-2-savings-applicant) |
| 관련 화면 | [26-2-savings-officer](https://github.com/zohijin-k/26-2-savings-officer) |
| 관련 화면 | [26-2-youth-applicant](https://github.com/zohijin-k/26-2-youth-applicant) |

## 실행 방법 — Windows WSL2(Ubuntu)

이번에 검증한 환경은 **WSL2 Ubuntu 24.04.5 LTS · Python 3.12.3 · Node 22.23.4 · npm 10.9.9**입니다. Python 3.12 이상, Node 22.13 이상과 GitHub CLI가 준비된 Ubuntu 터미널에서 실행합니다.

```bash
gh repo clone zohijin-k/26-2-youth-officer
cd 26-2-youth-officer
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

브라우저에서 <http://localhost:5173>을 엽니다. `/api` 요청은 백엔드의 8000 포트로 전달됩니다. API 문서는 <http://localhost:8000/docs>입니다.

**Windows 네이티브: 이번에 검증하지 않음.**

### macOS — 이번에 검증하지 않음

기존 macOS 안내를 기준으로, Python 3.12 이상과 Node 22.13 이상을 준비하고 위의 `gh repo clone`부터 설치·실행 명령을 그대로 사용합니다. 가상환경은 `python3 -m venv .venv`, `source .venv/bin/activate`로 생성·활성화합니다. macOS에서도 own 모델 다운로드가 필요하며, 엔진 의존성의 Apple Vision 패키지는 macOS에서만 설치됩니다.

## 합성 데이터로 시연하기

서버와 프런트를 실행한 뒤 <http://localhost:5173/?mock=1>을 엽니다. 기존 **합성 목업**으로 취업지원패키지 목록·상세·심사 동작을 확인할 수 있습니다. 화면의 목업 배너로 시연 데이터임을 구분합니다.

- 합성 목업은 브라우저 메모리에서 생성되며 DB에 신청을 넣지 않습니다.
- 목업의 심사 처리 결과는 새로고침하면 초기화됩니다. 서류 미리보기도 합성 예시입니다.
- 심사 기준 편집은 백엔드 API를 사용하므로 백엔드를 함께 실행합니다.
- 실제 접수 목록만 확인하려면 <http://localhost:5173/?mock=0>을 엽니다. 접수 건이 없으면 빈 목록으로 표시됩니다.

실서류는 시연·시험에 사용하지 않습니다. 내려받은 모델, 생성 문서, 업로드 저장소와 SQLite DB는 커밋하지 않습니다.

## 검증

저장소 루트에서 가상환경을 활성화한 뒤 실행합니다.

```bash
python -m pip install pytest
python -m pytest engine_v2/tests -q -ra
python -m pytest demo/backend/tests -q -ra
cd demo/frontend
npm run lint
npm run build
```

시나리오 18개 모듈의 실행 방법은 [데모 안내](demo/README.md#5-검증-스크립트)에 있습니다. 시험은 합성 데이터와 임시 DB·저장소를 사용합니다.

## 참고 문서

- [개발 안내](docs/DEVELOPMENT.md): 저장소 구조·OCR 설정·검증
- [데모 안내](demo/README.md): 담당자 화면·시나리오·보존된 백엔드 기능
- [제3자 고지](THIRD_PARTY_NOTICES.md): 모델·글꼴·패키지 출처와 라이선스
