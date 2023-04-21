const express = require("express");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();
const upload = multer({ dest: "public/images" });

const cartFilePath = "./api/data/carrito.json";
const productsFilePath = "./api/data/productos.json";

const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath));
const getCart = () => JSON.parse(fs.readFileSync(cartFilePath));
const saveCart = (cart) => fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2));

router.post("/", (req, res) => {
  const { id, products } = req.body;
  if (!id || !products) {
    res.status(400).json({ error: "The fields 'id' and 'products' are required" });
  } else {
    const cart = { id, products };
    saveCart(cart);
    res.json(cart);
  }
});

router.get("/:cid", (req, res) => {
  const cartId = req.params.cid;
  const cart = getCart().find((c) => c.id == cartId);
  if (cart) {
    const products = getProducts();
    const cartProducts = cart.products.map((cartProduct) => {
      const product = products.find((p) => p.id == cartProduct.id);
      return { ...product, quantity: cartProduct.quantity };
    });
    res.json(cartProducts);
  } else {
    res.status(404).json({ error: `Cart with ID ${cartId} not found` });
  }
});

router.post("/:cid/product/:pid", (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const cart = getCart().find((c) => c.id == cartId);
  if (!cart) {
    res.status(404).json({ error: `Cart with ID ${cartId} not found` });
  } else {
    const products = getProducts();
    const product = products.find((p) => p.id == productId);
    if (!product) {
      res.status(404).json({ error: `Product with ID ${productId} not found` });
    } else {
      const cartProductIndex = cart.products.findIndex((cp) => cp.id == productId);
      if (cartProductIndex === -1) {
        cart.products.push({ id: productId, quantity: 1 });
      } else {
        cart.products[cartProductIndex].quantity += 1;
      }
      saveCart(getCart());
      res.json(cart);
    }
  }
});

router.post("/:cid/image", upload.single("image"), (req, res) => {
  const cartId = req.params.cid;
  const cart = getCart().find((c) => c.id == cartId);
  if (!cart) {
    res.status(404).json({ error: `Cart with ID ${cartId} not found` });
  } else {
    const imagePath = req.file.path;
    cart.image = imagePath;
    saveCart(getCart());
    res.json(cart);
  }
});

module.exports = router;

