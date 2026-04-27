package com.example.demo;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

@Service
public class DartService {

    @Value("${dart.api.key}")
    private String dartApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 사업자등록번호(bizr_no) → DART 고유번호(corp_code) 매핑 캐시
    // corpCode.xml에는 bizr_no가 없으므로, 조회 시 company.json으로 역매핑합니다.
    // 자주 조회되는 기업은 캐시에 저장하여 재호출을 방지합니다.
    private final ConcurrentHashMap<String, String> bizrNoToCorpCode = new ConcurrentHashMap<>();
    // corp_name → corp_code 매핑 (회사명 검색용)
    private final ConcurrentHashMap<String, String> corpNameToCorpCode = new ConcurrentHashMap<>();
    // corp_code → corp_name 매핑
    private final ConcurrentHashMap<String, String> corpCodeToCorpName = new ConcurrentHashMap<>();

    /**
     * 서버 시작 시 DART 고유번호 목록(corpCode.xml)을 다운로드하여
     * 회사명 → corp_code 매핑을 구축합니다.
     */
    @PostConstruct
    public void initCorpCodeCache() {
        System.out.println("[DART] 고유번호 목록 다운로드 시작...");
        try {
            String url = "https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=" + dartApiKey;
            byte[] zipBytes = restTemplate.getForObject(url, byte[].class);

            if (zipBytes == null) {
                System.out.println("[DART] 고유번호 ZIP 다운로드 실패");
                return;
            }

            try (ZipInputStream zis = new ZipInputStream(new java.io.ByteArrayInputStream(zipBytes))) {
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.getName().endsWith(".xml")) {
                        // ZipInputStream을 직접 SAX/DOM 파서에 넘기면 stream이 닫힘
                        // → 바이트로 먼저 읽은 뒤 파싱
                        byte[] xmlBytes = zis.readAllBytes();
                        parseCorpCodeXml(new java.io.ByteArrayInputStream(xmlBytes));
                    }
                }
            }
            System.out.println("[DART] 고유번호 매핑 완료! 총 " + corpNameToCorpCode.size() + "개 기업 로드됨");
        } catch (Exception e) {
            System.out.println("[DART] 고유번호 초기화 실패: " + e.getMessage());
        }
    }

    private void parseCorpCodeXml(InputStream is) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(is);
        doc.getDocumentElement().normalize();

        NodeList listNodes = doc.getElementsByTagName("list");
        for (int i = 0; i < listNodes.getLength(); i++) {
            Element el = (Element) listNodes.item(i);
            String corpCode = getTagValue("corp_code", el);
            String corpName = getTagValue("corp_name", el);
            if (corpCode != null && corpName != null) {
                corpNameToCorpCode.put(corpName, corpCode);
                corpCodeToCorpName.put(corpCode, corpName);
            }
        }
    }

    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList.getLength() > 0 && nodeList.item(0).getTextContent() != null) {
            return nodeList.item(0).getTextContent().trim();
        }
        return null;
    }

    // ──────────────────────────────────────────────
    // 1. 사업자등록번호로 corp_code 찾기
    // ──────────────────────────────────────────────
    public String findCorpCodeByBizrNo(String bizrNo) {
        // 캐시에 있으면 바로 반환
        if (bizrNoToCorpCode.containsKey(bizrNo)) {
            return bizrNoToCorpCode.get(bizrNo);
        }

        // corpCode.xml에는 bizr_no가 없으므로, 알려진 주요 기업을 사전 매핑
        // 실제 서비스에서는 DB를 구축해야 하지만, 여기서는 company.json 역조회로 대응
        // 주요 기업 사전 매핑 (가장 빈번하게 조회되는 기업들)
        Map<String, String> knownMappings = Map.of(
            "1248100998", "00126380",  // 삼성전자
            "2208115988", "00164779",  // SK하이닉스
            "1138110545", "00164742",  // LG전자
            "1101110813", "00356361",  // 현대자동차
            "2148611485", "00155328",  // 네이버
            "1138111024", "00401731",  // 카카오
            "1148119388", "00164529"   // 기아
        );

        if (knownMappings.containsKey(bizrNo)) {
            String corpCode = knownMappings.get(bizrNo);
            bizrNoToCorpCode.put(bizrNo, corpCode);
            return corpCode;
        }

        // 사전 매핑에 없는 경우: 전체 목록에서 일일이 company.json을 호출하여 매칭
        // (API 호출 제한이 있으므로, 실제 서비스에서는 DB 구축 권장)
        System.out.println("[DART] 사전 매핑에 없는 사업자번호: " + bizrNo + " — 직접 검색은 미지원");
        return null;
    }

    // ──────────────────────────────────────────────
    // 2. 기업개황 조회 (회사명, 설립일, 전화, 팩스, 업종 등)
    // ──────────────────────────────────────────────
    public Map<String, Object> getCompanyInfo(String corpCode) {
        Map<String, Object> info = new HashMap<>();
        try {
            String url = "https://opendart.fss.or.kr/api/company.json?crtfc_key=" + dartApiKey
                       + "&corp_code=" + corpCode;
            String json = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(json);

            if ("000".equals(root.path("status").asText())) {
                info.put("company", root.path("corp_name").asText(""));
                info.put("ceo", root.path("ceo_nm").asText(""));
                info.put("addr", root.path("adres").asText(""));
                info.put("phoneNum", root.path("phn_no").asText(""));
                info.put("faxNum", root.path("fax_no").asText(""));
                info.put("email", root.path("hm_url").asText(""));
                info.put("foundationDate", formatDate(root.path("est_dt").asText("")));
                info.put("type", root.path("induty_code").asText(""));
                info.put("stockCode", root.path("stock_code").asText(""));

                // 기업구분 (Y: 유가증권, K: 코스닥, N: 코넥스, E: 기타)
                String corpCls = root.path("corp_cls").asText("");
                String corpType = switch (corpCls) {
                    case "Y" -> "유가증권시장 (대기업)";
                    case "K" -> "코스닥시장";
                    case "N" -> "코넥스시장";
                    default -> "기타 (비상장)";
                };
                info.put("corpType", corpType);

                // 캐시 업데이트
                String bizrNo = root.path("bizr_no").asText("");
                if (!bizrNo.isEmpty()) {
                    bizrNoToCorpCode.put(bizrNo, corpCode);
                }
            }
        } catch (Exception e) {
            System.out.println("[DART] 기업개황 조회 에러: " + e.getMessage());
        }
        return info;
    }

    // ──────────────────────────────────────────────
    // 3. 5개년 매출액 조회 (연결 재무제표 IFRS 기준)
    // ──────────────────────────────────────────────
    public List<Map<String, Object>> getRevenueHistory(String corpCode) {
        List<Map<String, Object>> history = new ArrayList<>();
        int currentYear = java.time.Year.now().getValue();

        // 최근 5개년 사업보고서(11011) 조회
        for (int year = currentYear - 1; year >= currentYear - 5; year--) {
            try {
                String url = "https://opendart.fss.or.kr/api/fnlttSinglAcnt.json"
                           + "?crtfc_key=" + dartApiKey
                           + "&corp_code=" + corpCode
                           + "&bsns_year=" + year
                           + "&reprt_code=11011";

                String json = restTemplate.getForObject(url, String.class);
                JsonNode root = objectMapper.readTree(json);

                if ("000".equals(root.path("status").asText())) {
                    JsonNode list = root.path("list");
                    long revenue = 0;

                    for (JsonNode item : list) {
                        // 연결재무제표(CFS)의 손익계산서(IS)에서 매출액 찾기
                        String fsDiv = item.path("fs_div").asText("");
                        String sjDiv = item.path("sj_div").asText("");
                        String accountNm = item.path("account_nm").asText("");

                        if ("CFS".equals(fsDiv) && "IS".equals(sjDiv)
                            && (accountNm.contains("매출") || accountNm.equals("수익(매출액)"))) {
                            String amountStr = item.path("thstrm_amount").asText("0")
                                                   .replaceAll("[^0-9\\-]", "");
                            if (!amountStr.isEmpty()) {
                                revenue = Long.parseLong(amountStr);
                                break;
                            }
                        }
                    }

                    if (revenue > 0) {
                        Map<String, Object> yearData = new HashMap<>();
                        yearData.put("year", String.valueOf(year));
                        yearData.put("revenue", revenue);
                        history.add(yearData);
                    }
                }
            } catch (Exception e) {
                System.out.println("[DART] " + year + "년 재무 조회 에러: " + e.getMessage());
            }
        }

        // 오래된 연도가 먼저 오도록 정렬
        history.sort((a, b) -> ((String) a.get("year")).compareTo((String) b.get("year")));
        return history;
    }

    // ──────────────────────────────────────────────
    // 4. 5개년 직원수 조회
    // ──────────────────────────────────────────────
    public List<Map<String, Object>> getEmployeeHistory(String corpCode) {
        List<Map<String, Object>> history = new ArrayList<>();
        int currentYear = java.time.Year.now().getValue();

        for (int year = currentYear - 1; year >= currentYear - 5; year--) {
            try {
                String url = "https://opendart.fss.or.kr/api/empSttus.json"
                           + "?crtfc_key=" + dartApiKey
                           + "&corp_code=" + corpCode
                           + "&bsns_year=" + year
                           + "&reprt_code=11011";

                String json = restTemplate.getForObject(url, String.class);
                JsonNode root = objectMapper.readTree(json);

                if ("000".equals(root.path("status").asText())) {
                    JsonNode list = root.path("list");
                    int totalEmployees = 0;

                    for (JsonNode item : list) {
                        // "합계" 행에서 전체 직원수(sm) 합산
                        String foBbm = item.path("fo_bbm").asText("");
                        if (foBbm.contains("합계") || foBbm.contains("소계")) {
                            String smStr = item.path("sm").asText("0").replaceAll("[^0-9]", "");
                            if (!smStr.isEmpty()) {
                                totalEmployees += Integer.parseInt(smStr);
                            }
                        }
                    }

                    if (totalEmployees > 0) {
                        Map<String, Object> yearData = new HashMap<>();
                        yearData.put("year", String.valueOf(year));
                        yearData.put("employeeCount", totalEmployees);
                        history.add(yearData);
                    }
                }
            } catch (Exception e) {
                System.out.println("[DART] " + year + "년 직원현황 조회 에러: " + e.getMessage());
            }
        }

        history.sort((a, b) -> ((String) a.get("year")).compareTo((String) b.get("year")));
        return history;
    }

    // ──────────────────────────────────────────────
    // 5. 통합 조회: 사업자번호로 모든 정보 한 번에 가져오기
    // ──────────────────────────────────────────────
    public Map<String, Object> getFullCompanyData(String bizrNo) {
        Map<String, Object> result = new HashMap<>();

        String corpCode = findCorpCodeByBizrNo(bizrNo);
        if (corpCode == null) {
            System.out.println("[DART] corp_code를 찾을 수 없음: " + bizrNo);
            return result;  // 빈 맵 반환 → NTS 데이터만 표시
        }

        System.out.println("[DART] corp_code 발견: " + corpCode + " (사업자번호: " + bizrNo + ")");

        // 기업개황
        Map<String, Object> companyInfo = getCompanyInfo(corpCode);
        result.putAll(companyInfo);

        // 5개년 매출
        List<Map<String, Object>> revenueHistory = getRevenueHistory(corpCode);

        // 5개년 직원수
        List<Map<String, Object>> employeeHistory = getEmployeeHistory(corpCode);

        // 매출 + 직원수 합치기 (같은 연도끼리)
        List<Map<String, Object>> mergedHistory = new ArrayList<>();
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

        for (Map<String, Object> v : yearMap.values()) {
            mergedHistory.add(v);
        }
        mergedHistory.sort((a, b) -> ((String) a.get("year")).compareTo((String) b.get("year")));

        result.put("history", mergedHistory);
        return result;
    }

    // 날짜 포맷: "19690113" → "1969-01-13"
    private String formatDate(String raw) {
        if (raw != null && raw.length() == 8) {
            return raw.substring(0, 4) + "-" + raw.substring(4, 6) + "-" + raw.substring(6, 8);
        }
        return raw;
    }

    // ──────────────────────────────────────────────
    // 회사명으로 corp_code 검색 (프론트엔드 검색 기능용)
    // ──────────────────────────────────────────────
    public List<Map<String, String>> searchByName(String keyword) {
        List<Map<String, String>> results = new ArrayList<>();
        int count = 0;
        for (Map.Entry<String, String> entry : corpNameToCorpCode.entrySet()) {
            if (entry.getKey().contains(keyword)) {
                Map<String, String> item = new HashMap<>();
                item.put("corpName", entry.getKey());
                item.put("corpCode", entry.getValue());
                results.add(item);
                count++;
                if (count >= 20) break;  // 최대 20개만
            }
        }
        return results;
    }
}
