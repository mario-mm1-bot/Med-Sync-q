import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send("OK");
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Un prompt mucho más estricto para que no rompa el formato
    const prompt = `Eres un sistema médico. Devuelve SOLO un objeto JSON válido. NO uses bloques de código (sin \`\`\`json). Estructura estricta: {"resumen_caso":"...","prioridad_inmediata":[],"cuidados_continuos":[],"educación_paciente":[]}. Caso: ${req.body.casoClinico}`;
    
    const result = await model.generateContent(prompt);
    let textoVigente = result.response.text();
    
    // Limpieza extrema por si la IA es terca e incluye markdown
    textoVigente = textoVigente.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(textoVigente));
  } catch (error) {
    // Si falla, enviamos el error exacto al celular para que lo leas
    return res.status(500).json({ error: "Fallo en IA: " + error.message });
  }
                                 }
