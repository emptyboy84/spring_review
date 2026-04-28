# [명세서] 하네스 엔지니어링 (Harness Engineering) 기업 분석 모델

본 문서는 기업 분석 플랫폼 '하네스 엔지니어링(Harness Engineering)'의 핵심 데이터 모델 및 기능 요구사항을 명세화합니다. 본 모델은 DART(전자공시시스템) 및 국세청의 공공 데이터를 활용하여 기업의 가치를 정교하게 평가하고 제어하는 것을 목적으로 합니다.

---

## 1. 데이터 모델 정의 (HDM: Harness Data Model)

시스템은 각 기업에 대해 다음 10가지 핵심 필드를 반드시 추출하고 유지해야 합니다.

### 1.1 기본 식별 정보 (Identity)
- **ID-01. 회사명 (Company Name)**: 국문 정식 법인명.
- **ID-02. 사업자등록번호 (Business Registration Number)**: 10자리 숫자 (하이픈 포함 가능).
- **ID-03. 설립일 (Foundation Date)**: 법인 설립 연월일 (YYYY-MM-DD).

### 1.2 재무 및 성과 (Financial Performance)
- **FN-01. 매출액 (Revenue)**: 
  - 최근 5개년 데이터 추출.
  - **IFRS 연결 재무제표** 기준을 최우선으로 하며, 없을 경우 개별 재무제표 채택.
  - 단위: 원 (프론트엔드에서는 억/조 단위 변환 표시).
- **FN-02. 인원수 (Employee Count)**:
  - 최근 5개년 데이터 추출.
  - 사업보고서상의 '직원 현황' 합계 기준.

### 1.3 기업 분류 및 성격 (Classification)
- **CL-01. 기업구분 (Corporate Category)**: 
  - 유가증권(KOSPI), 코스닥(KOSDAQ), 코넥스(KONEX), 기타외감, 대기업, 중소기업 등 구분.
- **CL-02. 업종 (Industry)**: 한국표준산업분류(KSIC) 코드 및 업종명.

### 1.4 연락처 및 채널 (Communication)
- **CM-01. 대표전화번호 (Representative Phone)**: 기업의 메인 고객센터 또는 본사 전화번호.
- **CM-02. 대표팩스번호 (Representative Fax)**: 기업의 공식 팩스 번호.
- **CM-03. 대표메일주소 (Representative Email)**: 기업의 공식 컨택 메일 또는 IR 담당 메일 (DART 홈페이지 URL 데이터 활용 및 매핑).

---

## 2. 데이터 획득 전략 (Data Sourcing Strategy)

단순 공공 API의 한계를 극복하기 위해 **'하이브리드 데이터 수집 엔진'**을 가동합니다.

### 2.1 1차 소스: 공식 Open API (Official)
- **Open DART**: 상장 및 외감 법인의 5개년 재무/고용 데이터, 기업개황 정보.
- **국세청(NTS)**: 사업자등록번호 기반 실시간 영업 상태(휴/폐업) 정보.

### 2.2 2차 소스: 웹 데이터 엔진 (Web Scraping & Crawling)
DART에 없는 중소기업(SME)이나 누락된 정보를 보완하기 위해 다음 사이트를 크롤링 및 스크래핑합니다.
- **크레딧잡(KreditJob) / 사람인 / 잡코리아**: DART 미신고 중소기업의 실시간 인원수 및 퇴사율, 매출 데이터 보완.
- **NiceBizInfo / BizNo.net**: 기업별 대표 메일 및 전화번호 인덱스 DB 구축용 데이터 추출.
- **공식 홈페이지(Crawler)**: DART에서 제공하는 `hm_url`에 접속하여 `Contact Us` 페이지의 `mailto:` 태그를 파싱, **대표 메일 주소**를 직접 추출.

### 2.3 맵 서비스 연동 (Map Services & Location)
공공 데이터에서 누락되거나 최신화가 늦은 연락처 및 위치 정보를 보완하기 위해 국내 주요 맵 서비스를 연동합니다.
- **네이버 지도(Naver Maps)**: 플레이스 데이터를 검색하여 최신 **대표 전화번호**, 업체 사진, 정확한 위치(좌표) 정보를 확보.
- **카카오맵(Kakao Maps)**: 카카오 로컬 API를 통해 주소 정제 및 전화번호 기반의 **역조회(Reverse Search)**를 지원하여 검색 정확도 극대화.

### 2.4 검색 엔진 역매핑 (Search Engine Proxy)
- **Google/Naver Search API**: 
  - **전화번호 역조회**: 사용자가 전화번호만 입력했을 때, 맵 데이터 및 웹 검색 결과를 실시간 파싱하여 연관 기업명을 추출.
  - **최신성 유지**: 폐업 신고 전이라도 검색 엔진 및 맵 상의 최신 리뷰/활동 정보를 통해 영업 여부를 교차 검증.

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 하네스 통합 검색 (Unified Search)
사용자는 단일 검색창을 통해 다음 3가지 모드로 기업을 식별할 수 있어야 합니다.

1.  **명칭 검색 (Search by Name)**: 
    - 키워드 포함 검색 및 자동완성 기능 제공.
    - DART 고유번호(corp_code) 및 외부 기업 DB 통합 검색.
2.  **번호 검색 (Search by Business No)**:
    - 10자리 사업자등록번호 입력 시 즉시 해당 기업 프로필 로드.
3.  **연락처 검색 (Search by Phone)**:
    - **역조회 엔진**: DB에 없는 번호일 경우 실시간 웹 크롤링을 통해 해당 번호의 소유 법인을 추적하여 결과 표시.

### 2.2 데이터 시각화 (Visualization)
- **매출/고용 트렌드 차트**: 5개년 매출액과 인원수를 멀티 바(Bar) 차트 또는 라인(Line) 차트로 시각화하여 성장성 지표 제공.
- **영업 상태 인디케이터**: 국세청 실시간 데이터를 기반으로 '정상영업', '휴업', '폐업' 상태를 색상별(Green/Amber/Red)로 표시.

---

## 3. 기술 스택 요건 (Technical Requirements)

- **Backend**: Java Spring Boot 3.x
  - RestTemplate/WebClient를 활용한 DART/NTS API 연동.
  - `corpCode.xml` 메모리 캐싱 및 ZIP 파싱 엔진.
- **Frontend**: Next.js 14+ (React)
  - Tailwind CSS 기반 프리미엄 다크/라이트 모드 테마.
  - Chart.js 또는 Recharts를 이용한 데이터 시각화.
- **External APIs**:
  - **Open DART**: 기업개황, 재무제표, 직원현황.
  - **공공데이터포털(국세청)**: 사업자등록 상태 조회.

---

## 4. 디자인 철학 (Design Philosophy)

'하네스 엔지니어링'은 신뢰와 정밀함을 상징합니다.
- **Aesthetics**: MoneyPin(Bizno)의 직관성과 전문성을 벤치마킹하여, 데이터 중심의 깔끔한 그리드 레이아웃과 고대비 가독성 확보.
- **UX**: 최소한의 클릭으로 가장 심오한 데이터(매출 추이 등)에 접근할 수 있는 사용자 흐름 설계.
