import { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

const PROMPTS: Record<string, string> = {
  CAM_1A: "Security camera footage, 1990s CCTV, low quality, grainy. A creepy empty animatronic show stage with closed purple curtains and a checkered floor. Dark, dimly lit, horror atmosphere.",
  CAM_1B: "Security camera footage, 1990s CCTV. A large pizza restaurant dining area with tables, party hats, and confetti. Dark, abandoned, night vision green tint, scary.",
  CAM_5:  "Security camera footage, 1990s CCTV. A dirty commercial kitchen with pots and pans scattered. No signal, heavy static, very dark, metallic surfaces.",
  CAM_2A: "Security camera footage, 1990s CCTV. A long dark hallway with a checkered floor and posters on the wall. The end of the hall is pitch black. Night vision.",
  CAM_2B: "Security camera footage, 1990s CCTV. A close up of a blind spot corner in a room with a 'Celebrate' poster on the wall. Very dark shadows.",
  CAM_3A: "Security camera footage, 1990s CCTV. A long dark utility corridor with pipes on the ceiling and wires hanging down. Industrial horror.",
  CAM_3B: "Security camera footage, 1990s CCTV. A close up of a right corner blind spot with cleaning supplies and boxes. Claustrophobic.",
  CAM_4:  "Security camera footage, 1990s CCTV. Inside a metallic ventilation shaft. Tight, claustrophobic, gray metal tunnel, dust particles, fan blades in the distance.",
  OFFICE: "Security camera footage. A security guard office desk with fans and monitors."
};

// Safe API Key retrieval for various environments (Vite, Webpack, or direct)
const getApiKey = () => {
  try {
    // Check strict process.env first (Node/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Check Vite specific import.meta (Common in modern builds)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Environment variables not accessible");
  }
  return "";
};

const apiKey = getApiKey();
// Only initialize AI if key exists to prevent crash. Logic handles missing key gracefully.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const useGenAIImages = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const generateImage = useCallback(async (camId: string) => {
    // If already has image or is loading, skip
    if (images[camId] || loading[camId]) return;
    
    // If no AI instance (no key), stop here.
    if (!ai) {
        console.warn("Google GenAI not initialized (Missing API Key)");
        return;
    }

    setLoading(prev => ({ ...prev, [camId]: true }));

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000); // 10s timeout
      });

      const requestPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: PROMPTS[camId] || "CCTV security camera footage, dark room, horror."
            },
          ],
        },
      });

      // Race against timeout
      const response: any = await Promise.race([requestPromise, timeoutPromise]);

      // Extract image
      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (imageUrl) {
        setImages(prev => ({ ...prev, [camId]: imageUrl }));
      }
    } catch (error) {
      console.warn(`Failed/Timeout generating image for ${camId}. Using fallback.`);
    } finally {
      setLoading(prev => ({ ...prev, [camId]: false }));
    }
  }, [images, loading]);

  return {
    images,
    loading,
    generateImage
  };
};