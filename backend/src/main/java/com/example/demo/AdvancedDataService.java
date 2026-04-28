package com.example.demo;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AdvancedDataService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 홈페이지 URL에서 대표 이메일을 추출합니다.
     * 1) mailto: 링크 우선
     * 2) 본문 텍스트에서 이메일 패턴 정규식 매칭
     */
    public String getEmailFromHomepage(String url) {
        if (url == null || url.isEmpty() || url.equals("-")) return "-";
        
        try {
            if (!url.startsWith("http")) {
                url = "http://" + url;
            }

            Document doc = Jsoup.connect(url)
                                .timeout(3000)
                                .followRedirects(true)
                                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                                .get();

            // 1) mailto: 링크에서 추출
            String mailto = doc.select("a[href^=mailto:]").attr("href");
            if (!mailto.isEmpty()) {
                return mailto.replace("mailto:", "").split("\\?")[0].trim();
            }

            // 2) 본문에서 이메일 패턴 정규식 매칭
            String bodyText = doc.body().text();
            Pattern emailPattern = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+");
            Matcher matcher = emailPattern.matcher(bodyText);
            if (matcher.find()) {
                return matcher.group();
            }
        } catch (Exception e) {
            System.out.println("[AdvancedData] 이메일 크롤링 실패 (" + url + "): " + e.getMessage());
        }
        return "-";
    }

    /**
     * 카카오 로컬 API를 이용한 전화번호 기반 업체명 역조회
     */
    public String findCompanyNameByPhone(String phone) {
        if (phone == null || phone.isEmpty()) return null;

        try {
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + phone;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode documents = objectMapper.readTree(response.getBody()).path("documents");
            if (documents.isArray() && documents.size() > 0) {
                return documents.get(0).path("place_name").asText();
            }
        } catch (Exception e) {
            System.out.println("[Kakao] 전화번호 역조회 실패: " + e.getMessage());
        }
        return null;
    }

    /**
     * 카카오 로컬 API를 이용한 키워드 검색 (DART 미등록 기업 보완용)
     */
    public JsonNode getKakaoPlaceInfo(String keyword) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + keyword;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return objectMapper.readTree(response.getBody()).path("documents");
        } catch (Exception e) {
            System.out.println("[Kakao] 키워드 검색 실패: " + e.getMessage());
            return null;
        }
    }

    /**
     * 네이버/카카오 맵 검색 링크 생성 (딥링크 — API 키 불필요)
     */
    public String getMapLink(String companyName, String type) {
        if (companyName == null || companyName.isEmpty()) return null;
        if ("naver".equals(type)) {
            return "https://map.naver.com/v5/search/" + companyName;
        }
        return "https://map.kakao.com/?q=" + companyName;
    }
}
