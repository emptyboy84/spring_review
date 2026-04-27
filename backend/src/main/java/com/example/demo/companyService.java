// API를 호출하여 사업자 상태를 가져오는 부분(실무자의 API호출로직)
//RestTemplate: 밖으로 나가서 데이터를 가져오는 배달부 🛵
//ObjectMapper: 배달부가 가져온 외국의 문서(JSON)를 한국말(Java 코드)로 번역해주는 번역가 👨‍🏫

package com.example.demo;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;// java가 이해할수 있도록 번역해주는애 json형식을 java의 클래스형식으로 변환

@Service // 이클래스는 "비즈니스로직"을설계하는클래스라고스프링에게 알려주는 어노테이션 : 이 파일(CompanyService.java)이
         // '서비스(Service)' 역할을 하는 부품(클래스)임을 스프링에게 알리는 신호입니다.
         // 스프링은 이 신호를 보고 "아, 이 부품은 데이터를
         // 처리하거나 외부 API를 다루는 심부름꾼이구나!"라고 인식하고 잘 챙겨둡니다.
public class CompanyService {

   @Value("${nts.api.key}") // propertie파일에 저장된 값을 이 변수로 읽어와서 할당해줘!
   private String serviceKey;// 이건 이제 외부 api 키를 읽어오는 전용 변수임

   public String getBusinessStatus(String regNum) {
      try {
         // 1. 통신 배달부 생성
         RestTemplate restTemplate = new RestTemplate();

         // 2. 헤더세팅(국세청서버에게 JSON을보낼꺼다)
         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_JSON);

         // 3. body세팅 몸통
         Map<String, List<String>> body = new HashMap<>();
         body.put("b_no", Arrays.asList(regNum));

         // 4. 송장과 상자를 하나로 묶음(HttpEntity)
         HttpEntity<Map<String, List<String>>> requestEntity = new HttpEntity<>(body, headers);

         // 5. 목적지(국세청 API) 주소 설정
         String ntsUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + serviceKey;

         // 6. 통신 배달부가 보내고 응답 받아옴(주소, POST방식, 택배물이든박스, 돌아올때받을타입)
         String jsonResponse = restTemplate.postForObject(ntsUrl, requestEntity, String.class);

         // 7. 문서를 번역할 번역가 생성 및 분석
         ObjectMapper objectMapper = new ObjectMapper();
         JsonNode rootNode = objectMapper.readTree(jsonResponse);// 가져온 문서(json)를 parse해서 분석

         // 8. 영업상태 값 추출
         String status = rootNode.path("data").get(0).path("b_stt").asText();
         System.out.println("API 응답 상태: " + status);

         return status;

      } catch (Exception e) {
         System.out.println("통신 에러 발생: " + e.getMessage());
         return "조회 중 에러 발생";
      }
   }
}
