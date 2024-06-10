import { Hono } from 'hono'
import {
  getProvider
} from './libs/providers'
import { createTrade, executeTrade } from './libs/trading'
import { getCurrencyBalance } from './libs/wallet'
import { CurrentConfig } from './config'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.text('Hello, Hono.js!'))


app.post('/balances', async (c) => {
  const { walletAddress } = await c.req.json()
  const provider = getProvider()
  const address = walletAddress
  if (!address || !provider) {
    return c.json({ error: 'Wallet not connected or provider not available' }, 400)
  }

  const tokenOutBalance = await getCurrencyBalance(provider, address, CurrentConfig.tokens.in)

  return c.json({ "Total balance is: ": tokenOutBalance })
})

app.post('/execute-trade', async (c) => {

  const { tokenIn, tokenOut } = await c.req.json()

  if (!tokenIn || !tokenOut) {
    throw new Error('Invalid token symbol');
  }

  const trade = await createTrade() // working fine

  const txState = await executeTrade(trade)
  return c.json({ txState })

})

serve(app)