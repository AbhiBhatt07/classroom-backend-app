import AgentAPI from "apminsight";
AgentAPI.config()
import express from "express";
import subjectRouter from "./routes/subject.js";
import cors from "cors";
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) {
 throw new Error("Fontend URL is not set in .env file");
}
// enable cors for frontend app
app.use(
 cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
 }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use("/api/subjects", subjectRouter);

app.get("/", (req, res) => {
 res.send("Welcome the subject API route");
});

app.listen(PORT, () => {
 console.log(`server is running at http://localhost:${PORT}`);
});
