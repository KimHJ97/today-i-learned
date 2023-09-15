package com.fastcampus.test.logtest.hellologback;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class SimpleLogController {

    @GetMapping(value = "/simple-hello")
    public String simpleHello() {
        log.trace(">>> Trace Log Test");
        log.debug(">>> Debug Log Test");
        log.info(">>> Info Log Test");
        log.warn(">>> Warn Log Test");
        log.error(">>> Error Log Test");

        return "Hello Simple Log";
    }
}
