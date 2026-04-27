import { CompanyData } from "@/types/company";

// 사업자번호로 통합 조회 (국세청 상태 + DART 기업정보 + 재무 + 직원수)
export const fetchCompanyStatus = async (inputRegNum: string): Promise<CompanyData> => {
   const response = await fetch(`http://localhost:8080/company/api/status?regNum=${inputRegNum}`);
   if (!response.ok) {
      throw new Error(`서버 응답 에러: ${response.status}`);
   }
   const data = await response.json();
   return data;
};

// 회사명으로 검색 (자동완성)
export const searchByName = async (keyword: string): Promise<{ corpName: string; corpCode: string }[]> => {
   const response = await fetch(`http://localhost:8080/company/api/search?keyword=${encodeURIComponent(keyword)}`);
   if (!response.ok) {
      throw new Error(`검색 에러: ${response.status}`);
   }
   return await response.json();
}; 