export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // Try to use the configured API base URL, fallback to localhost if not set (though on Vercel it should be set)
  const backendUrl = process.env.VITE_API_BASE_URL || process.env.APP_URL || 'http://localhost:8000';
  
  // Clean URL to avoid double slashes, but keep http:// or https://
  const url = `${backendUrl}/api/keep-alive`.replace(/([^:]\/)\/+/g, '$1');

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    return new Response(JSON.stringify({ success: true, message: 'Pinged backend successfully', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
