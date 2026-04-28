package com.example.demo;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/company")
public class CompanyController {

   @Autowired
   private CompanyService companyService;

   /**
    * 통합 검색 (명칭, 사업자번호, 전화번호 자동 판별)
    */
   @GetMapping("/api/unified")
   public Map<String, Object> unifiedSearch(@RequestParam String keyword) {
      return companyService.unifiedSearch(keyword);
   }

   /**
    * corp_code로 상세 조회 (검색 리스트에서 기업 선택 시)
    */
   @GetMapping("/api/detail")
   public Map<String, Object> getDetail(@RequestParam String corpCode) {
      return companyService.getDetailByCorpCode(corpCode);
   }

   /**
    * 사업자번호로 직접 조회 (하위 호환)
    */
   @GetMapping("/api/status")
   public Map<String, Object> checkStatus(@RequestParam String regNum) {
      return companyService.getBusinessStatus(regNum);
   }
}