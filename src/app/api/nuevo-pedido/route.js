export const runtime = 'edge';
// Importamos NextResponse para enviar la respuesta
import { NextResponse } from 'next/server';

// Definimos una función ASÍNCRONA que se ejecutará al recibir una petición POST
// POST es el método HTTP que se usa para ENVIAR datos a un servidor.
export async function POST(request) {
  try {
    // 1. Obtenemos los datos que el bot nos envía en el "cuerpo" (body) de la petición
    const orderData = await request.json();

    // 2. Por ahora, solo mostraremos los datos en la consola de nuestro servidor.
    // Esto nos permitirá verificar que la información está llegando correctamente.
    console.log("===================================");
    console.log("¡NUEVO PEDIDO RECIBIDO! 📥");
    console.log("Datos del Pedido:", orderData);
    console.log("===================================");

    // 3. Enviamos una respuesta de éxito al bot para que sepa que recibimos el pedido.
    return NextResponse.json({ message: 'Pedido recibido con éxito' }, { status: 200 });

  } catch (error) {
    // En caso de que algo falle (ej: el JSON está mal formado)
    console.error("Error al procesar el pedido:", error);
    return NextResponse.json({ message: 'Error al procesar el pedido' }, { status: 500 });
  }
}