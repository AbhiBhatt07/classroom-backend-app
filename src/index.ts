import express from "express";
import subjectRouter from "./routes/subject";
import cors from "cors"

const app = express();
const PORT = 8000;

app.use(express.json())

// enable cors for frontend app
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}))

app.use("/api/subject", subjectRouter)

app.get("/", (req, res) => {
  res.send("Welcome the subject API route")
})

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
})