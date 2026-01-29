import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";
import { RateLimitRole } from "../type";

const securityMiddleware = async (
 req: Request,
 res: Response,
 next: NextFunction,
) => {
 // ignore middleware and proceed to the next middleware
 if (process.env.NODE_ENV === "test") return next();
 try {
  const role: RateLimitRole = req.user?.role || "guest";

  let limit;
  let message;

  switch (role) {
   case "admin":
    limit = 2;
    message =  "You can only make 2 requests per minute. It's slow down";
    break;

   case "teacher":
   case "student":
    limit = 10;
    message =  "User request limit exceeded (10 per minute). Please wait";

   default:
    limit = 5;
    message =  "Guest limit exceeded (5 per minute). Please signup for higher limits.";
  }

  // create arcjet client for this request
  const client = aj.withRule(
   slidingWindow({
    mode: "LIVE",
    interval: "1m",
    max: limit,
   }),
  );

  // create arcjet request for this request to check rate limit, bot, and other security rules
  const arcjetRequest: ArcjetNodeRequest = {
   headers: req.headers,
   method: req.method,
   url: req.originalUrl ?? req.url,
   socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0" },
  };

  const decision = await client.protect(req);

  if (decision.isDenied() && decision.reason.isBot()) {
   return res
    .status(403)
    .json({ error: "Forbidden", message: "Automated request are not allowed" });
  }
  if (decision.isDenied() && decision.reason.isShield()) {
   return res.status(403).json({
    error: "Forbidden",
    message: "Request blocked by security policy",
   });
  }
  if (decision.isDenied() && decision.reason.isRateLimit()) {
   return res.status(429).json({ error: "Too many request", message });
  }

  next();
 } catch (error) {
  console.error("Arcjet middleware error", error);
  res.status(500).json({
   error: "Internal Error",
   message: "Something went wrong with security middleware",
  });
 }
};

export default securityMiddleware;
