# 선물하기 프로젝트 개발

## Flow 설계 및 검토

### 요구사항

 - 선물하기 주문은 일반 주문과 달리, 주문 과정에서 배송지 주소를 확정할 수 없다.
    - 선물하기 주문을 결제한 사람이 해당 주문을 지인에게 선물로 전달하고, 이 후 수령자가 본인의 배송지 주소를 입력해야 하는 배송이 시작되는 구조이기 때문이다.
 - 선물하기 결제 후 구매자와 수령자에게 카카오톡이나 LMS로 알림이 발송되어야 한다.
 - 수령자는 선물을 수락하거나 거절할 수 있다.
 - 선물하기 서비스 개발과 운영 시에는 기존 주문 서비스의 기능에는 영향이 없도록 하면서 최대한 빠르게 개발이 진행되어야 한다.

```
1. 선물하기 주문 정보
 - 구매자 정보
 - 수령자 정보
 - 결제 정보

2. 결제 처리 -> 완료

3. 선물 수락 -> 배송
```

## 코드 구현

### interface 계층

 - `GiftApiController`
   - 요청 Dto를 응용(Application) 계층으로 넘길 때 새로운 객체로 변환하여 넘긴다.
      - 변환시 MapStruct를 이용할 수 있다.
```java
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/gifts")
public class GiftApiController {
    private final GiftFacade giftFacade;
    private final GiftDtoMapper giftDtoMapper;

    @GetMapping("/{giftToken}")
    public CommonResponse retrieveOrder(@PathVariable String giftToken) {
        var giftInfo = giftFacade.getOrder(giftToken);
        return CommonResponse.success(giftInfo);
    }

    @PostMapping
    public CommonResponse registerOrder(@RequestBody @Valid GiftDto.RegisterReq request) {
        var command = giftDtoMapper.of(request);
        var giftInfo = giftFacade.registerOrder(command);
        return CommonResponse.success(new GiftDto.RegisterRes(giftInfo));
    }

    @PostMapping("/{giftToken}/payment-processing")
    public CommonResponse requestPaymentProcessing(@PathVariable String giftToken) {
        giftFacade.requestPaymentProcessing(giftToken);
        return CommonResponse.success("OK");
    }

    @PostMapping("/{giftToken}/accept-gift")
    public CommonResponse acceptGift(
            @PathVariable String giftToken,
            @RequestBody @Valid GiftDto.AcceptGiftReq request
    ) {
        var acceptCommand = giftDtoMapper.of(giftToken, request);
        giftFacade.acceptGift(acceptCommand);
        return CommonResponse.success("OK");
    }
}
```

 - `GiftSqsMessageListener`
   - 메시지를 수신하여 콜백
```java
@Slf4j
@Component
@RequiredArgsConstructor
public class GiftSqsMessageListener {
    private final GiftFacade giftFacade;

    @SqsListener(value = "order-payComplete-live.fifo", deletionPolicy = SqsMessageDeletionPolicy.ON_SUCCESS)
    public void readMessage(GiftPaymentCompleteMessage message) {
        var orderToken = message.getOrderToken();
        log.info("[GiftSqsMessageListener.readMessage] orderToken = {}", orderToken);
        giftFacade.completePayment(orderToken);
    }
}
```

### application 계층

 - `GiftFacade`
   - 여러 개의 Service 인터페이스를 이용하여 로직을 수행한다.
   - Service는 도메인 계층에서 제공되지만, 실제 구현체는 infrastructure 계층에서 제공된다.
```java
@Slf4j
@Service
@RequiredArgsConstructor
public class GiftFacade {
    private final GiftService giftService;

    public GiftInfo getOrder(String giftToken) {
        log.info("getOrder giftToken = {}", giftToken);
        return giftService.getGiftInfo(giftToken);
    }

    public GiftInfo registerOrder(GiftCommand.Register command) {
        var giftInfo = giftService.registerOrder(command);
        log.info("registerOrder orderToken = {}", giftInfo);
        return giftInfo;
    }

    public void requestPaymentProcessing(String giftToken) {
        giftService.requestPaymentProcessing(giftToken);
    }

    public void completePayment(String orderToken) {
        giftService.completePayment(orderToken);
    }

    public void acceptGift(GiftCommand.Accept request) {
        giftService.acceptGift(request);
    }
}
```

### domain 계층

 - `GiftService`
   - 도메인 계층에서 사용될 객체는 XxxInfo, XxxCommand 등을 이용한다.
```java
public interface GiftService {

    GiftInfo getGiftInfo(String giftToken);

    GiftInfo registerOrder(GiftCommand.Register request);

    void requestPaymentProcessing(String giftToken);

    void completePayment(String orderToken);

    void acceptGift(GiftCommand.Accept request);
}

public interface GiftReader {
    Gift getGiftBy(String giftToken);

    Gift getGiftByOrderToken(String orderToken);
}

public interface GiftStore {
    Gift store(Gift gift);
}

@Slf4j
@Service
@RequiredArgsConstructor
public class GiftServiceImpl implements GiftService {
    private final GiftReader giftReader;
    private final GiftStore giftStore;
    private final OrderApiCaller orderApiCaller;
    private final GiftToOrderMapper giftToOrderMapper;

    /**
     * 선물 주문 정보를 가져온다
     * 선물 수령자의 수락 페이지 로딩 시에 사용된다
     *
     * @param giftToken
     * @return
     */
    @Override
    public GiftInfo getGiftInfo(String giftToken) {
        var gift = giftReader.getGiftBy(giftToken);
        return new GiftInfo(gift);
    }

    /**
     * 선물하기 주문을 등록한다
     * 해당 주문을 주문 서비스에 등록하기 위해 API 를 호출하고
     * 등록된 주문의 식별키와 선물 관련 정보를 반영하여 Gift 도메인을 저장한다
     *
     * @param request
     * @return
     */
    @Override
    @Transactional
    public GiftInfo registerOrder(GiftCommand.Register request) {
        var orderCommand = giftToOrderMapper.of(request);
        var orderToken = orderApiCaller.registerGiftOrder(orderCommand);
        var initGift = request.toEntity(orderToken);
        var gift = giftStore.store(initGift);
        return new GiftInfo(gift);
    }

    /**
     * 선물하기 주문의 상태를 [결제중] 으로 변경한다
     *
     * @param giftToken
     */
    @Override
    @Transactional
    public void requestPaymentProcessing(String giftToken) {
        var gift = giftReader.getGiftBy(giftToken);
        gift.inPayment();
    }

    /**
     * 주문 서비스에서 결제 완료 후 orderToken 을 메시징으로 발행하면
     * 선물하기 서비스에서 이를 읽어서 선물 주문의 결제를 완료 상태로 변경한다
     *
     * @param orderToken
     */
    @Override
    @Transactional
    public void completePayment(String orderToken) {
        var gift = giftReader.getGiftByOrderToken(orderToken);
        gift.completePayment();
    }

    /**
     * 선물 수령자가 배송지를 입력하고 [선물 수락] 하면
     * 선물 상태를 Accept 로 변경하고, 주문 서비스 API 를 호출하여 주문의 배송지 주소를 업데이트 한다
     *
     * @param request
     */
    @Override
    @Transactional
    public void acceptGift(GiftCommand.Accept request) {
        var giftToken = request.getGiftToken();
        var gift = giftReader.getGiftBy(giftToken);
        gift.accept(request);

        orderApiCaller.updateReceiverInfo(gift.getOrderToken(), request);
    }
}
```

 - `Order 관련`
```java
public interface OrderApiCaller {
    String registerGiftOrder(OrderApiCommand.Register request);

    void updateReceiverInfo(String orderToken, GiftCommand.Accept request);
}
```

### infrastructure

 - `Gist 관련 구현체`
```java
public interface GiftRepository extends JpaRepository<Gift, Long> {
    Optional<Gift> findByGiftToken(String giftToken);
    Optional<Gift> findByOrderToken(String orderToken);
}

@Slf4j
@Component
@RequiredArgsConstructor
public class GiftReaderImpl implements GiftReader {
    private final GiftRepository giftRepository;

    @Override
    public Gift getGiftBy(String giftToken) {
        if (StringUtils.isEmpty(giftToken)) throw new InvalidParamException();
        return giftRepository.findByGiftToken(giftToken).orElseThrow(EntityNotFoundException::new);
    }

    @Override
    public Gift getGiftByOrderToken(String orderToken) {
        if (StringUtils.isEmpty(orderToken)) throw new InvalidParamException();
        return giftRepository.findByOrderToken(orderToken).orElseThrow(EntityNotFoundException::new);
    }
}

@Slf4j
@Component
@RequiredArgsConstructor
public class GiftStoreImpl implements GiftStore {
    private final GiftRepository giftRepository;

    @Override
    public Gift store(Gift gift) {
        if (gift == null) throw new InvalidParamException();
        return giftRepository.save(gift);
    }
}
```

 - `order 관련 구현체`
```java
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderApiCallerImpl implements OrderApiCaller {
    private final RetrofitUtils retrofitUtils;
    private final RetrofitOrderApi retrofitOrderApi;

    @Override
    public String registerGiftOrder(OrderApiCommand.Register request) {
        var call = retrofitOrderApi.registerOrder(request);
        return retrofitUtils.responseSync(call)
                .map(CommonResponse::getData)
                .map(RetrofitOrderApiResponse.Register::getOrderToken)
                .orElseThrow(RuntimeException::new);
    }

    @Override
    public void updateReceiverInfo(String orderToken, GiftCommand.Accept request) {
        var call = retrofitOrderApi.updateReceiverInfo(orderToken, request);
        retrofitUtils.responseVoid(call);
    }
}

public interface {

    @POST("api/v1/gift-orders/init")
    Call<CommonResponse<RetrofitOrderApiResponse.Register>> registerOrder(@Body OrderApiCommand.Register request);

    @POST("api/v1/gift-orders/{orderToken}/update-receiver-info")
    Call<Void> updateReceiverInfo(@Path("orderToken") String orderToken, @Body GiftCommand.Accept request);
}
```

 - `Retrofit 관련`
```java
@Configuration
public class RetrofitServiceRegistry {

    @Value("${example.order.base-url}")
    private String baseUrl;

    @Bean
    public RetrofitOrderApi retrofitOrderApi() {
        var retrofit = RetrofitUtils.initRetrofit(baseUrl);
        return retrofit.create(RetrofitOrderApi.class);
    }
}

@Slf4j
@Component
public class RetrofitUtils {
    private static final HttpLoggingInterceptor loggingInterceptor
            = new HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY);

    private static final OkHttpClient.Builder httpClient = new OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(3, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS);

    private static final Gson gson = new GsonBuilder()
            .setLenient()
            .create();

    public static Retrofit initRetrofit(String baseUrl) {
        return new Retrofit.Builder()
                .baseUrl(baseUrl)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .client(httpClient.build())
                .build();
    }

    public <T extends CommonResponse> Optional<T> responseSync(Call<T> call) {
        try {
            Response<T> execute = call.execute();
            if (execute.isSuccessful()) {
                return Optional.ofNullable(execute.body());
            } else {
                log.error("requestSync errorBody = {}", execute.errorBody());
                throw new RuntimeException("retrofit execute response error");
            }
        } catch (IOException e) {
            log.error("", e);
            throw new RuntimeException("retrofit execute IOException");
        }
    }

    public void responseVoid(Call<Void> call) {
        try {
            if (!call.execute().isSuccessful()) throw new RuntimeException();
        } catch (IOException e) {
            throw new RuntimeException();
        }
    }
}
```

 - `AwsSqsListenerConfig`
```java
@Slf4j
@Component
public class AwsSqsListenerConfig {

    @Bean
    public SimpleMessageListenerContainerFactory simpleMessageListenerContainerFactory(AmazonSQSAsync amazonSQSAsync) {
        SimpleMessageListenerContainerFactory factory = new SimpleMessageListenerContainerFactory();
        factory.setAmazonSqs(amazonSQSAsync);
        factory.setAutoStartup(true);
        return factory;
    }

    @Bean
    public SimpleMessageListenerContainer simpleMessageListenerContainer(
            SimpleMessageListenerContainerFactory simpleMessageListenerContainerFactory,
            QueueMessageHandler queueMessageHandler,
            ThreadPoolTaskExecutor messageThreadPoolTaskExecutor
    ) {
        SimpleMessageListenerContainer container = simpleMessageListenerContainerFactory.createSimpleMessageListenerContainer();
        container.setMessageHandler(queueMessageHandler);
        container.setTaskExecutor(messageThreadPoolTaskExecutor);
        return container;
    }

    @Bean
    @ConditionalOnMissingBean(QueueMessageHandlerFactory.class)
    public QueueMessageHandlerFactory queueMessageHandlerFactory(AmazonSQSAsync amazonSQSAsync) {
        QueueMessageHandlerFactory factory = new QueueMessageHandlerFactory();
        factory.setAmazonSqs(amazonSQSAsync);

        MappingJackson2MessageConverter messageConverter = new MappingJackson2MessageConverter();
        messageConverter.setStrictContentTypeMatch(false);
        factory.setArgumentResolvers(Collections.singletonList(new PayloadMethodArgumentResolver(messageConverter)));
        return factory;
    }

    @Bean
    @ConditionalOnMissingBean(QueueMessageHandler.class)
    public QueueMessageHandler queueMessageHandler(QueueMessageHandlerFactory queueMessageHandlerFactory) {
        return queueMessageHandlerFactory.createQueueMessageHandler();
    }

    @Bean
    public ThreadPoolTaskExecutor messageThreadPoolTaskExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setThreadNamePrefix("sqs-");
        taskExecutor.setCorePoolSize(8);
        taskExecutor.setMaxPoolSize(100);
        taskExecutor.afterPropertiesSet();
        return taskExecutor;
    }
}
```

## 고려사항

 - 보상 트랜잭션
   - 결제 완료시 데이터 저장시 에러가 나는 경우 보상 트랜잭션 적용
```java
@Transactional
public void paymentOrder(OrderCommand.PaymentRequest paymentRequest) {
   var order = orderReader.getOrder(paymentRequest.getOrderToken());

   try {
      paymentProcessor.pay(order, paymentRequest);
      order.orderComplete();
   } catch (Exception e) {
      // 저장할 때 실패하는 경우 결제 취소 처리
      paymentProcessor.refund();
   }

}
```
