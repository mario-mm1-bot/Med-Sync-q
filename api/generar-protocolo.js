import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Solo POST');
    
    // Busca la llave que configuraste en el panel de Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const { casoClinico } = req.body;
        const prompt = `Actúa como motor de lógica clínica de enfermería. Responde estrictamente en formato JSON con estas llaves: resumen_caso, prioridad_inmediata (array), cuidados_continuos (array), educación_paciente (array). Usa terminología NANDA/NIC/NOC. No incluyas explicaciones fuera del JSON. Caso: ${casoClinico}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        res.status(200).json(JSON.parse(text));
    } catch (error) {
        res.status(500).json({ error: "Error de IA" });
    }
}
