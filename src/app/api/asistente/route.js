import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const runtime = 'edge';

// Pega aquí tus credenciales
const supabaseUrl = 'https://gzyzsjospcysvwvzjtxa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6eXpzam9zcGN5c3Z3dnpqdHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTMwOTgsImV4cCI6MjA2OTI4OTA5OH0.bBr6hKWQQb5_qHODYuWYEsx1K-bXS7JP7Mubo_Fmrtg';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  const { accion, contexto } = await request.json();

  // Por ahora, solo manejaremos la acción de obtener el menú
  if (accion === 'obtener_menu') {
    const { data: menu, error } = await supabase.from('productos').select('*').eq('disponible', true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ menu });
  }

  // Más adelante, añadiremos la lógica para llamar a la IA aquí

  return NextResponse.json({ respuesta: "Acción no reconocida todavía." });
}