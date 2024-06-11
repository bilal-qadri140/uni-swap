import { BaseProvider } from '@ethersproject/providers';
import { BigNumber, ethers, providers } from 'ethers';

import { CurrentConfig, Environment } from '../config';

// Single copies of provider and wallet
const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.local
);
// const wallet = createWallet();



// Interfaces

export enum TransactionState {
  Failed = 'Failed',
  New = 'New',
  Rejected = 'Rejected',
  Sending = 'Sending',
  Sent = 'Sent',
}

// Provider and Wallet Functions

export function getMainnetProvider(): BaseProvider {
  return mainnetProvider;
}

// export function getProvider(): providers.Provider | null {
//   return wallet.provider;
// }

// export function getWalletAddress(): string | null {
//   return wallet.address;
// }

export async function sendTransaction(
  wallet:ethers.Wallet,
  transaction: ethers.providers.TransactionRequest
): Promise<TransactionState> {
  try {

    // console.log("wallet is: ", wallet);
    // console.log("Transaction is: ",transaction);

    // transaction.gasLimit = 10000000
    const gasLimit = transaction.gasLimit;
    console.log("Gas Limit: ", gasLimit);
    if (transaction.value) {
      transaction.value = BigNumber.from(transaction.value);
    }

    // console.log("TRANSACTION: ", transaction);

    const txRes = await wallet.sendTransaction(transaction);
    console.log("Function called");
    console.log("Result: ", txRes);

    const provider = wallet.provider
    if (!provider) {
      return TransactionState.Failed;
    }

    let receipt = await provider.getTransactionReceipt(txRes.hash);
    // console.log("Receipt: ", receipt);

    while (receipt === null) {
      try {
        receipt = await provider.getTransactionReceipt(txRes.hash);
        if (receipt === null) {
          continue;
        }
      } catch (e) {
        console.log(`Receipt error:`, e);
        break;
      }
    }

    // Transaction was successful if status === 1
    if (receipt) {
      return TransactionState.Sent;
    } else {
      return TransactionState.Failed;
    }
  } catch (error: any) {
    console.log("Error cached: ", error);
    return TransactionState.Failed;
  }
}
