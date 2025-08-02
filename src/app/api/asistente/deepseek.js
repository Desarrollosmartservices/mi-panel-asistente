// src/app/api/asistente/deepseek.js
export async function getAIResponse(mensaje) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: mensaje }],
          temperature: 0.7  // Controla la creatividad (0 = preciso, 1 = creativo)
        })
      });
  
      if (!response.ok) {
        throw new Error(`Error de DeepSeek: ${response.status}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
  
    } catch (error) {
      console.error("Error en DeepSeek:", error);
      return "Lo siento, no puedo responder en este momento. Por favor, intenta más tarde.";
    }
  }