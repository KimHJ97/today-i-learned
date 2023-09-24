package com.fastcampus.hellospringbatch.config.simple;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class HiBatchJobConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private static final String JOB_NAME = "hiJob";
    private static final String STEP_1_NAME = "hiStep";
    private static final String MESSAGE = "Hi, Spring Batch !!!";

    @Bean
    public Job hiJob() {
        return this.jobBuilderFactory.get(JOB_NAME).start(hiStep()).build();
    }

    @Bean
    public Step hiStep() {
        return this.stepBuilderFactory.get(STEP_1_NAME).tasklet((contribution, chunkContext) -> {
            log.info("This is HiStep, {}", MESSAGE);
            return RepeatStatus.FINISHED;
        }).build();
    }
}
