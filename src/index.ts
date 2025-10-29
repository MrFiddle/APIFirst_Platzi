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
const users: any[] = [];
let nextUserId = 1;

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
    id: (nextUserId++).toString(),
    name,
    age,
    email,
  };
  users.push(newUser);
  console.log("New user created:", newUser);
  res.status(201).json(newUser);
});

app.get("/users/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json(user);
});

app.put("/users/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  const updates = req.body;
  users[userIndex] = { ...users[userIndex], ...updates };
  console.log("User updated!", users[userIndex]);
  res.status(200).json(users[userIndex]);
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
