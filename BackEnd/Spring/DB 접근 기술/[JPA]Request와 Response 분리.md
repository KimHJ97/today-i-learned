# Request와 Response 분리

```java
    // Create
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Product product = request.toEntity();
        Product savedProduct = productRepository.save(product);

        return ProductResponse.of(savedProduct);
    }

    // Read
    @Transactional(readOnly = true)
    public List<ProductResponse> findProducts() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(ProductResponse::of)
                .collect(Collectors.toList());
    }

    // Read
    @Transactional(readOnly = true)
    public ProductResponse findProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        return ProductResponse.of(product);
    }

    // Update
    @Transactional
    public ProductUpdateResponse updateProduct(long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        product.update(request);

        return ProductUpdateResponse.of(product);
    }

    // Delete
    public void deleteProduct(long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        productRepository.delete(product);
    }
```
