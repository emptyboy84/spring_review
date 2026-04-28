import { CompanyData } from "@/types/company";

const API_BASE = "http://localhost:8080/company";

// 통합 검색 (명칭, 사업자번호, 전화번호 자동 판별)
export const fetchUnifiedSearch = async (keyword: string): Promise<any> => {
   const response = await fetch(`${API_BASE}/api/unified?keyword=${encodeURIComponent(keyword)}`);
   if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
   }
   return await response.json();
};

// corp_code로 상세 조회 (검색 리스트에서 기업 선택 시)
export const fetchDetailByCorpCode = async (corpCode: string): Promise<any> => {
   const response = await fetch(`${API_BASE}/api/detail?corpCode=${encodeURIComponent(corpCode)}`);
   if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
   }
   return await response.json();
};

// 사업자번호로 직접 조회 (하위 호환)
export const fetchCompanyStatus = async (inputRegNum: string): Promise<CompanyData> => {
   const response = await fetch(`${API_BASE}/api/status?regNum=${inputRegNum}`);
   if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
   }
   return await response.json();
};