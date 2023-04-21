const express = require("express");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

const productsFilePath = "./api/data/productos.json";
const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath));
const saveProducts = (products) => fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
  },
});

const upload = multer({ storage });

router.get("/", (req, res) => {
  const products = getProducts();
  res.json(products);
});

router.get("/:id", (req, res) => {
  const productId = req.params.id;
  const product = getProducts().find((p) => p.id == productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: `Product with ID ${productId} not found` });
  }
});

router.post("/", upload.single("image"), (req, res) => {
  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    res.status(400).json({ error: "The fields 'name', 'price', and 'description' are required" });
  } else {
    const products = getProducts();
    const lastProductId = products.length > 0 ? products[products.length - 1].id : 0;
    const newProduct = {
      id: lastProductId + 1,
      name,
      price,
      description,
      image: req.file ? req.file.filename : null,
    };
    products.push(newProduct);
    saveProducts(products);
    res.json(newProduct);
  }
});

router.put("/:id", upload.single("image"), (req, res) => {
  const productId = req.params.id;
  const { name, price, description } = req.body;
  if (!name || !price || !description) {
    res.status(400).json({ error: "The fields 'name', 'price', and 'description' are required" });
  } else {
    const products = getProducts();
    const productIndex = products.findIndex((p) => p.id == productId);
    if (productIndex === -1) {
      res.status(404).json({ error: `Product with ID ${productId} not found` });
    } else {
      const updatedProduct = {
        ...products[productIndex],
        name,
        price,
        description,
        image: req.file ? req.file.filename : products[productIndex].image,
      };
      products[productIndex] = updatedProduct;
      saveProducts(products);
      res.json(updatedProduct);
    }
  }
});

router.delete("/:id", (req, res) => {
  const productId = req.params.id;
  const products = getProducts();
  const productIndex = products.findIndex((p) => p.id == productId);
  if (productIndex === -1) {
    res.status(404).json({ error: `Product with ID ${productId} not found` });
  } else {
    products.splice(productIndex, 1);
    saveProducts(products);
    res.sendStatus(204);
  }
});

module.exports = router;

