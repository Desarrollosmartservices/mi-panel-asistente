export const runtime = 'edge';

import { createClient } from '@supabase/ssr';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(request) {
  try {
    const { mensaje, cliente_id } = await request.json();

    // Buscar en FAQs
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .ilike('pregunta', `%${mensaje}%`);

    if (error) throw error;
    if (faqs.length > 0) {
      return new Response(JSON.stringify({ respuesta: faqs[0].respuesta }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Consultar a DeepSeek
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

    // Guardar conversación
    await supabase
      .from('conversaciones')
      .insert([{ 
        cliente_id, 
        mensajes: [{ usuario: mensaje, asistente: respuestaIA }] 
      }]);

    return new Response(JSON.stringify({ respuesta: respuestaIA }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}