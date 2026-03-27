import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Configuración de cabeceras para evitar errores de red
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
        return res.status(200).json({ mensaje: "Servidor activo. Envía un POST para analizar." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === "") {
        return res.status(500).json({ error: "Error: La API Key no está configurada en Vercel." });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { casoClinico } = req.body;
        
        // Prompt ultra-estricto para evitar errores de formato
        const prompt = `Genera un protocolo de enfermería para: ${casoClinico}. 
        Responde exclusivamente en formato JSON puro, sin bloques de código markdown, con esta estructura:
        {
            "resumen_caso": "texto",
            "prioridad_inmediata": ["item1", "item2"],
            "cuidados_continuos": ["item1", "item2"],
            "educación_paciente": ["item1", "item2"]
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Limpiamos el texto por si la IA agrega ```json ... ```
        const jsonLimpio = text.replace(/```json|```/g, "").trim();
        
        return res.status(200).json(JSON.parse(jsonLimpio));

    } catch (error) {
        console.error("Detalle del error:", error);
        return res.status(500).json({ 
            error: "Error en el motor de IA", 
            detalles: error.message 
        });
    }
}
