const express = require("express");
const multer = require("multer");
const cors = require("cors");
const productsRouter = require("./src/api/routes/products");
const cartsRouter = require("./src/api/routes/carts");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/products", upload.single("image"), productsRouter);
app.use("/api/carts", cartsRouter);

const port = 8080;
app.listen(port, () => console.log(`Server listening on port ${port}`));
