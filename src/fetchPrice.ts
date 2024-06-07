import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import {ethers} from 'ethers'

const provider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/9130d8a3ddeb46578a52fe60ddaeddb4'
)

export const fetchPrice = async (addressFrom: string, addressTo: string, humanValue: string) => {
    const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
    const quoterContract = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,
        Quoter.abi,
        provider
    )
    // console.log(quoterContract);
    const amountIn = ethers.utils.parseUnits(humanValue,18)
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
        addressFrom,
        addressTo,
        3000,
        amountIn.toString(),
        0
    )
    const amount = ethers.utils.formatUnits(quotedAmountOut.toString(), 18)
    return amount
}


export const main = async() => {
    const addressFrom = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' //WETH 
    const addressTo = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
    const humanValue = '1'
    const result = await fetchPrice(addressFrom, addressTo, humanValue)
    console.log("Result is: ", result);
    return result
}
main()