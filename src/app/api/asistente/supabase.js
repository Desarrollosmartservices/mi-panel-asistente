// src/app/api/asistente/supabase.js
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usa variables de entorno)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Exporta el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Funciones útiles (opcional)
export async function getFAQ(pregunta) {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .ilike('pregunta', `%${pregunta}%`);  // Búsqueda insensible a mayúsculas

  if (error) throw error;
  return data[0]?.respuesta; // Devuelve la primera coincidencia
}

export async function saveConversation(clienteId, mensaje, respuesta) {
  const { error } = await supabase
    .from('conversaciones')
    .insert([{ 
      cliente_id: clienteId, 
      mensajes: [{ usuario: mensaje, asistente: respuesta }] 
    }]);

  if (error) console.error("Error al guardar conversación:", error);
}