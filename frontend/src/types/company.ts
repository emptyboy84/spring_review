/*데이터의 모양과 규칙을 모아두는 방*/
// 1. 방금 우리가 만든 데이터 껍데기 (자바의 DTO 클래스 역할)

export interface CompanyData {// 백엔드에서 받아올 데이터의 규칙을 정의

   company: string;//회사명
   regNum: string;//사업자번호
   addr: string;//주소
   phoneNum: string;//전화번호
   tax_type: string;//과세유형
   type: string;//업종
   b_stt_cd: string;//백엔드에서 실제값 저장하는곳
   status: string;//화면에서 쓸 이름(front)
}

