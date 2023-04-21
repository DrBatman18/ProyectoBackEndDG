const express = require('express');
const app = express();

const productsRouter = require('./src/api/products/products');
const cartsRouter = require('./src/api/carts/carts');

const PORT = 8080;

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
