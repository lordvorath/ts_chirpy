import express from "express";
import path from "path";

async function handlerReadiness(req: express.Request, res: express.Response): Promise<void>{
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});