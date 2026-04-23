/* api가 준 응답데이터를 가공해서 사용하기 좋게 제공하기 위해 담는 상자*/
package com.example.demo.DTO;

import lombok.Data;

//annotation: 우리가 100줄이 넘는 복잡한 웹 서버 통신 코드를 직접 짜는 대신,
//메서드나 클래스 위에 포스트잇(@)을 딱 붙여두면 스프링이 서버를 켤 때 그걸 쓱 읽고 
//알아서 백그라운드 작업을 처리해 주는 것입니다.

//@Data: 코드 상에는 보이지 않지만, 내부적으로 이 4개 변수들의 값을 읽고 쓸 수 있는 getCompany(), setCompany() 같은
//메서드들을 자동으로 만들어주는 편리한 기능

@Data
public class CompanyResponseDTO {
      /* 왜 accesscontroller 에서 private 주냐면 프라이버시보장(deta encapsulation(자료은닉))하기 위해서 */
      private String company; // 회사 이름
      private String regNum; // 사업자등록번호
      private String addr; // 주소
      private String phoneNum; // 전화번호

}