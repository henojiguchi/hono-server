import { Hono } from 'hono'

  const app = new Hono()

  app.get('/', (c) => {
    return c.text('Hello Hono!')
  })

  app.get('/api/hello', (c) => {
    return c.json({ message: 'Hello from Hono server!' })
  })

  app.post('/api/echo', async (c) => {
    const body = await c.req.json()
    return c.json({ received: body })
  })

  const port = 3000
  console.log(`Server is running on http://localhost:${port}`)

  export default {
    port,
    fetch: app.fetch,
  }