import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Manejo de CORS para que Vercel no bloquee la petición
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { casoClinico } = req.body;
  
  // Usamos la variable de entorno que pusiste en Vercel
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `Actúa como enfermero experto. Caso: ${casoClinico}. Responde SOLO en JSON: {"resumen_caso":"","prioridad_inmediata":[],"cuidados_continuos":[],"educación_paciente":[]}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
