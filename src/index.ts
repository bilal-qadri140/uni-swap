import { Hono } from 'hono'
import { createTrade, executeTrade } from './libs/trading'
import { getCurrencyBalance, unwrapETH, wrapETH } from './libs/wallet'
import { CurrentConfig, Environment } from './config'
import { serve } from '@hono/node-server'
import { SupportedChainId, Token } from '@uniswap/sdk-core'
import { ethers, providers } from 'ethers'
const app = new Hono()

app.get('/', (c) => c.text('Hello, Hono.js!'))



const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.local
);


function createWallet(privateKey: string, mainnetProvider: ethers.providers.JsonRpcProvider): ethers.Wallet {
  let provider = mainnetProvider;
  if (CurrentConfig.env == Environment.LOCAL) {
    provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.local);
  }
  return new ethers.Wallet(privateKey, provider);
}


app.post('/balances', async (c) => {
  const { walletAddress, privateKey, token } = await c.req.json()
  const wallet = createWallet(privateKey, mainnetProvider)
  const provider = wallet.provider

  const address = walletAddress
  if (!address || !provider) {
    return c.json({ error: 'Wallet not connected or provider not available or token not provided' }, 400)
  }

  const tokenIn = new Token(
    SupportedChainId.MAINNET,
    token.address,
    token.decimal,
    token.symbol,
    token.name
  )


  const tokenOutBalance = await getCurrencyBalance(provider, address, true, tokenIn)

  return c.json({ "Total balance is: ": tokenOutBalance })
})



app.post('/execute-trade', async (c) => {

  const { walletFrom, privateKey, walletTo, tokenIn, tokenOut, amount } = await c.req.json()

  if (!tokenIn || !tokenOut || !walletTo || !amount) {
    return c.json({ error: 'Wallet not connected or tokens not provided or amount not provided' }, 400)
  }

  const wallet = createWallet(privateKey, mainnetProvider)
  const token0 = new Token(
    SupportedChainId.MAINNET,
    tokenIn.address,
    tokenIn.decimal,
    tokenIn.symbol,
    tokenIn.name
  )
  const token1 = new Token(
    SupportedChainId.MAINNET,
    tokenOut.address,
    tokenOut.decimal,
    tokenOut.symbol,
    tokenOut.name
  )

  const trade = await createTrade(wallet, token0, token1, amount) // working fine

  const txState = await executeTrade(wallet, trade, walletTo, walletFrom, token0)

  return c.json({ txState })

})

app.post('/eth-token', async (c) => {
  const { privateKey, tokenIn, amount } = await c.req.json()
  const wallet = createWallet(privateKey, mainnetProvider)
  const txState = await wrapETH(amount, wallet)
  return c.json({ txState })
})




serve(app)