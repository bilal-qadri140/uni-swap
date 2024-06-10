// import { Token } from 'your-token-library'; // Adjust as needed
import { SupportedChainId, Token } from '@uniswap/sdk-core'; // Adjust as needed

// Define the tokens
export const tokens = {
    AUD: new Token(
        SupportedChainId.SEPOLIA,
        '0xD7e0F80FB28233bdde0006c50568606A8feb964C',
        6,
        'AUD',
        'Australian Dollar'
    ),
    CAD: new Token(
        SupportedChainId.SEPOLIA,
        '0x912529007Bc0d2a5464A6a211EBfE217DfB75DfF',
        18,
        'CAD',
        'Canadian Dollar'
    ),
    USDC: new Token(
        SupportedChainId.SEPOLIA,
        // '0xDa317C1d3E835dD5F1BE459006471aCAA1289068',
        '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        6,
        'USDC',
        'USDC'
    ),
    CNHT: new Token(
        SupportedChainId.SEPOLIA,
        '0x6E109E9dD7Fa1a58BC3eff667e8e41fC3cc07AEF',
        6,
        'CNHT',
        'Chinese Yuan'
    ),
    EURO: new Token(
        SupportedChainId.SEPOLIA,
        '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
        // '0x76a1b9E4712E45C4c3D0ac6e2c3028ee0ce4d3b0',
        6,
        'EURC',
        'EURC'
    ),
    // USD_TESTNET: new Token(
    //     SupportedChainId.SEPOLIA_TESTNET,
    //     '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    //     6,
    //     'USD',
    //     'USD'
    // ),
    // EURO_TESTNET: new Token(
    //     SupportedChainId.SEPOLIA_TESTNET,
    //     '0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4',
    //     6,
    //     'EURO',
    //     'EURO'
    // ),
    NZD: new Token(
        SupportedChainId.SEPOLIA,
        '0x2dD087589ce9C5b2D1b42e20d2519B3c8cF022b7',
        6,
        'NZD',
        'New Zealand Digital Dollar'
    ),
};

export default tokens;
