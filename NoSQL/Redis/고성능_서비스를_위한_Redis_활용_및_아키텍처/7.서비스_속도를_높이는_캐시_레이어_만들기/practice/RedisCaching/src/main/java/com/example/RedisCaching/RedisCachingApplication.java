package com.example.RedisCaching;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class RedisCachingApplication {

	public static void main(String[] args) {
		SpringApplication.run(RedisCachingApplication.class, args);
	}

}
