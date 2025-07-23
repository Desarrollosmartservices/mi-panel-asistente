export const runtime = 'edge'; // Mantenemos esta línea importante

import { NextResponse } from 'next/server';

// ¡AQUÍ ESTÁ EL CAMBIO! Hemos movido los datos del menú a una constante.
const menuData = [
  {
    "id": 1,
    "nombre": "Pizza Margarita",
    "precio": 10.00,
    "descripcion": "Clásica pizza con salsa de tomate, mozzarella fresca y albahaca.",
    "categoria": "Pizzas",
    "disponible": true
  },
  {
    "id": 2,
    "nombre": "Pizza Pepperoni",
    "precio": 12.00,
    "descripcion": "La favorita de todos con extra pepperoni y queso mozzarella.",
    "categoria": "Pizzas",
    "disponible": true
  },
  {
    "id": 3,
    "nombre": "Ensalada César",
    "precio": 8.00,
    "descripcion": "Lechuga romana, crutones, queso parmesano y aderezo César.",
    "categoria": "Entradas",
    "disponible": false
  },
  {
    "id": 4,
    "nombre": "Refresco",
    "precio": 2.00,
    "descripcion": "Lata de 355ml. Sabores variados.",
    "categoria": "Bebidas",
    "disponible": true
  }
];

// La función ahora es mucho más simple. Ya no necesita leer archivos.
export async function GET(request) {
  // Filtramos el menú para obtener solo los productos disponibles
  const availableItems = menuData.filter(item => item.disponible === true);

  // Devolvemos como respuesta únicamente los productos disponibles.
  return NextResponse.json(availableItems);
}