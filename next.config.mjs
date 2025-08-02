// next.config.mjs
const nextConfig = {
    env: {
      // Expone variables para el servidor (no llegan al cliente)
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    },
  };
  
  export default nextConfig;