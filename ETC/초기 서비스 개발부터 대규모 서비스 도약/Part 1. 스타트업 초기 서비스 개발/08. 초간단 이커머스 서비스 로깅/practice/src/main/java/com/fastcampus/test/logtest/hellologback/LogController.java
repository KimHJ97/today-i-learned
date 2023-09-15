package com.fastcampus.test.logtest.hellologback;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LogController {

    Logger log = LoggerFactory.getLogger(LogController.class);

    @GetMapping(value = "/hello")
    public String hello() {

        log.trace(">>> Trace Log Test");
        log.debug(">>> Debug Log Test");
        log.info(">>> Info Log Test");
        log.warn(">>> Warn Log Test");
        log.error(">>> Error Log Test");

        return "hello";
    }
}
