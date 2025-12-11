import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IDAnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isIndianID: {
      type: Type.BOOLEAN,
      description: "True if the image looks like an Indian government issued ID card (Aadhaar, Voter ID, Driving License, Passport, etc).",
    },
    idType: {
      type: Type.STRING,
      description: "The type of ID detected (e.g., 'Aadhaar Card', 'Driving License', 'Voter ID', 'Passport').",
    },
    addressVisible: {
      type: Type.BOOLEAN,
      description: "True if a full or partial address is clearly readable in the image.",
    },
    extractedAddress: {
      type: Type.STRING,
      description: "The full address text extracted from the card. Null if not visible.",
      nullable: true,
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 1 regarding the extraction.",
    },
    issueDetected: {
      type: Type.STRING,
      enum: ['none', 'wrong_side', 'blur', 'glare', 'obscured', 'not_an_id'],
      description: "The primary issue preventing extraction. 'wrong_side' if it's the front of an ID where address is on the back (like Aadhaar).",
    },
    userInstruction: {
      type: Type.STRING,
      description: "A helpful instruction for the user. E.g., 'Please flip the card to the back side to see the address' or 'Image is blurry, please hold steady'.",
    },
  },
  required: ["isIndianID", "idType", "addressVisible", "extractedAddress", "issueDetected", "userInstruction", "confidenceScore"],
};

export const analyzeIDCard = async (base64Image: string): Promise<IDAnalysisResult> => {
  try {
    // Clean base64 string if it contains metadata prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze this image to extract a physical address from an Indian ID card. 
            Common Indian IDs: Aadhaar Card (Address usually on BACK), Voter ID (Address usually on BACK), Driving License (Address varies), Passport (Address on LAST page).
            
            1. Identify if it is a valid ID.
            2. specific check: If it is an Aadhaar card or Voter ID showing the FRONT (Photo/Name side), usually the address is NOT there. Mark issueDetected as 'wrong_side'.
            3. Extract the address strictly as it appears.
            4. If text is blurry or glare blocks the address, report the issue.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as IDAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze ID card. Please try again.");
  }
};
