/*DataTransferObject*/
/* 외부 API에게 보낼 요청값을 담는 상자*/
package com.example.demo.DTO;

import java.util.List;

public class CompanyRequestDTO {
   private List<String> b_no; // 사업자 등록번호를 담을 리스트
   private List<String> b_stt; // 사업자상태를 담을 리스트 : service에서 사용함

   public List<String> getB_no() { // 값을 꺼내올 때 get
      return b_no;
   }

   public void setB_no(List<String> b_no) { // 값을 넣을 때 set
      this.b_no = b_no;
   }

   public List<String> getB_stt() {
      return b_stt;
   }

   public void setB_stt(List<String> b_stt) {
      this.b_stt = b_stt;
   }
}
