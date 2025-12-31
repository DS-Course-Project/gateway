import { type Request, type Response, type NextFunction } from "express";
import { authClient } from "./auth-client";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: {
          cookie: req.headers.cookie || "",
        },
      },
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.headers["x-user-id"] = session.user.id;
    // @ts-ignore - role might not be in the default type, but we expect it
    req.headers["x-user-role"] = session.user.role;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
