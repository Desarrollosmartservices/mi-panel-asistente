// Importamos la librería 'NextResponse' para poder enviar respuestas en formato JSON
import { NextResponse } from 'next/server';
// Importamos las librerías 'path' y 'fs' de Node.js para poder leer archivos del sistema
import path from 'path';
import { promises as fs } from 'fs';

// Definimos la función que se ejecutará cuando alguien haga una petición GET a nuestra URL
export async function GET(request) {
  // 1. Construir la ruta completa hasta nuestro archivo menu.json
  const jsonFilePath = path.join(process.cwd(), 'menu.json');

  // 2. Leer el contenido del archivo de forma asíncrona
  const fileContents = await fs.readFile(jsonFilePath, 'utf8');

  // 3. Convertir el texto del archivo (que es un string) a un objeto JSON que podamos manipular
  const menu = JSON.parse(fileContents);

  // 4. Filtrar el menú para obtener solo los productos donde la propiedad "disponible" es true
  const availableItems = menu.filter(item => item.disponible === true);

  // 5. Devolver como respuesta únicamente los productos disponibles, en formato JSON.
  return NextResponse.json(availableItems);
}