export interface FinancialData {
   year: string;
   revenue: number;
   employeeCount: number;
}

export interface CompanyData {
   company: string;          // 회사명 (DART corp_name)
   regNum: string;           // 사업자번호
   addr: string;             // 주소
   phoneNum: string;         // 대표전화
   tax_type: string;         // 과세유형 (NTS)
   type: string;             // 업종코드 (DART induty_code)
   b_stt_cd: string;         // 상태코드 (01: 계속, 02: 휴업, 03: 폐업)
   status: string;           // 상태

   // DART 기업개황 데이터
   ceo?: string;             // 대표자명
   foundationDate?: string;  // 설립일 (YYYY-MM-DD)
   corpType?: string;        // 기업구분 (유가증권시장, 코스닥 등)
   faxNum?: string;          // 대표팩스
   email?: string;           // 홈페이지 URL
   stockCode?: string;       // 종목코드 (상장사)

   // 5개년 재무/직원 데이터
   history?: FinancialData[];
}
