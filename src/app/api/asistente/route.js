// src/app/api/asistente/route.js
import { createClient } from '@supabase/supabase-js';

// Configura Supabase (usa variables de entorno)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { mensaje, cliente_id } = await request.json();

    // 1. Buscar en FAQs (Supabase)
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*');

    if (error) throw error;

    // 2. Verificar si la pregunta está en FAQs
    const pregunta = mensaje.toLowerCase();
    const respuestaFAQ = faqs.find(faq => 
      faq.pregunta.toLowerCase().includes(pregunta)
    );

    if (respuestaFAQ) {
      return Response.json({ respuesta: respuestaFAQ.respuesta });
    }

    // 3. Si no está en FAQs, usar DeepSeek (o respuesta predeterminada)
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: mensaje }]
      })
    });

    const data = await deepseekResponse.json();
    const respuestaIA = data.choices[0].message.content;

    // 4. Opcional: Guardar conversación en Supabase
    await supabase
      .from('conversaciones')
      .insert([{ cliente_id, mensajes: [{ usuario: mensaje, asistente: respuestaIA }] }]);

    return Response.json({ respuesta: respuestaIA });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}