import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { fetchPrice, main } from './fetchPrice'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/swap', async (c) => {
  const { tokenFrom, tokenTo, amount } = await c.req.json()
  console.log(tokenFrom);
  console.log(tokenTo);
  console.log(amount);
  
  
  if (!tokenFrom || !tokenTo || !amount) {
    c.status(400)
    c.json({status: "bad request."})
  }
  console.log("hello");
  
  const result = await fetchPrice(tokenFrom, tokenTo, amount)
  console.log("result in swap: ",result);
  c.status(200)
  return c.json({data: result})
})



// main().then((d) => {
//   console.log("resolved",d);
// })


const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
