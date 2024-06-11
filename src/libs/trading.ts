import {
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
} from '@uniswap/sdk-core'
import {
  Pool,
  Route,
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  Trade,
} from '@uniswap/v3-sdk'
import { Wallet, ethers } from 'ethers'
import JSBI from 'jsbi'

import { CurrentConfig } from '../config'
import {
  ERC20_ABI,
  QUOTER_CONTRACT_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
} from './constants'
import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from './constants'
import { getPoolInfo } from './pool'
import {
  sendTransaction,
  TransactionState,
} from './providers'
import { fromReadableAmount } from './utils'

export type TokenTrade = Trade<Token, Token, TradeType>

// Trading Functions

export async function createTrade(wallet:ethers.Wallet,tokenIn: Token, tokenOut: Token, amount: number): Promise<TokenTrade> {
  const poolInfo = await getPoolInfo(wallet,tokenIn, tokenOut)

  const pool = new Pool(
    tokenIn,
    tokenOut,
    CurrentConfig.tokens.poolFee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )

  const swapRoute = new Route(
    [pool],
    tokenIn,
    tokenOut
  )

  const amountOut = await getOutputQuote(wallet,swapRoute, tokenIn, tokenOut, amount)

  const uncheckedTrade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amount,
        tokenIn.decimals
      ).toString()
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      tokenOut,
      JSBI.BigInt(amountOut)
    ),
    tradeType: TradeType.EXACT_INPUT,
  })

  return uncheckedTrade
}

export async function executeTrade(
  wallet: ethers.Wallet,
  trade: TokenTrade,
  walletTo: string,
  walletFrom: string,
  tokenIn: Token
): Promise<TransactionState> {
  // const walletAddress = walletFrom
  // const provider = getProvider()

  const provider = wallet.provider

  if (!walletFrom || !provider) {
    throw new Error('Cannot execute a trade without a connected wallet')
  }

  // Give approval to the router to spend the token
  const tokenApproval = await getTokenTransferApproval(wallet,tokenIn, walletFrom) // working fine
  console.log("Token approval, ", tokenApproval);

  // Fail if transfer approvals do not go through
  if (tokenApproval !== TransactionState.Sent) {
    return TransactionState.Failed
  }

  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletFrom,
  }

  const methodParameters = SwapRouter.swapCallParameters([trade], options)
  // console.log("Method param: ", methodParameters);

  const tx = {
    data: methodParameters.calldata,
    to: walletTo,
    value: methodParameters.value,
    from: walletFrom,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  console.log("TX: ", tx);

  const res = await sendTransaction(wallet,tx) // issue here

  console.log("Res of transaction is: ", res);

  return res
}

// Helper Quoting and Pool Functions

async function getOutputQuote(wallet:ethers.Wallet,route: Route<Currency, Currency>, tokenIn: Token, tokenOut: Token, amount: number) {
  const provider = wallet.provider

  if (!provider) {
    throw new Error('Provider required to get pool state')
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(
        amount,
        tokenIn.decimals
      ).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  )

  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  })

  return ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
}

export async function getTokenTransferApproval(
  wallet:ethers.Wallet,
  token: Token,
  walletAddress: string
): Promise<TransactionState> {
  const provider = wallet.provider
  const address = walletAddress
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }

  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.approve(
      SWAP_ROUTER_ADDRESS,
      fromReadableAmount(
        TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
        token.decimals
      ).toString()
    )

    return sendTransaction(wallet,{
      ...transaction,
      from: address,
    })
  } catch (e) {
    console.error(e)
    return TransactionState.Failed
  }
}