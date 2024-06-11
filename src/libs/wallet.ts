// This file contains code to easily connect to and get information from a wallet on chain

import { Currency, Percent, Token } from '@uniswap/sdk-core'
import { BigNumber, ethers } from 'ethers'
import { providers } from 'ethers'
import { ERC20_ABI, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, USDC_ABI, WETH_ABI, WETH_CONTRACT_ADDRESS } from './constants'
import { toReadableAmount } from './utils'
import JSBI from 'jsbi'
import { sendTransaction } from './providers'

export async function getCurrencyBalance(
  provider: providers.Provider,
  address: string,
  isNative: boolean,
  currencyAddress: Currency
): Promise<string> {
  // Handle ETH directly
  if (currencyAddress.isNative) {
    console.log("ETH provided");
    return ethers.utils.formatEther(await provider.getBalance(address))
  }

  // Get currency otherwise
  const ERC20Contract = new ethers.Contract(
    currencyAddress.address,
    ERC20_ABI,
    provider
  )
  const balance: number = await ERC20Contract.balanceOf(address)
  const decimals: number = await ERC20Contract.decimals()
  // console.log(balance);
  // Format with proper units (approximate)
  console.log("Balance is: ",balance);
  
  return toReadableAmount(balance, decimals)
}

// unwraps ETH (rounding up to the nearest ETH for decimal places)
export async function unwrapETH(eth: number,wallet:ethers.Wallet,token:Token) {
  const provider = wallet.provider
  const address = wallet.address
  if (!provider || !address) {
    throw new Error('Cannot unwrap ETH without a provider and wallet address')
  }

  const wethContract = new ethers.Contract(
    WETH_CONTRACT_ADDRESS,
    WETH_ABI,
    provider
  )
 
  const transaction = {
    data: wethContract.interface.encodeFunctionData('withdraw', [
      BigNumber.from(Math.ceil(eth))
        .mul(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)).toString())
        .toString(),
    ]),
    from: address,
    to: WETH_CONTRACT_ADDRESS,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  const res = await sendTransaction(wallet, transaction)
  return res
}

// wraps ETH (rounding up to the nearest ETH for decimal places)
export async function wrapETH(eth: number, wallet: ethers.Wallet) {
  console.log("Amount: ",eth);
  
  const provider = wallet.provider
  const address = wallet.address
  if (!provider || !address) {
    throw new Error('Cannot wrap ETH without a provider and wallet address')
  }

  const wethContract = new ethers.Contract(
    WETH_CONTRACT_ADDRESS,
    WETH_ABI,
    provider
  )
    // BigNumber.from(Math.ceil(eth))
    // .mul(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18)).toString())
  // .toString()
  
  const amountToUnwrap = ethers.utils.parseEther(eth.toString());
  const transaction = {
    data: wethContract.interface.encodeFunctionData('deposit'),
    value: amountToUnwrap,
    from: address,
    to: WETH_CONTRACT_ADDRESS,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  const res = await sendTransaction(wallet, transaction)
  return res
}
