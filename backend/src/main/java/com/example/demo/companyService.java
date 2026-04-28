package com.example.demo;

import java.util.ArrayList;
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

   @Autowired
   private AdvancedDataService advancedDataService;

   @Value("${nts.api.key}")
   private String serviceKey;

   /**
    * 사업자번호 기반 통합 조회:
    * 1. 국세청 API (영업상태)
    * 2. DART API (재무/고용/기업정보)
    * 3. Advanced Data (이메일 크롤링, 맵 링크)
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
            result.put("status", dataNode.path("b_stt_cd").asText(""));
            result.put("tax_type", dataNode.path("tax_type").asText(""));
         }
      } catch (Exception e) {
         System.out.println("[NTS] 에러: " + e.getMessage());
      }

      // ── 2. DART 통합 조회 ──
      try {
         Map<String, Object> dartData = dartService.getFullCompanyData(regNum);
         if (!dartData.isEmpty()) {
            result.putAll(dartData);
            
            // ── 3. 고급 데이터 보완 (크롤링 및 맵) ──
            String homepage = (String) result.get("email"); // DartService에서 hm_url을 email 키로 저장함
            if (homepage != null && !homepage.equals("-")) {
                String realEmail = advancedDataService.getEmailFromHomepage(homepage);
                result.put("representativeEmail", realEmail);
            } else {
                result.put("representativeEmail", "-");
            }

            String companyName = (String) result.get("company");
            result.put("naverMapLink", advancedDataService.getMapLink(companyName, "naver"));
            result.put("kakaoMapLink", advancedDataService.getMapLink(companyName, "kakao"));
         }
      } catch (Exception e) {
         System.out.println("[DART/Advanced] 에러: " + e.getMessage());
      }

      return result;
   }

   /**
    * corp_code를 사용한 상세 조회 (검색 리스트에서 기업을 선택했을 때)
    */
   public Map<String, Object> getDetailByCorpCode(String corpCode) {
      Map<String, Object> result = new HashMap<>();

      try {
         // DART 기업개황에서 사업자번호 추출
         Map<String, Object> companyInfo = dartService.getCompanyInfo(corpCode);
         if (companyInfo.isEmpty()) {
            return result;
         }

         String bizrNo = (String) companyInfo.get("bizr_no");
         if (bizrNo != null && !bizrNo.isEmpty()) {
            // 사업자번호가 있으면 국세청 + DART 통합 조회
            return getBusinessStatus(bizrNo);
         } else {
            // 사업자번호 없는 경우 DART 데이터만 반환
            result.putAll(companyInfo);

            // 5개년 재무/고용 데이터
            List<Map<String, Object>> revenue = dartService.getRevenueHistory(corpCode);
            List<Map<String, Object>> employee = dartService.getEmployeeHistory(corpCode);
            result.put("history", mergeHistory(revenue, employee));

            // 이메일 크롤링 & 맵 링크
            String homepage = (String) result.get("email");
            if (homepage != null && !homepage.equals("-")) {
                result.put("representativeEmail", advancedDataService.getEmailFromHomepage(homepage));
            }
            String companyName = (String) result.get("company");
            result.put("naverMapLink", advancedDataService.getMapLink(companyName, "naver"));
            result.put("kakaoMapLink", advancedDataService.getMapLink(companyName, "kakao"));
            result.put("regNum", bizrNo != null ? bizrNo : "-");
         }
      } catch (Exception e) {
         System.out.println("[Detail] 에러: " + e.getMessage());
      }
      return result;
   }

   /**
    * 통합 검색 엔진 (명칭, 사업자번호, 전화번호 자동 판별)
    */
   public Map<String, Object> unifiedSearch(String keyword) {
      Map<String, Object> finalResult = new HashMap<>();
      String cleanKeyword = keyword.replaceAll("[^0-9a-zA-Z가-힣]", "");

      // 1. 사업자번호 패턴 (10자리 숫자)
      if (cleanKeyword.matches("\\d{10}")) {
          return getBusinessStatus(cleanKeyword);
      }

      // 2. 전화번호 패턴 (지역번호 포함 9~11자리)
      if (cleanKeyword.matches("\\d{9,11}")) {
          // 카카오 API로 전화번호 역조회 시도
          String matchedName = advancedDataService.findCompanyNameByPhone(keyword);
          if (matchedName != null) {
              List<Map<String, String>> searchList = dartService.searchByName(matchedName);
              if (!searchList.isEmpty()) {
                  String corpCode = searchList.get(0).get("corpCode");
                  return getDetailByCorpCode(corpCode);
              }
          }
          // 카카오 실패 시 DART 전체 매핑에서 전화번호로 검색 시도
          // (향후 DB 구축 시 확장)
          finalResult.put("type", "error");
          finalResult.put("message", "해당 번호의 기업을 찾을 수 없습니다. 회사명이나 사업자번호로 검색해 주세요.");
          return finalResult;
      }

      // 3. 회사명 검색
      List<Map<String, String>> searchResults = dartService.searchByName(keyword);
      
      if (searchResults.isEmpty()) {
          finalResult.put("type", "error");
          finalResult.put("message", "'" + keyword + "'에 해당하는 기업을 찾을 수 없습니다.");
          return finalResult;
      }

      // 검색 결과가 1건이면 바로 상세 조회
      if (searchResults.size() == 1) {
          return getDetailByCorpCode(searchResults.get(0).get("corpCode"));
      }

      finalResult.put("searchResults", searchResults);
      finalResult.put("type", "list");
      return finalResult;
   }

   // 매출/직원 히스토리 병합 유틸리티
   private List<Map<String, Object>> mergeHistory(
       List<Map<String, Object>> revenueHistory,
       List<Map<String, Object>> employeeHistory) {
      Map<String, Map<String, Object>> yearMap = new HashMap<>();
      for (Map<String, Object> r : revenueHistory) {
         String yr = (String) r.get("year");
         yearMap.computeIfAbsent(yr, k -> new HashMap<>()).put("year", yr);
         yearMap.get(yr).put("revenue", r.get("revenue"));
      }
      for (Map<String, Object> e : employeeHistory) {
         String yr = (String) e.get("year");
         yearMap.computeIfAbsent(yr, k -> new HashMap<>()).put("year", yr);
         yearMap.get(yr).put("employeeCount", e.get("employeeCount"));
      }
      List<Map<String, Object>> merged = new ArrayList<>(yearMap.values());
      merged.sort((a, b) -> ((String) a.get("year")).compareTo((String) b.get("year")));
      return merged;
   }
}
