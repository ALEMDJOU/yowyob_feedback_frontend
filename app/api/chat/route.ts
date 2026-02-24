import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Check for api key existence at runtime
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ reply: "Configuration Groq manquante (Clé API requise)." }, { status: 500 });
        }

        // On initialise Groq avec ta clé API (à mettre dans .env.local)
        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Tu es YowBot, l'assistant expert de Yowyob. 
                    Tes règles :
                    1. Réponds toujours en français.
                    2. Sois concis et amical.
                    3. Tu connais le dashboard : onglets Feed, Abonnements, Projets et Compte.`
                },
                ...history, // On passe l'historique pour qu'il se souvienne du contexte
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile", // Modèle ultra rapide de Groq
            temperature: 0.7,
        });

        const reply = completion.choices[0]?.message?.content || "Désolé, je ne trouve pas de réponse.";
        return NextResponse.json({ reply });

    } catch (error) {
        console.error("Erreur Groq:", error);
        return NextResponse.json({ reply: "Erreur technique avec Groq." }, { status: 500 });
    }
}