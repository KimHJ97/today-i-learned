# MongoDB 사용하기

## Mongo

 - `사전 작업`
    - 로컬 설치: https://www.mongodb.com/try/download/community
    - 클라우드 서비스 이용: https://www.mongodb.com/atlas
```
1. 몽고 DB 사이트 접속
 - New Project > Build a Database > Shared(무료)

2. 필수 라이브러리 설치
$ npm install mongoose
```

<br/>

 - `MongoDB 연결하기`
    - Node 환경에서 몽고 DB를 사용하기 위해서는 몽구스(mongoose) 라이브러리를 이용할 수 있다.
    - 몽구스를 사용하기 위해서는 스키마 생성, 스키마를 이용하여 모델 생성, 모델을 이용하여 CRUD 작업을 할 수 있다.
```javascript
const { default: mongoose } = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected..');
    })
    .catch((err) => {
        console.log(err);
    });
```

<br/>

 - `스키마 생성 & 모델 생성`
    - Mongoose 스키마는 문서(Document)의 구조, 기본값, 유효성 검사기 등을 정의합니다.
    - Mongoose 모델은 레코드 생성, 쿼리, 업데이트, 삭제 등을 위한 데이터베이스 인터페이스를 제공합니다.
```javascript
const mongoose = require('mongoose');

// 스키마 정의
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number
    }
});

// 모델 생성
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
```

<br/>

 - `CRUD`
```javascript
const productModel = require('../models/products.model');

// Create Example
async function createProductExample(req, res, next) {
    try {
        productModel.create({
            name: 'apple watch',
            description: 'cool watch',
            price: 1000
        });

        const product = new productModel({
            name: 'apple watch',
            description: 'cool watch',
            price: 1000
        });
        product.save();
    } catch (error) {
        next(error);
    }
}

// Create(INSERT)
async function createProduct(req, res, next) {
    try {
        const createdProduct = await productModel.create(req.body);
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
}

// READ(SELECT)
async function getProducts(req, res, next) {
    try {
        const allProducts = await productModel.find({});
        res.status(200).json(allProducts);
    } catch (error) {
        next(error);
    }
}

// READ(SELECT)
async function getProductById(req, res, next) {
    try {
        const product = await productModel.findById(req.params.productId);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

// UPDATE(UPDATE)
async function updateProduct(req, res, next) {
    try {
        let updatedProduct = await productModel.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        )
        if (updatedProduct) {
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

// DELETE(DELETE)
async function deleteProduct(req, res, next) {
    try {
        let deletedProduct = await productModel.findByIdAndDelete(req.params.productId);
        if (deletedProduct) {
            res.status(200).json(deletedProduct);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        next(error);
    }
}

```
