/*데이터의 모양과 규칙을 모아두는 방*/
// 1. 방금 우리가 만든 데이터 껍데기 (자바의 DTO 클래스 역할)

export interface CompanyData {// 백엔드에서 받아올 데이터의 규칙을 정의

   company: string;
   regNum: string;
   addr: string;
   phoneNum: string;
   status: string;

}

