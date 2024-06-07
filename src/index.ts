import { Hono } from 'hono'
import {
  getProvider,
  getWalletAddress,
  TransactionState,
} from './libs/providers'
import { createTrade, executeTrade, TokenTrade } from './libs/trading'
import { getCurrencyBalance, wrapETH } from './libs/wallet'
import { CurrentConfig } from './config'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => c.text('Hello, Hono.js!'))

app.get('/connect-wallet', async (c) => {
  try {
    // const result = await connectBrowserExtensionWallet()
    // return c.json({ success: result })
  } catch (error) {
    return c.json({ error }, 500)
  }
})

app.get('/balances', async (c) => {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!address || !provider) {
    return c.json({ error: 'Wallet not connected or provider not available' }, 400)
  }

  const tokenInBalance = await getCurrencyBalance(provider, address, CurrentConfig.tokens.in)
  const tokenOutBalance = await getCurrencyBalance(provider, address, CurrentConfig.tokens.out)

  return c.json({ tokenInBalance, tokenOutBalance })
})



app.post('/create-trade', async (c) => {
  const {tokenIn, tokenOut} = await c.req.json()
  const trade = await createTrade()
  return c.json(trade.outputAmount.currency.address)
})


app.post('/execute-trade', async (c) => {
  const trade: TokenTrade = await c.req.json()
  const txState = await executeTrade(trade)
  return c.json({ txState })
})

app.post('/wrap-eth', async (c) => {
  const { amount } = await c.req.json()
  const result = await wrapETH(amount)
  return c.json({ result })
})

app.get('/block-number', async (c) => {
  const provider = getProvider()
  const blockNumber = await provider?.getBlockNumber()
  return c.json({ blockNumber })
})

serve(app)