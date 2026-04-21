package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/*
 * @RestController: 
 * "나는 데이터를 직접 주는 컨트롤러야!"
 * 원래 스프링은 HTML 파일을 찾아서 보여주려 하지만, 
 * 이 어노테이션을 붙이면 리턴하는 글자(String)나 객체(JSON)를 웹 브라우저에 바로 뿌려줍니다.
 */
@RestController
public class HelloController {

    /*
     * @GetMapping("/hello"):
     * 브라우저에서 'localhost:8080/hello' 로 들어오면 이 함수를 실행해라! 라는 뜻입니다.
     */
    @GetMapping("/hello")
    public String sayHello() {
        return "안녕하세요! 스프링의 세계에 오신 것을 환영합니다. 🔥";
    }

    /*
     * @RequestParam:
     * 주소창 뒤에 값(?name=길동)을 붙여서 보낼 때 그 값을 가로채는 문법입니다.
     * localhost:8080/greet?name=Mike 라고 치면 "Mike님, 반갑습니다!" 라고 나오게 됩니다.
     */
    @GetMapping("/greet")
    public String greetUser(@RequestParam(value = "name", defaultValue = "손님") String name) {
        return name + "님, 스프링 공부 화이팅입니다! 🚀";
    }
}
