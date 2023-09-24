package com.fastcampus.hellospringbatch.config.jdbc;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.annotation.AfterJob;
import org.springframework.batch.core.annotation.BeforeJob;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobCompletionNotificationListener {

    private final JdbcTemplate jdbcTemplate;

    @BeforeJob
    public void beforeJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.STARTED) {
            log.info("============================================");
            log.info("                JOB STARTED                 ");
            log.info("============================================");

            jdbcTemplate.query("SELECT id, name, age FROM customers",
                    (rs, row) -> new Customer(
                            rs.getLong(1),
                            rs.getString(2),
                            rs.getInt(3))
            ).forEach(customer -> log.info(">>> Found " + customer));
            log.info("============================================");
        }
    }

    @AfterJob
    public void afterJob(JobExecution jobExecution) {
        if(jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("============================================");
            log.info("                JOB FINISHED                ");
            log.info("============================================");

            jdbcTemplate.query("SELECT id, name, age FROM customers",
                    (rs, row) -> new Customer(
                            rs.getLong(1),
                            rs.getString(2),
                            rs.getInt(3))
            ).forEach(customer -> log.info(">>> Found " + customer));
            log.info("============================================");
        }
    }
}