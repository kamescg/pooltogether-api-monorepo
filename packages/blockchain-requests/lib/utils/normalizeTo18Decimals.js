import { ethers } from 'ethers'

const DEFAULT_TOKEN_DECIMAL_PRECISION = 18

export function normalizeTo18Decimals(bn, decimals) {
  if (!decimals) {
    decimals = DEFAULT_TOKEN_DECIMAL_PRECISION
    console.warn(
      'WARN: normalizeTo18Decimals: Number of decimals to adjust by needs to be passed in'
    )
    // console.warn('normalizeTo18Decimals: Number of decimals to adjust by needs to be passed in')
  }

  if (typeof bn === 'string') {
    bn = ethers.BigNumber.from(bn)
  }

  if (!bn) {
    throw new Error('normalizeTo18Decimals: BigNumber or string needs to be passed in')
  }

  if (decimals === DEFAULT_TOKEN_DECIMAL_PRECISION) {
    return bn
  }

  if (decimals > DEFAULT_TOKEN_DECIMAL_PRECISION) {
    throw new Error(
      "normalizeTo18Decimals currently doesn't support decimals higher than:",
      DEFAULT_TOKEN_DECIMAL_PRECISION
    )
  }

  const numZeroes = DEFAULT_TOKEN_DECIMAL_PRECISION - decimals
  const normalizedBN = !bn.eq(0)
    ? bn.mul(ethers.BigNumber.from(Math.pow(10, numZeroes)))
    : ethers.BigNumber.from(0)

  return normalizedBN
}
