import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Gemini features will return fallback guidance.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export async function getWholesalePriceAdvice(params: {
  spiceName: string;
  category: string;
  originState?: string;
  currentMandiRate?: number;
  grade?: string;
  quantityKg: number;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      suggestedBasePrice: params.currentMandiRate ? Math.round(params.currentMandiRate * 1.12) : 240,
      tiers: [
        { minKg: 20, maxKg: 49, pricePerKg: 240, discountPercent: 0 },
        { minKg: 50, maxKg: 99, pricePerKg: 225, discountPercent: 6 },
        { minKg: 100, maxKg: 500, pricePerKg: 210, discountPercent: 12.5 }
      ],
      recommendedMoqKg: 25,
      marketInsight: "Based on current mandi benchmark figures in major spice trading hubs (Unjha/Guntur), maintaining a 10-12% wholesale gross spread allows healthy vendor margins while remaining competitive for retail kirana buyers.",
      fssaiNotes: "Ensure moisture content is tested below 10-12% and volatile oil content matches Agmark Grade Special standards."
    };
  }

  try {
    const prompt = `You are a senior Indian agricultural commodities & spice mandi trading expert for the B2B wholesale platform MasalaSetu.
Analyze the following spice listing request and provide structured wholesale pricing tiers and MOQ recommendations for bulk B2B sales in India (in INR ₹ per kg):
Spice: ${params.spiceName}
Category: ${params.category}
Origin State: ${params.originState || "India"}
Current Reference Rate / Mandi baseline: ${params.currentMandiRate ? '₹' + params.currentMandiRate : 'Unknown'}
Grade: ${params.grade || 'Standard Wholesale Commercial'}
Target Batch Quantity: ${params.quantityKg} kg

Respond in valid JSON format only with the following structure:
{
  "suggestedBasePrice": number,
  "recommendedMoqKg": number,
  "tiers": [
    {"minKg": number, "maxKg": number, "pricePerKg": number, "discountPercent": number},
    {"minKg": number, "maxKg": number, "pricePerKg": number, "discountPercent": number},
    {"minKg": number, "maxKg": number, "pricePerKg": number, "discountPercent": number}
  ],
  "marketInsight": "string explaining seasonal supply, major mandi trends (e.g. Unjha, Guntur, Salem, Ramganj), and margin strategy",
  "fssaiNotes": "string specifying mandatory moisture percentage, foreign matter limits, and packaging requirements under FSSAI Spice regulations"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini pricing advice error:", error);
    return {
      suggestedBasePrice: params.currentMandiRate ? Math.round(params.currentMandiRate * 1.1) : 220,
      tiers: [
        { minKg: 25, maxKg: 49, pricePerKg: 220, discountPercent: 0 },
        { minKg: 50, maxKg: 99, pricePerKg: 205, discountPercent: 7 },
        { minKg: 100, maxKg: 500, pricePerKg: 195, discountPercent: 11 }
      ],
      recommendedMoqKg: 25,
      marketInsight: "Calculated using standard APMC mandi benchmark margins and seasonal volume discounts.",
      fssaiNotes: "Ensure mandatory batch lab test reports for pesticide residues and moisture standards."
    };
  }
}

export async function optimizeSpiceListing(params: {
  spiceName: string;
  category: string;
  origin: string;
  packaging: string;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      title: `${params.spiceName} - Export & Wholesale Quality (${params.origin})`,
      hindiTitle: `${params.spiceName} - थोक व्यापार ग्रेड`,
      description: `High purity authentic ${params.spiceName} sourced directly from verified farmer clusters in ${params.origin}. Mechanically cleaned, sun-dried, and sorted to ensure zero adulteration. Ideal for retail repackaging, hotel chains, and food processing units.`,
      aromaProfile: "Warm, pungent, earthy aromatic profile with high essential volatile oil content.",
      culinaryUses: "Essential foundation for daily curries, restaurant gravies, savory snacks, and custom spice blends.",
      shelfLifeMonths: 12,
      storageInstruction: "Store in cool, dry place away from direct sunlight in airtight moisture-barrier containers.",
      fssaiHighlights: ["100% natural, unadulterated", "Moisture content < 10%", "FSSAI Food Safety compliant batch tested"]
    };
  }

  try {
    const prompt = `You are a B2B spice marketing and quality specification expert in India.
Generate professional commercial catalog content for:
Spice: ${params.spiceName}
Category: ${params.category}
Origin: ${params.origin}
Packaging: ${params.packaging}

Return JSON only with this structure:
{
  "title": "string (refined commercial B2B product title)",
  "hindiTitle": "string (natural Devanagari Hindi commercial title)",
  "description": "string (120-160 words professional wholesale description highlighting purity, processing method, and grading)",
  "aromaProfile": "string (sensory taste, aroma, pungency notes)",
  "culinaryUses": "string (key commercial and retail food uses)",
  "shelfLifeMonths": number,
  "storageInstruction": "string",
  "fssaiHighlights": ["bullet 1", "bullet 2", "bullet 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini catalog optimize error:", error);
    return {
      title: `${params.spiceName} - Grade A Wholesale (${params.origin})`,
      hindiTitle: `${params.spiceName} - उत्तम थोक गुणवत्ता`,
      description: `Premium grade ${params.spiceName} sourced from prime agricultural tracts in ${params.origin}. Standardized for high potency, rich color, and rigorous purity standards.`,
      aromaProfile: "Rich authentic aroma and characteristic spice intensity.",
      culinaryUses: "Widely used across commercial kitchens, packaged food manufacturing, and retail grocery stores.",
      shelfLifeMonths: 12,
      storageInstruction: "Store in a dry ventilated warehouse at ambient temperature.",
      fssaiHighlights: ["Batch lab certified", "Purity tested", "Hygienically packaged"]
    };
  }
}

export async function askSpiceAssistant(message: string, context?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      reply: "MasalaSetu B2B Assistant: Welcome! I can help you with spice grading standards (Agmark / FSSAI), wholesale mandi benchmark rates across Unjha, Guntur, and Salem, bulk order logistics calculations, GST rates (5% on whole & powdered spices), and private-label contract packaging requirements. How can I assist your spice business today?"
    };
  }

  try {
    const prompt = `You are MasalaSetu's AI Trade Advisor — an expert in Indian spice manufacturing, APMC mandi trading (Unjha, Guntur, Erode, Ramganj), FSSAI food safety regulations, GST compliance (5% on unbranded/branded spices), and B2B wholesale logistics.
Answer the following user query with practical, actionable, domain-rich business knowledge. If the user asks in Hindi or asks for Hindi/Gujarati terms, respond bilingually or in natural Hindi/English. Keep response structured and concise.

Context: ${context || "B2B Spice Marketplace for Indian kirana retailers, spice manufacturers, and platform mediators."}
User Query: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return {
      reply: response.text || "I am ready to help with your wholesale spice query."
    };
  } catch (error) {
    console.error("Gemini assistant error:", error);
    return {
      reply: "MasalaSetu Trade Advisor: For current wholesale orders, ensure vendor FSSAI verification is active and check the tiered pricing schedule based on your desired tonnage."
    };
  }
}
