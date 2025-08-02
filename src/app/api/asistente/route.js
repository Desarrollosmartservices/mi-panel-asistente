import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Asegura la compatibilidad con el entorno de Cloudflare
export const runtime = 'edge';

// Esta es la única función que Voiceflow llamará. Actúa como el cerebro principal.
export async function POST(request) {
  try {
    // --- 1. INICIALIZACIÓN Y RECEPCIÓN DE DATOS ---
    // Extraemos las variables que nos envía Voiceflow en cada turno de la conversación.
    const { last_utterance, historial_chat, carrito_pedido, menuItems } = await request.json();
    
    // Inicializamos Supabase y Deepseek usando las claves secretas guardadas en Cloudflare.
    // 'process.env' es la forma segura de acceder a estas variables.
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const deepseekUrl = 'https://api.deepseek.com/chat/completions';

    // --- 2. PREPARACIÓN DEL CONTEXTO PARA LA IA ---
    // Convertimos las variables a texto simple para asegurar que la IA las pueda leer sin errores.
    const carrito_texto = carrito_pedido || '[]';
    const historial_texto = `${historial_chat || ''}\nCliente: ${last_utterance}`;
    
    // --- 3. CONSTRUCCIÓN DEL PROMPT MAESTRO Y LLAMADA A LA IA ---
    const promptMaestro = {
      model: "deepseek-chat",
      messages: [
        {
          "role": "system",
          "content": "REGLA NÚMERO UNO Y MÁS IMPORTANTE: Tu única fuente de conocimiento es la información proporcionada en el 'MENÚ DISPONIBLE'. NUNCA, bajo ninguna circunstancia, respondas a una pregunta o tomes un pedido de un producto que no esté explícitamente listado en el 'MENÚ DISPONIBLE'. Si el cliente pregunta por algo que no está en el menú, tu única respuesta debe ser informar amablemente que no lo tienes y sugerir una alternativa que sí esté en la lista. Eres 'Napo', un asistente de pizzería. Tu misión es gestionar un carrito de compras. Responde SIEMPRE con un objeto JSON. La estructura es: {\"accion\": \"...\", \"carrito_actualizado\": [...], \"respuesta_generada\": \"...\"}. Gestiona el 'CARRITO ACTUAL' basándote en el 'NUEVO MENSAJE' del cliente. El 'carrito_actualizado' debe ser la fusión del carrito anterior con los nuevos cambios."
        },
        {
          "role": "user",
          "content": `MENÚ DISPONIBLE (en JSON): ${menuItems}\n\nCARRITO ACTUAL (resumen): ${carrito_texto}\n\nHISTORIAL PREVIO: ${historial_texto}\n\nNUEVO MENSAJE: ${last_utterance}`
        }
      ],
      response_format: { "type": "json_object" }
    };

    // Realizamos la llamada a la API de Deepseek
    const aiResponse = await fetch(deepseekUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify(promptMaestro)
    });

    // Verificamos si la llamada fue exitosa
    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      throw new Error(`Error de la API de IA: ${aiResponse.status} ${aiResponse.statusText} - ${errorBody}`);
    }

    const aiData = await aiResponse.json();
    const decisionTexto = aiData.choices[0].message.content;
    const decision = JSON.parse(decisionTexto);
    
    // --- 4. EJECUCIÓN DE ACCIONES FUTURAS (BASADAS EN LA DECISIÓN DE LA IA) ---
    // Por ejemplo, si decision.accion === 'confirmar_pedido_final', aquí iría el código
    // para guardar el pedido final en la base de datos de Supabase.
    
    // --- 5. DEVOLVER RESPUESTA A VOICEFLOW ---
    // Enviamos el objeto JSON completo que la IA generó de vuelta a Voiceflow.
    return NextResponse.json(decision);

  } catch (error) {
    console.error('Error en el orquestador:', error);
    // Si algo en todo el proceso falla, devolvemos una respuesta de error controlada.
    const errorResponse = {
      accion: 'error',
      carrito_actualizado: [],
      respuesta_generada: "Lo siento, estoy teniendo un problema técnico. Por favor, intenta de nuevo en un momento."
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}