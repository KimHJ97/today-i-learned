package com.fastcampus.alert.slack.helloslackalert;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URISyntaxException;

@RestController
public class HelloRestTemplateController {

    @Value("${notification.slack.webhook.url}")
    private String slackAlertWebhookUrl;

    @GetMapping(value = "/hello")
    public String hello() {
        return "Hello Slack Alert " + slackAlertWebhookUrl;
    }

    @GetMapping(value = "/hello-error")
    public String helloError() throws URISyntaxException {
        RestTemplate restTemplate = new RestTemplate();
        URI uri = new URI(slackAlertWebhookUrl);

        String errorMessage = "주문에서 에러 메세지 발생!!!";
        SlackErrorMessage slackErrorMessage = new SlackErrorMessage(errorMessage);
        ResponseEntity<String> result = restTemplate.postForEntity(uri, slackErrorMessage, String.class);

        return "Hello Slack Alert Sent = " + result.getStatusCodeValue();
    }
}
