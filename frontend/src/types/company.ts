// 1. 방금 우리가 만든 데이터 껍데기 (자바의 DTO 클래스 역할)
export interface CompanyData {
   company: string;
   regNum: string;
   addr: string;
   phoneNum: string;
}

// 2. 백엔드와 통신하는 함수
export const fetchCompanyStatus = async (inputRegNum: string): Promise<string> => {
   try {
      const response = await fetch(`http://localhost:8080/company/api/status?regNum=${inputRegNum}`);
      const statusText = await response.text();
      return statusText;

   } catch (error) {
      console.error("조회 실패:", error);
      throw error;
   }
};