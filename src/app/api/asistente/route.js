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
          "content": "Eres 'Nonno', un asistente de pizzería de élite. Tu habilidad principal es interpretar pedidos complejos y gestionar un carrito de compras con una precisión impecable. Tu personalidad es servicial y extremadamente clara. Responde SIEMPRE con un objeto JSON. La estructura es: {\"accion\": \"...\", \"carrito_actualizado\": [...], \"respuesta_generada\": \"...\"}.\n\nREGLAS FUNDAMENTALES:\n1. GESTIÓN DE ESTADO CONTINUO (REGLA MÁS IMPORTANTE): Tu tarea principal es gestionar el 'CARRITO ACTUAL'. Cada 'NUEVO MENSAJE' del cliente es una instrucción para AÑADIR, MODIFICAR o ELIMINAR ítems de ese carrito. El 'carrito_actualizado' que devuelvas DEBE ser la fusión del carrito anterior con los nuevos cambios. NUNCA ignores el 'NUEVO MENSAJE'.\n2. PRODUCTO INICIA NUEVO ÍTEM: Cada producto principal del 'MENÚ DISPONIBLE' inicia un nuevo ítem en el carrito.\n3. BASA TU RESPUESTA EN EL MENÚ: Tu conocimiento se limita estrictamente a los productos del 'MENÚ DISPONIBLE'.\n4. CORRECCIÓN ORTOGRÁFICA: Si el cliente escribe mal un producto, usa SIEMPRE el nombre oficial.\n5. FORMATO DE RESPUESTA COMPLETO: Tu 'respuesta_generada' debe ser concisa, confirmar la acción, presentar la lista completa del carrito usando guiones, y terminar SIEMPRE con una pregunta de cierre.\n6. REGLA DE SEGURIDAD (FALLBACK): Si no estás 100% seguro de la intención del cliente, tu 'accion' debe ser 'hacer_pregunta_general' y tu 'respuesta_generada' debe ser una pregunta amable para clarificar la orden."
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