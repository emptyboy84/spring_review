package com.example.demo;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/company")
public class CompanyController {

   @Autowired
   private CompanyService companyService;

   // 사업자등록번호로 통합 조회 (국세청 + DART)
   @GetMapping("/api/status")
   public Map<String, Object> checkStatus(@RequestParam String regNum) {
      return companyService.getBusinessStatus(regNum);
   }

   // 회사명으로 검색 (자동완성/검색 기능)
   @GetMapping("/api/search")
   public List<Map<String, String>> searchByName(@RequestParam String keyword) {
      return companyService.searchByName(keyword);
   }
}