/*컨트롤러는 식당의 '홀 웨이터' 또는 회사의 **'안내데스크 직원'**이라고 생각하시면 됩니다. 💁‍♂️

실무에서 컨트롤러는 딱 다음 3가지 역할만 수행할 때 사용합니다.

1. 주문(요청) 받기 🛎️
사용자(프론트엔드, 브라우저, 스마트폰 앱 등)가 "이 주소로 들어갈 테니, 사업자번호 1234번 정보 좀 줘!" 
하고 요청(HTTP Request)을 보내면, 서버의 맨 앞단에 서 있다가 가장 먼저 그 요청을 낚아챕니다.

2. 주방장(Service)에게 일 떠넘기기 🧑‍🍳
이것이 가장 핵심입니다! 좋은 웨이터는 자기가 직접 요리를 하지 않죠?
마찬가지로 좋은 컨트롤러는 데이터를 섞거나, 다른 서버(국세청)와 통신하거나, DB를 뒤지는 복잡한 일을 직접 하지 않습니다.
대신, 사용자가 준 데이터(사업자번호)를 아까 우리가 만든 **CompanyService(실무자/요리사)**에게 툭 던져주면서 "이거 조회해서 결과 가져와!" 하고 일을 시킵니다.

3. 결과물 서빙(응답)하기 🍽️
CompanyService가 열심히 일해서 "계속사업자"라는 결과를 가져오면, 
컨트롤러는 그걸 클라이언트가 이해하기 쉬운 예쁜 접시(JSON 포맷, ResponseEntity 등)
에 담아서 다시 화면으로 돌려보내 줍니다(HTTP Response).*/

package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000") // Next.js(3000번 포트)에서 오는 요청을 허락해줍니다!
@RestController // 나는 프론트엔드의 요청을 받는 안내데스크야라고 스프링프레임워크에게 알려준다
@RequestMapping("/company") // /company로 시작하는 모든 요청은 내가 담당하겠다!
public class CompanyController {

   @Autowired // 주입해주세요! (외부 API데이터를 가져오는 일을 잘 아는 직원(companyService)을 데려와서 내

   // 곁에 둡니다.)

   private CompanyService companyService;

   // "누군가 /api/status 주소로 조회를 요청하면 이 메서드가 응대해라!"
   @GetMapping("/api/status") // //http://localhost:8080/company/api/status

   String checkStatus(@RequestParam String regNum) {// 사용자가 보낸 값중 regNum이라는 값을 가져와서 지역변수 regNum에 담습니다.

      // 주방장(Service)에게 프론트엔드가 준 사업자번호를 넘기고 결과를 받음
      return companyService.getBusinessStatus(regNum);

   };

}