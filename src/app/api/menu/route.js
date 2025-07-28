import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Esta línea es crucial para la compatibilidad con Cloudflare
export const runtime = 'edge';

// Reemplaza estos valores con tus propias credenciales de Supabase
const supabaseUrl = 'https://gzyzsjospcysvwvzjtxa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eXpzam9zcGN5c3Z3dnpqdHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTMwOTgsImV4cCI6MjA2OTI4OTA5OH0.bBr6hKWQQb5_qHODYuWYEsx1K-bXS7JP7Mubo_Fmrtg';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    // Consulta 1: Obtener los productos disponibles de la tabla 'productos'
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .eq('disponible', true);

    if (errorProductos) {
      throw errorProductos;
    }

    // Consulta 2: Obtener los ingredientes adicionales de la tabla 'ingredientes'
    const { data: adicionales, error: errorAdicionales } = await supabase
      .from('ingredientes')
      .select('*');

    if (errorAdicionales) {
      throw errorAdicionales;
    }

    // Consulta 3: Obtener la configuración general (incluyendo la URL de la imagen del menú)
    const { data: configuracion, error: errorConfig } = await supabase
      .from('configuracion')
      .select('url_menu_imagen, horario, ubicacion_link') // ¡Línea modificada para traer todos los datos!
      .limit(1);

    if (errorConfig) {
      throw errorConfig;
    }

    // Estructuramos la respuesta final, incluyendo toda la información
    const responseData = {
      menu: productos,
      adicionales: adicionales,
      configuracion: configuracion 
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    // Manejo de errores
    console.error('Error al consultar Supabase:', error.message);
    return NextResponse.json({ error: 'Error al obtener los datos del menú', details: error.message }, { status: 500 });
  }
}