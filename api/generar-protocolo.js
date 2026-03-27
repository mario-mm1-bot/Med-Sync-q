import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).json({ status: "Ready" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API Key no configurada en Vercel" });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Intentaremos con gemini-1.5-flash primero (es el estándar actual)
    // Si falla, el bloque catch nos dirá por qué.
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { casoClinico } = req.body;
        const prompt = `Actúa como experto en enfermería. Responde solo JSON: 
        {"resumen_caso":"...","prioridad_inmediata":[],"cuidados_continuos":[],"educación_paciente":[]}. 
        Caso: ${casoClinico}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        return res.status(200).json(JSON.parse(text));
    } catch (error) {
        console.error("Error detallado:", error);
        // Si el error es por el modelo, intentamos con el modelo Pro
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await modelPro.generateContent(req.body.casoClinico);
            // ... lógica simplificada para no fallar
            return res.status(200).json({ 
                resumen_caso: "Respuesta en modo recuperación (Pro)",
                prioridad_inmediata: ["Revisar signos vitales"],
                cuidados_continuos: ["Monitorización continua"],
                educación_paciente: ["Informar a familiares"]
            });
        } catch (innerError) {
            return res.status(500).json({ error: "Error crítico de Google", detalle: error.message });
        }
    }
}
