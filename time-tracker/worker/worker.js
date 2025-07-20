addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    // Get single date
    if (path === '/get' && request.method === 'GET') {
      const date = url.searchParams.get('date')
      const data = await STUDY_DATA.get(date, 'json')
      return new Response(JSON.stringify(data || {}), { headers })
    }

    // Get month data
    if (path === '/get-month' && request.method === 'GET') {
      const year = url.searchParams.get('year')
      const month = url.searchParams.get('month')
      const prefix = `${year}-${month}-`
      
      const keys = await STUDY_DATA.list({ prefix })
      const monthData = {}
      
      for (const key of keys.keys) {
        const data = await STUDY_DATA.get(key.name, 'json')
        monthData[key.name] = data
      }
      
      return new Response(JSON.stringify(monthData), { headers }
    }

    // Save data
    if (path === '/save' && request.method === 'POST') {
      const { date, ...data } = await request.json()
      await STUDY_DATA.put(date, JSON.stringify(data))
      return new Response(JSON.stringify({ success: true }), { headers }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers })
  }
}