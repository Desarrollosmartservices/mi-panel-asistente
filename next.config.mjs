const nextConfig = {
    experimental: {
      runtime: 'experimental-edge',
    },
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    },
  };
  
  export default nextConfig;