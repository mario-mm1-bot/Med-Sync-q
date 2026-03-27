import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Manejo de CORS para evitar bloqueos
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Falta la API Key en el servidor' });

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { casoClinico } = req.body;
        const prompt = `Actúa como motor de lógica clínica de enfermería. Responde solo con un objeto JSON (sin markdown ni texto extra) con estas llaves: resumen_caso, prioridad_inmediata (array), cuidados_continuos (array), educación_paciente (array). Caso: ${casoClinico}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Limpieza de posibles etiquetas markdown que Gemini a veces añade
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        res.status(200).json(JSON.parse(text));
    } catch (error) {
        console.error("Error en API:", error);
        res.status(500).json({ error: "Error interno en la IA", detalles: error.message });
    }
}
