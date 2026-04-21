package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * @SpringBootApplication: 이 어노테이션은 3가지 역할을 한꺼번에 합니다.
 * 1. @Configuration: 이 클래스가 설정 컨트롤 타워다!
 * 2. @EnableAutoConfiguration: 스프링이 알아서 필요한 설정을 다 해준다! (가장 중요)
 * 3. @ComponentScan: 이 패키지 안에 있는 @Controller, @Service 등을 다 찾아내서 등록해라!
 */
@SpringBootApplication//스프링 부트의 시작점(@SpringBootApplication이라는 마법의 주문이 걸려 있습니다.)
public class DemoApplication {
	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}
