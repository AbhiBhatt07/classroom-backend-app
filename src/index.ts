import express from "express";
import subjectRouter from "./routes/subject";
import cors from "cors";
import securityMiddleware from "./middleware/security";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) {
 throw new Error("Fontend URL is not set in .env file");
}

app.use(express.json());

app.use(securityMiddleware);

// enable cors for frontend app
app.use(
 cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
 }),
);

app.use("/api/subjects", subjectRouter);

app.get("/", (req, res) => {
 res.send("Welcome the subject API route");
});

app.listen(PORT, () => {
 console.log(`server is running at http://localhost:${PORT}`);
});
