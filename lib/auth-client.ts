import { createAuthClient } from "better-auth/client";
import dotenv from "dotenv";

dotenv.config();

export const authClient = createAuthClient({
  baseURL: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  basePath: "/auth",
});
