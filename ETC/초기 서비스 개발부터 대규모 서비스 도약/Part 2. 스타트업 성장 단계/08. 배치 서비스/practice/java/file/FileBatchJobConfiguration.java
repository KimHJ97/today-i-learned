package com.fastcampus.hellospringbatch.config.file;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.FlatFileItemWriter;
import org.springframework.batch.item.file.mapping.DefaultLineMapper;
import org.springframework.batch.item.file.transform.BeanWrapperFieldExtractor;
import org.springframework.batch.item.file.transform.DelimitedLineAggregator;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.math.BigDecimal;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class FileBatchJobConfiguration {
    public static final int CHUNK_SIZE = 2;
    public static final int ADD_PRICE = 1000;
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private static final String JOB_NAME = "fileJob";
    private static final String STEP_NAME = "fileStep";

    private Resource inputFileResource = new FileSystemResource("input/sample-product.csv");
    private Resource outputFileResource = new FileSystemResource("output/output-product.csv");

    @Bean
    public Job fileJob() {
        return this.jobBuilderFactory.get(JOB_NAME)
                .incrementer(new RunIdIncrementer())
                .start(fileStep())
                .build();
    }

    @Bean
    public Step fileStep() {
        return this.stepBuilderFactory.get(STEP_NAME)
                .<Product, Product>chunk(CHUNK_SIZE)
                .reader(fileItemReader())
                .processor(fileItemProcessor())
                .writer(fileItemWriter())
                .build();
    }

    @Bean
    public FlatFileItemReader fileItemReader() {
        // 아이템 리더 생성
        FlatFileItemReader<Product> productItemReader = new FlatFileItemReader<>();
        productItemReader.setResource(this.inputFileResource);

        // 파일의 라인을 어떻게 가져올 것인가? (기본은 콤마)
        DefaultLineMapper<Product> lineMapper = new DefaultLineMapper<>();
        lineMapper.setLineTokenizer(new DelimitedLineTokenizer());
        lineMapper.setFieldSetMapper(new ProductFieldSetMapper());

        productItemReader.setLineMapper(lineMapper);
        return productItemReader;
    }

    @Bean
    public ItemProcessor<Product, Product> fileItemProcessor() {
        // In: Product --> Out: Product
        return product -> {
            BigDecimal updatedPrice = product.getPrice().add(new BigDecimal(ADD_PRICE));
            log.info("[ItemProcessor] Updated product price - {}", updatedPrice);
            product.setPrice(updatedPrice);
            return product;
        };
    }

    @Bean
    public FlatFileItemWriter<Product> fileItemWriter() {
        FlatFileItemWriter flatFileItemWriter = new FlatFileItemWriter();
        flatFileItemWriter.setResource(outputFileResource);
        flatFileItemWriter.setAppendAllowed(true);

        DelimitedLineAggregator<Product> lineAggregator = new DelimitedLineAggregator<>();
        lineAggregator.setFieldExtractor(new BeanWrapperFieldExtractor<>() {
            {
                setNames(new String[]{"id", "name", "price"});
            }
        });
        flatFileItemWriter.setLineAggregator(lineAggregator);

        return flatFileItemWriter;
    }
}
