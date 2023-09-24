package com.fastcampus.hellospringbatch.config.jdbc;

import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

@Slf4j
public class CustomerItemProcessor implements ItemProcessor<Customer, Customer> {

    public static final int ADD_NEW_AGE = 10;

    @Override
    public Customer process(Customer customer) throws Exception {
        int newAge = customer.getAge() + ADD_NEW_AGE;
        final Customer transformedCustomer = new Customer(customer.getId(), customer.getName(), newAge);

        log.info("Change customer.age(" + customer.getAge() + ") to " + newAge);
        return transformedCustomer;
    }
}
