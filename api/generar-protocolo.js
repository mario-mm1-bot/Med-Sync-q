import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ mensaje: "Servidor Med-Sync Pro listo" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

    try {
        // Inicializamos con gemini-pro que es el más compatible
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const { casoClinico } = req.body;
        
        const prompt = `Actúa como motor de lógica clínica de enfermería. 
        Responde estrictamente en formato JSON con estas llaves: 
        resumen_caso, prioridad_inmediata (array), cuidados_continuos (array), educación_paciente (array). 
        Caso clínico: ${casoClinico}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        res.status(200).json(JSON.parse(text));
    } catch (error) {
        console.error("Error detectado:", error.message);
        res.status(500).json({ error: "Error de modelo", detalle: error.message });
    }
}
