export interface FinancialData {
   year: string;
   revenue: number;
   employeeCount: number;
}

export interface CompanyData {
   email: string | undefined;
   company: string;          // 회사명 (DART corp_name)
   regNum: string;           // 사업자번호
   addr: string;             // 주소
   phoneNum: string;         // 대표전화
   tax_type: string;         // 과세유형 (NTS)
   type: string;             // 업종코드 (DART induty_code)
   b_stt_cd: string;         // 상태코드 (01: 계속, 02: 휴업, 03: 폐업)
   status: string;           // 상태

   // DART 및 확장 정보
   ceo?: string;
   foundationDate?: string;
   corpType?: string;
   faxNum?: string;
   stockCode?: string;

   // 하이브리드 수집 정보 (크롤링 및 맵)
   representativeEmail?: string;
   naverMapLink?: string;
   kakaoMapLink?: string;

   // 5개년 재무/고용 데이터
   history?: FinancialData[];
}
