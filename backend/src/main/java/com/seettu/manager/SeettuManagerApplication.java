package com.seettu.manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SeettuManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeettuManagerApplication.class, args);
    }
}
