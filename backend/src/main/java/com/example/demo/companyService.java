package com.example.demo;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CompanyService {

   @Autowired
   private DartService dartService;

   @Value("${nts.api.key}")
   private String serviceKey;

   /**
    * 사업자등록번호로 통합 조회:
    * 1) 국세청 API → 영업상태, 과세유형
    * 2) DART API → 회사명, 설립일, 대표자, 전화, 팩스, 매출(5년), 직원수(5년)
    */
   public Map<String, Object> getBusinessStatus(String regNum) {
      Map<String, Object> result = new HashMap<>();
      result.put("regNum", regNum);

      // ── 1. 국세청 상태조회 ──
      try {
         RestTemplate restTemplate = new RestTemplate();
         HttpHeaders headers = new HttpHeaders();
         headers.setContentType(MediaType.APPLICATION_JSON);

         Map<String, List<String>> body = new HashMap<>();
         body.put("b_no", Arrays.asList(regNum));

         HttpEntity<Map<String, List<String>>> requestEntity = new HttpEntity<>(body, headers);
         String ntsUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + serviceKey;

         String jsonResponse = restTemplate.postForObject(ntsUrl, requestEntity, String.class);
         ObjectMapper objectMapper = new ObjectMapper();
         JsonNode rootNode = objectMapper.readTree(jsonResponse);
         JsonNode dataArray = rootNode.path("data");

         if (dataArray.isArray() && dataArray.size() > 0) {
            JsonNode dataNode = dataArray.get(0);
            result.put("b_stt_cd", dataNode.path("b_stt_cd").asText(""));
            result.put("status", dataNode.path("b_stt_cd").asText(""));
            result.put("tax_type", dataNode.path("tax_type").asText(""));
         } else {
            result.put("status", "error");
            result.put("company", "조회 실패 (잘못된 사업자번호)");
            return result;
         }
      } catch (Exception e) {
         System.out.println("[NTS] 국세청 API 에러: " + e.getMessage());
         result.put("status", "error");
         result.put("company", "국세청 API 통신 에러");
         return result;
      }

      // ── 2. DART 통합 조회 ──
      try {
         Map<String, Object> dartData = dartService.getFullCompanyData(regNum);
         if (!dartData.isEmpty()) {
            result.putAll(dartData);
         } else {
            // DART 매핑이 없는 경우 최소한의 정보만 세팅
            if (!result.containsKey("company")) {
               result.put("company", "(비상장/미등록 기업)");
            }
         }
      } catch (Exception e) {
         System.out.println("[DART] DART API 에러: " + e.getMessage());
         if (!result.containsKey("company")) {
            result.put("company", "(DART 조회 불가)");
         }
      }

      return result;
   }

   /**
    * 회사명으로 검색 (DART 고유번호 DB 활용)
    */
   public List<Map<String, String>> searchByName(String keyword) {
      return dartService.searchByName(keyword);
   }
}
