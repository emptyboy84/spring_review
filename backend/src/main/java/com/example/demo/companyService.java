// API를 호출하여 사업자 상태를 가져오는 부분
//RestTemplate: 밖으로 나가서 데이터를 가져오는 배달부 🛵
//ObjectMapper: 배달부가 가져온 외국의 문서(JSON)를 한국말(Java 코드)로 번역해주는 번역가 👨‍🏫

package com.example.demo;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service // 이클래스는 "비즈니스로직"을설계하는클래스라고스프링에게 알려주는 어노테이션 : 이 파일(CompanyService.java)이
         // '서비스(Service)' 역할을 하는 부품(클래스)임을 스프링에게 알리는 신호입니다. 스프링은 이 신호를 보고 "아, 이 부품은 데이터를
         // 처리하거나 외부 API를 다루는 심부름꾼이구나!"라고 인식하고 잘 챙겨둡니다.
public class companyService {
   String regNum;

   public String getBusinessStatus(String regNum) {// 여기에 국세청 API를 호출하는 코드가 들어갈거임.
      try {
         // 1. 통신 배달부 생성
         RestTemplate restTemplate = new RestTemplate();// 외부 API와 통신을 담당하는 객체
         // 문서를 번역할 번역가 생성
         ObjectMapper objectMapper = new ObjectMapper();// json 문자열(텍스트)을 자바 객체로 변환해주는 번역가

         // 2. 목적지(국세청 API) 주소
         String ntsUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=발급받은키...";

         // 3.통신 배달부(RestTemplate)가 ntsUrl로 가서 데이터를 받아옵니다.
         // 사용법: restTemplate.postForObject(목적지주소, 보낼상자, 받을데이터타입);
         String jsonResponse = restTemplate.postForObject(ntsUrl, null, String.class);

         // 4. 통역사(ObjectMapper)가 jsonResponse를 분석해서 우리가 원하는 값을 뽑아냅니다.
         JsonNode rootNode = objectMapper.readTree(jsonResponse);// JsonProcessingException('Checked Exception')을
         // 던지는 코드이므로 throws를 메서드에 추가해줘야한다.
         // 가져온json문서

         // 5. "data" 배열의 첫 번째 항목[0]에서 "b_stt"(영업상태) 값을 쏙 뽑아냅니다.
         String status = rootNode.path("data").get(0).path("b_stt").asText();
         System.out.println(status);
         return status;

      } catch (Exception e) {
         System.out.println(e.getMessage());
         return "에러";
      }
   }

   // public String restTemplate(String regNum) {// restTemplate는 국세청 API를 호출하는
   // 메서드( 자바 코드 안에서 작동하는 '눈에 보이지 않는 웹 브라우저'라고
   // // 생각하시면 됩니다. 우리가 주소창에 URL을 입력하고 엔터를 치듯, 자바가 국세청 서버 URL로 요청을 쏘고 결과(데이터)를
   // // 받아오게 해주는 통신 전담 배달부 역할)

   // return "";
   // }

}
