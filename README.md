# 청년 취업지원패키지 신청자 전용

전북청년 취업지원패키지 신청자가 본인인증, 서식 작성·서명, 지원 항목 선택, 서류 업로드, 확인·제출과 신청 현황 조회를 진행하는 저장소입니다. 앱을 열면 사업 선택 없이 본인인증 단계로 이동합니다.

앞으로 담당자가 제공한 공고문·서식 PDF에 맞춰 신청 페이지가 구성되는 범용 신청 서비스로 확장할 예정입니다.

## 관련 저장소

| 저장소 | 역할 |
| --- | --- |
| [26-2-capstone](https://github.com/zohijin-k/26-2-capstone) | 전체 프로젝트 안내 |
| [26-2-savings-applicant](https://github.com/zohijin-k/26-2-savings-applicant) | 두배적금 신청자 |
| [26-2-savings-officer](https://github.com/zohijin-k/26-2-savings-officer) | 두배적금 담당자 |
| [26-2-youth-officer](https://github.com/zohijin-k/26-2-youth-officer) | 청년 취업지원패키지 담당자 |

## 실행 환경

이번에 검증한 환경은 **WSL2 (Ubuntu 24.04.5 LTS), Python 3.12.3, Node.js 22.23.4, npm 10.9.9**입니다. 아래 명령은 Ubuntu 터미널에서 실행합니다. 저장소는 WSL 홈 디렉터리 아래에 둡니다.

- Windows 네이티브(PowerShell): 이번에 검증하지 않음.
- macOS: 이번에 검증하지 않음.

## 설치와 모델 받기

처음 받는 경우 WSL 홈 디렉터리에서 실행합니다. 이미 받은 저장소가 있으면 해당 디렉터리로 이동합니다.

```bash
cd ~
gh repo clone zohijin-k/26-2-youth-applicant
cd 26-2-youth-applicant
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r demo/backend/requirements.txt -r engine_v2/requirements.txt
python -m engine_v2.tools.fetch_own_models
```

모델 다운로드 도구는 검출 모델·한국어 인식 모델·사전의 SHA-256을 검증합니다. 로컬 OCR은 own 모델을 사용하며, 내려받은 모델 파일은 Git에 포함하지 않습니다. WSL2에서는 macOS 전용 Apple Vision 패키지(ocrmac·pyobjc)를 설치하지 않습니다.

프런트엔드 의존성은 잠금 파일에 맞춰 설치합니다.

```bash
cd demo/frontend
npm ci
```

## 백엔드와 프런트엔드 실행

터미널 두 개를 사용합니다. 첫 번째 터미널은 저장소 루트에서 가상환경을 활성화한 뒤 실행합니다.

```bash
source .venv/bin/activate
uvicorn demo.backend.main:app --reload --port 8000
```

두 번째 터미널에서는 프런트엔드를 실행합니다.

```bash
cd demo/frontend
npm run dev
```

브라우저에서 <http://localhost:5173>을 엽니다. Vite가 `/api` 요청을 백엔드의 8000 포트로 전달합니다. 백엔드 API 문서는 <http://localhost:8000/docs>에서 확인할 수 있습니다.

## 개발 시 데이터와 라이선스

개발·시험에는 합성 데이터만 사용합니다. 업로드 파일·로컬 DB·내려받은 모델은 커밋하지 않습니다. 외부 OCR 서비스는 이번 로컬 실행에 필요하지 않으며 JBAI_* 설정은 비워 둡니다.

모델·글꼴·패키지의 출처와 라이선스는 [제3자 고지](THIRD_PARTY_NOTICES.md), own 모델 정보는 [own OCR 안내](engine_v2/docs/own-ocr.md)를 참고하세요.
