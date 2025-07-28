export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Pega aquí tus credenciales de Supabase
const supabaseUrl = 'https://gzyzsjospcysvwvzjtxa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eXpzam9zcGN5c3Z3dnpqdHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTMwOTgsImV4cCI6MjA2OTI4OTA5OH0.bBr6hKWQQb5_qHODYuWYEsx1K-bXS7JP7Mubo_Fmrtg';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    // Obtenemos los productos disponibles de la tabla 'productos'
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .eq('disponible', true);

    if (errorProductos) throw errorProductos;

    // Obtenemos todos los ingredientes adicionales de la tabla 'ingredientes'
    const { data: adicionales, error: errorAdicionales } = await supabase
      .from('ingredientes')
      .select('*')
      .gt('precio_adicional', 0); // gt = greater than (mayor que)

    if (errorAdicionales) throw errorAdicionales;

    // Estructuramos la respuesta
    const responseData = {
      menu: productos,
      adicionales: adicionales
    };

    return NextResponse.json(responseData);

  } catch (error) {
    // Manejo de errores
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}