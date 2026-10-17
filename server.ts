import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  getWholesalePriceAdvice,
  optimizeSpiceListing,
  askSpiceAssistant,
} from "./server/geminiService.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json());

// API health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "MasalaSetu B2B Wholesale Spice Marketplace",
    timestamp: new Date().toISOString(),
  });
});

// Gemini Price Advisor endpoint
app.post("/api/gemini/price-advisor", async (req: Request, res: Response) => {
  try {
    const { spiceName, category, originState, currentMandiRate, grade, quantityKg } = req.body;
    const advice = await getWholesalePriceAdvice({
      spiceName: spiceName || "Turmeric",
      category: category || "Turmeric",
      originState,
      currentMandiRate: Number(currentMandiRate) || 0,
      grade,
      quantityKg: Number(quantityKg) || 50,
    });
    res.json(advice);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate price advice" });
  }
});

// Gemini Catalog Content Optimizer
app.post("/api/gemini/catalog-optimizer", async (req: Request, res: Response) => {
  try {
    const { spiceName, category, origin, packaging } = req.body;
    const result = await optimizeSpiceListing({
      spiceName: spiceName || "Salem Turmeric Powder",
      category: category || "Turmeric",
      origin: origin || "Tamil Nadu",
      packaging: packaging || "HDPE Poly Woven Sacks",
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to optimize catalog listing" });
  }
});

// Gemini Interactive Trade Assistant
app.post("/api/gemini/assistant", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const response = await askSpiceAssistant(message, context);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process query" });
  }
});

// Static assets in production
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = parseInt(process.env.PORT || "3000", 10);

if (process.env.NODE_ENV !== "test" && process.argv[1] === __filename) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MasalaSetu server running on http://0.0.0.0:${PORT}`);
  });
}
