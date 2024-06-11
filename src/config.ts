import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

import { USDC_TOKEN, WETH_TOKEN } from './libs/constants'

// Sets if the example should run locally or on chain
export enum Environment {
    LOCAL,
    MAINNET,
    WALLET_EXTENSION,
}

// Inputs that configure this example to run
export interface ExampleConfig {
    env: Environment
    rpc: {
        local: string
        // mainnet: string
        // testnet:string
    }
    wallet: {
        // address: string
        // privateKey: string
    }
    tokens: {
        in: Token
        amountIn: number
        out: Token
        poolFee: number
    }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
    env: Environment.LOCAL,
    rpc: {
        local: 'http://localhost:8545',
        // mainnet: 'https://mainnet.infura.io/v3/9130d8a3ddeb46578a52fe60ddaeddb4',
        // testnet:'https://sepolia.infura.io/v3/9130d8a3ddeb46578a52fe60ddaeddb4'
    },
    wallet: {
        // address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        // privateKey:'0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        // address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
        // privateKey:'0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',

        // Talha's testnet wallet
        // address: '0x98110fa534c7e3d4339ff7bd0b1c58416afc4465',
        // privateKey: "93d9aaeeea0051b5c77cb77ba3e7b56b0776a931ff3c1005575429160ee0d1e6",

        // address: '0xe7e9ae45739c3b145f1dd6a6a4fc1a7bf7004e6c',
        // privateKey: "5bd9b08c1e3826fbc80f3dcde0abfcc9037eaca7915e01c0b23efdfde59d188a"
    },
    tokens: {
        in: WETH_TOKEN,
        amountIn: 1,
        out: USDC_TOKEN,
        poolFee: FeeAmount.MEDIUM,
    },
}
