// API를 호출하여 사업자 상태를 가져오는 부분(실무자의 API호출로직)
//RestTemplate: 밖으로 나가서 데이터를 가져오는 배달부 🛵
//ObjectMapper: 배달부가 가져온 외국의 문서(JSON)를 한국말(Java 코드)로 번역해주는 번역가 👨‍🏫

package com.example.demo;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.DTO.companyRequestDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service // 이클래스는 "비즈니스로직"을설계하는클래스라고스프링에게 알려주는 어노테이션 : 이 파일(CompanyService.java)이
         // '서비스(Service)' 역할을 하는 부품(클래스)임을 스프링에게 알리는 신호입니다. 스프링은 이 신호를 보고 "아, 이 부품은 데이터를
         // 처리하거나 외부 API를 다루는 심부름꾼이구나!"라고 인식하고 잘 챙겨둡니다.
public class companyService {

   @Value("${nts.api.key}") // propertie파일에 저장된 값을 이 변수로 읽어와서 할당해줘!
   String serviceKey;// 이건 이제 외부 api 키를 읽어오는 전용 변수임

   public String getBusinessStatus(String regNum) {// 여기에 국세청 API를 호출하는 코드가 들어갈거임.
      try {
         // 1. 통신 배달부 생성
         RestTemplate restTemplate = new RestTemplate();// 외부 API와 통신을 담당하는 객체
         // 문서를 번역할 번역가 생성
         ObjectMapper objectMapper = new ObjectMapper();// json 문자열(텍스트)을 자바 객체로 변환해주는 번역가

         // 2. 목적지(국세청 API) 주소 설정
         String ntsUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey="
               + serviceKey;

         // 3. 보낼 택배 상자(Request Body) 포장하기 📦
         // 어제 만든 DTO 상자를 꺼내서, 사용자가 입력한 사업자번호를 리스트 형태로 담습니다.
         companyRequestDTO requestDTO = new companyRequestDTO();
         requestDTO.setB_no(Arrays.asList(regNum)); // 배열(List) 형태로 담아줌!

         // 4. 택배 송장(Headers) 붙이기 🏷️
         // 국세청 서버에게 "우리가 보내는 상자는 JSON 형식의 데이터야!" 라고 알려줘야 합니다.
         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_JSON);

         // 송장(Headers)과 상자(Body)를 하나로 묶음(HttpEntity)
         HttpEntity<companyRequestDTO> requestEntity = new HttpEntity<>(requestDTO, headers);

         // 5. 통신 배달부(RestTemplate)가 ntsUrl로 가서 묶어둔 택배(requestEntity)를 보내고 응답을 받아옵니다.
         // 사용법: restTemplate.postForObject(목적지주소, 보낼택배, 받을데이터타입);
         String jsonResponse = restTemplate.postForObject(ntsUrl, requestEntity, String.class);

         // 6. 통역사(ObjectMapper)가 jsonResponse를 분석해서 우리가 원하는 값을 뽑아냅니다
         JsonNode rootNode = objectMapper.readTree(jsonResponse);

         // 7. "data" 배열의 첫 번째 항목[0]에서 "b_stt"(영업상태) 값을 쏙 뽑아냅니다.
         String status = rootNode.path("data").get(0).path("b_stt").asText();
         System.out.println("API 응답 상태: " + status);

         return status;

      } catch (Exception e) {
         System.out.println("통신 에러 발생: " + e.getMessage());
         return "조회 중 에러 발생";
      }

   }

}
