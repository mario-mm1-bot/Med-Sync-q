import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send("Servidor activo. Esperando petición POST.");
  }

  const { casoClinico } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta la API KEY en Vercel" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Responde solo en JSON: {"resumen_caso":"...","prioridad_inmediata":[],"cuidados_continuos":[],"educación_paciente":[]}. Caso: ${casoClinico}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: "Error en la IA: " + error.message });
  }
      }
