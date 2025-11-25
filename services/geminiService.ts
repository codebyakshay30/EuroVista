import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CityDetails, TripPlan, BudgetResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to validate API key
const checkApiKey = () => {
  if (!apiKey) {
    console.error("API Key is missing!");
    // We don't throw here to allow the app to render in demo mode if key is missing,
    // though functionality will be limited.
  }
};

export const getLiveCityData = async (cityName: string): Promise<CityDetails> => {
  checkApiKey();

  try {
    // Note: When using googleSearch, we CANNOT use responseSchema or responseMimeType.
    // We must prompt for JSON and parse manually.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a premium travel guide for ${cityName}, Europe.
      For the weather section, use the google search tool to find the REAL-TIME current weather in ${cityName} right now.
      
      Return the output as a valid JSON object matching this structure EXACTLY:
      {
        "intro": "Short informative intro (2-3 sentences)",
        "bestTimeToVisit": "Best season or months to visit for ideal weather and crowds (1 sentence)",
        "weather": { 
          "temp": "Current Temp (e.g. 22°C)", 
          "condition": "Current Condition", 
          "packingSuggestion": "Specific clothing advice based on current weather and local style" 
        },
        "attractions": [
          { "name": "Attraction Name", "benefit": "Short benefit", "price": "Estimated entry cost (e.g. €20)" }
        ],
        "mapContext": "Description of location and surroundings (No URLs)",
        "itinerary": {
          "morning": { "time": "9:00 AM", "activity": "Activity", "description": "Desc", "estimatedCost": "Cost" },
          "afternoon": { "time": "1:00 PM", "activity": "Activity", "description": "Desc", "estimatedCost": "Cost" },
          "evening": { "time": "6:00 PM", "activity": "Activity", "description": "Desc", "estimatedCost": "Cost" },
          "night": { "time": "9:00 PM", "activity": "Activity", "description": "Desc", "estimatedCost": "Cost" }
        },
        "tips": {
          "travel": "Tip",
          "food": "Tip",
          "safety": "Tip",
          "culture": "Tip"
        }
      }
      
      Ensure the JSON is valid and contains NO Markdown formatting.`,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json", // NOT ALLOWED WITH SEARCH
      },
    });

    let text = response.text || "{}";
    // Clean up any potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text) as CityDetails;

    // Extract grounding sources as per guidelines
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map(c => c.web?.uri).filter((u): u is string => !!u) || [];
    if (sources.length > 0) {
      data.sources = sources;
    }

    return data;
  } catch (error) {
    console.error("Error fetching city data:", error);
    // Fallback mock data if API fails
    return {
      intro: `Welcome to ${cityName}, a breathtaking destination full of history and culture. (Offline Data)`,
      bestTimeToVisit: "Spring (April-May) or Autumn (September-October) for mild weather.",
      weather: { temp: "20°C", condition: "Sunny", packingSuggestion: "Light layers, comfortable walking shoes, and sunglasses." },
      attractions: [
          { name: "City Center", benefit: "Heart of the city.", price: "Free" }, 
          { name: "Old Town", benefit: "Historic vibes.", price: "Free" }
      ],
      mapContext: "Located centrally with easy access to transit.",
      itinerary: {
        morning: { time: "9:00 AM", activity: "Local Breakfast", description: "Start with coffee", estimatedCost: "€10" },
        afternoon: { time: "1:00 PM", activity: "Sightseeing", description: "Visit main landmarks", estimatedCost: "€25" },
        evening: { time: "7:00 PM", activity: "Dinner", description: "Authentic cuisine", estimatedCost: "€40" },
        night: { time: "9:30 PM", activity: "River Walk", description: "Enjoy the lights", estimatedCost: "Free" },
      },
      tips: { travel: "Walk everywhere.", food: "Try street food.", safety: "Keep bag close.", culture: "Smile often." }
    };
  }
};

export const generateTripPlan = async (
  destination: string,
  days: number,
  budget: string,
  interests: string
): Promise<TripPlan> => {
  checkApiKey();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
      totalCost: { type: Type.STRING },
      dailyBreakdown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            activity: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedCost: { type: Type.STRING },
          },
        },
      },
      tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Plan a ${days}-day trip to ${destination} with a ${budget} budget. Interests: ${interests}. Provide a condensed sample itinerary for Day 1 as an example.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text || '{}') as TripPlan;
};

export const calculateBudget = async (
  destination: string,
  days: number,
  style: string
): Promise<BudgetResult> => {
  checkApiKey();

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      totalCost: { type: Type.STRING },
      perDay: { type: Type.STRING },
      savingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Calculate travel budget for ${destination}, ${days} days, ${style} style (Backpacker/Mid-range/Luxury). Include food, transport, stay.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return JSON.parse(response.text || '{}') as BudgetResult;
};

export const translatePhrase = async (text: string, targetLang: string): Promise<string> => {
  checkApiKey();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Translate "${text}" to ${targetLang}. Return ONLY the translated text, nothing else.`,
  });
  return response.text || '';
};