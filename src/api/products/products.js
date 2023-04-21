const express = require("express");
const fs = require("fs");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "public/images/" }); // Directorio donde se guardarán las imágenes

const productsFilePath = "./api/data/productos.json";
const getProducts = () => JSON.parse(fs.readFileSync(productsFilePath));
const saveProducts = (products) => fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

// Obtener todos los productos
router.get("/", (req, res) => {
  const products = getProducts();
  res.json(products);
});

// Obtener un producto por ID
router.get("/:id", (req, res) => {
  const productId = req.params.id;
  const products = getProducts();
  const product = products.find((p) => p.id == productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: `Product with ID ${productId} not found` });
  }
});

// Agregar un producto
router.post("/", upload.single("image"), (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    res.status(400).json({ error: "The fields 'name' and 'price' are required" });
  } else {
    const products = getProducts();
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      image: req.file ? req.file.filename : null, // Agregar la ruta de la imagen al producto
    };
    products.push(newProduct);
    saveProducts(products);
    res.json(newProduct);
  }
});

// Actualizar un producto por ID
router.put("/:id", (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;
  if (!name || !price) {
    res.status(400).json({ error: "The fields 'name' and 'price' are required" });
  } else {
    const products = getProducts();
    const productIndex = products.findIndex((p) => p.id == productId);
    if (productIndex === -1) {
      res.status(404).json({ error: `Product with ID ${productId} not found` });
    } else {
      const updatedProduct = { ...products[productIndex], name, price: parseFloat(price) };
      products[productIndex] = updatedProduct;
      saveProducts(products);
      res.json(updatedProduct);
    }
  }
});

// Eliminar un producto por ID
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


