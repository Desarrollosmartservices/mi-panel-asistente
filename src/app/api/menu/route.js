export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Pega aquí tus credenciales de Supabase
const supabaseUrl = 'https://gzyzsjospcysvwvzjtxa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eXpzam9zcGN5c3Z3dnpqdHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTMwOTgsImV4cCI6MjA2OTI4OTA5OH0.bBr6hKWQQb5_qHODYuWYEsx1K-bXS7JP7Mubo_Fmrtg';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    // Consulta 1: Obtener los productos disponibles
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .eq('disponible', true);
    if (errorProductos) throw errorProductos;

    // Consulta 2: Obtener los ingredientes adicionales
    const { data: adicionales, error: errorAdicionales } = await supabase
      .from('ingredientes')
      .select('*')
      .gt('precio_adicional', 0);
    if (errorAdicionales) throw errorAdicionales;

    // ¡NUEVA CONSULTA 3! Obtener la configuración general (incluyendo la URL de la imagen)
    const { data: configuracion, error: errorConfig } = await supabase
      .from('configuracion')
      .select('url_menu_imagen')
      .limit(1); // Solo necesitamos la primera (y única) fila
    if (errorConfig) throw errorConfig;

    // Estructuramos la respuesta final, incluyendo la configuración
    const responseData = {
      menu: productos,
      adicionales: adicionales,
      configuracion: configuracion 
    };

    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}