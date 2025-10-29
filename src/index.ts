import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import * as OpenApiValidator from "express-openapi-validator";

import { Request } from "express";
import { Response } from "express";
import { NextFunction } from "express";

const app = express();
const port = 3000;

// In-memory storage for users
const users: any[] = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
  },
];
let nextUserId = 2;

// In-memory storage for products
const products: any[] = [
  {
    id: 1,
    name: "Sample Product",
    price: 20.0,
    category: "electronics",
    description: "This is a sample product.",
    tags: ["sample", "product"],
    inStock: true,
    specifications: {
      weight: "1kg",
      dimensions: "10x10x10cm",
    },
    ratings: [{ score: 5, review: "Great product!" }],
  },
];
let nextProductId = 2;

app.use(express.json());

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// OpenAPI validator middleware
(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /\/api-docs(\/.*)?/,
  }) as any[]
).forEach((handler) => app.use(handler));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Root path!" });
});

app.get("/hello", (req, res) => {
  res.status(200).json({ message: "Hello from /hello" });
});

app.post("/users", (req: Request, res: Response) => {
  const { name, age, email } = req.body;
  const newUser = {
    id: nextUserId++,
    name,
    age,
    email,
  };
  users.push(newUser);
  console.log("New user created:", newUser);
  res.status(201).json(newUser);
});

app.get("/users/all", (req: Request, res: Response) => {
  console.log("Fetching all users");
  if (users.length === 0) {
    console.log("No users found");
    return res.status(404).json({ error: "No users found" });
  }
  res.status(200).json(users);
});

app.get("/users/:userId", (req: Request, res: Response) => {
  console.log("Fetching user with ID:", req.params.userId);
  const userId = parseInt(req.params.userId);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json(user);
});

app.put("/users/:userId", (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  const updates = req.body;
  users[userIndex] = { ...users[userIndex], ...updates };
  console.log("User updated!", users[userIndex]);
  res.status(200).json(users[userIndex]);
});

app.post("/products", (req: Request, res: Response) => {
  const {
    name,
    price,
    category,
    description,
    tags,
    inStock,
    specifications,
    ratings,
  } = req.body;
  const newProduct = {
    id: nextProductId++,
    name,
    price,
    category,
    description,
    tags,
    inStock,
    specifications,
    ratings,
  };
  products.push(newProduct);
  console.log("New product created:", newProduct);
  res.status(201).json(newProduct);
});

app.get("/products/:productId", (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

app.put("/products/:productId", (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  const updates = req.body;
  products[productIndex] = { ...products[productIndex], ...updates };
  console.log("Product updated!", products[productIndex]);
  res.status(200).json(products[productIndex]);
});

// Error handler for validation errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
