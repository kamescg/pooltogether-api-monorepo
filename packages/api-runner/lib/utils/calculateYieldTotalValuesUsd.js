import cloneDeep from 'lodash.clonedeep'
import {
  calculateEstimatedCompoundPrizeWithYieldUnformatted,
  calculatedEstimatedAccruedCompTotalValueUsdScaled,
  toScaledUsdBigNumber,
  amountMultByUsd,
  toNonScaledUsdString
} from '@pooltogether/utilities'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { YIELD_SOURCES } from 'lib/fetchers/getCustomYieldSourceData'
import { ethers } from 'ethers'
import { PRIZE_POOL_TYPES, SECONDS_PER_YEAR } from '@pooltogether/current-pool-data'
import { contract } from '@pooltogether/etherplex'
import { CUSTOM_CONTRACT_ADDRESSES } from 'lib/constants'
import { CompoundComptrollerImplementationAbi } from 'abis/CompoundComptrollerImplementation'

/**
 * Calculates the total yield values, $0 if no yield or no token prices
 * @param {*} _pool
 * @returns
 */
export const calculateYieldTotalValuesUsd = async (_pool, fetch) => {
  switch (_pool.prizePool.type) {
    case PRIZE_POOL_TYPES.compound: {
      return await calculateCompoundYieldTotalValues(_pool, fetch)
    }
    case PRIZE_POOL_TYPES.genericYield: {
      switch (_pool.prizePool.yieldSource?.type) {
        // case YIELD_SOURCES.aave: {
        //   return await calculateGenericYieldTotalValues(_pool, fetch)
        // }
        case YIELD_SOURCES.sushi: {
          return await calculateGenericYieldTotalValues(_pool, fetch)
        }
        default: {
          return calculateClaimableYieldPrizeTotalValues(_pool)
        }
      }
    }
    case PRIZE_POOL_TYPES.stake:
    default: {
      return calculateStakePrizeTotalValues(_pool)
    }
  }
}

const calculateCompoundYieldTotalValues = async (_pool, fetch) => {
  const pool = cloneDeep(_pool)

  const cToken = pool.tokens.cToken
  const underlyingToken = pool.tokens.underlyingToken
  let compApy = '0'
  let yieldAmountUnformatted = pool.prize.amountUnformatted
  if (cToken) {
    try {
      // Calculate value of COMP
      // console.log('getting comp')
      const cTokenData = await fetch('https://api.compound.finance/api/v2/ctoken', {
        method: 'POST',
        body: JSON.stringify({
          addresses: [cToken.address]
        })
      })
      const response = await cTokenData.json()
      // console.log('comp response', JSON.stringify(response))

      compApy = response.cToken[0]?.comp_supply_apy.value || '0'
      let totalValueUsdScaled = calculatedEstimatedAccruedCompTotalValueUsdScaled(
        compApy,
        pool.tokens.ticket.totalValueUsdScaled.add(pool.tokens.sponsorship.totalValueUsdScaled),
        pool.prize.prizePeriodRemainingSeconds
      )

      // Add in the value of any unclaimed COMP
      if (pool.prize?.yield?.[YIELD_SOURCES.comp]?.unclaimedAmountUnformatted && pool.tokens.comp) {
        const unclaimedUsdAndAmountValues = calculateUsdValues(
          pool.prize.yield[YIELD_SOURCES.comp].unclaimedAmountUnformatted,
          pool.tokens.comp
        )
        totalValueUsdScaled = totalValueUsdScaled.add(
          unclaimedUsdAndAmountValues.totalValueUsdScaled
        )
      }

      const totalValueUsd = toNonScaledUsdString(totalValueUsdScaled)

      if (!pool.prize.yield) {
        pool.prize.yield = {
          [YIELD_SOURCES.comp]: {}
        }
      }

      pool.prize.yield = {
        ...pool.prize.yield,
        [YIELD_SOURCES.comp]: {
          ...pool.prize.yield[YIELD_SOURCES.comp],
          totalValueUsd,
          totalValueUsdScaled
        }
      }

      // Calculate yield
      yieldAmountUnformatted = calculateEstimatedCompoundPrizeWithYieldUnformatted(
        pool.prize.amountUnformatted,
        pool.tokens.ticket.totalSupplyUnformatted.add(
          pool.tokens.sponsorship.totalSupplyUnformatted
        ),
        cToken.supplyRatePerBlock,
        pool.tokens.ticket.decimals,
        pool.prize.estimatedRemainingBlocksToPrize,
        pool.reserve?.rate
      )
    } catch (e) {
      console.warn(e.message)
      return pool
    }
  }

  const usdAndAmountValues = calculateUsdValues(yieldAmountUnformatted, underlyingToken)

  pool.prize.yield = {
    ...pool.prize.yield,
    ...usdAndAmountValues
  }

  return pool
}

const calculateGenericYieldTotalValues = (_pool, fetch) => {
  const pool = cloneDeep(_pool)

  const underlyingToken = _pool.tokens.underlyingToken
  const apy = _pool.prizePool?.yieldSource?.apy

  // If there was an error fetching the apy
  if (!apy) {
    return pool
  }

  const poolDepositsTotalSupplyUnformatted = pool.tokens.ticket.totalSupplyUnformatted.add(
    pool.tokens.sponsorship.totalSupplyUnformatted
  )

  // Format to same decimal places, so we keep accuracy for floats
  const poolReserveRate = _pool.reserve?.rate
  const poolReserveRateUnformatted = ethers.utils.parseUnits(
    parseFloat(poolReserveRate).toFixed(Number(underlyingToken.decimals)),
    underlyingToken.decimals
  )
  const oneMinusPoolReserveRateUnformatted = ethers.utils
    .parseUnits('1', underlyingToken.decimals)
    .sub(poolReserveRateUnformatted)

  const remainingSeconds = _pool.prize.prizePeriodRemainingSeconds

  const decimalsUnformatted = ethers.utils.parseUnits('1', underlyingToken.decimals)
  const apyUnformatted = ethers.utils.parseUnits(
    parseFloat(apy).toFixed(Number(underlyingToken.decimals)),
    underlyingToken.decimals
  )
  const underlyingTokensPerYearUnformatted = poolDepositsTotalSupplyUnformatted
    .mul(apyUnformatted)
    .div(decimalsUnformatted)
  const underlyingTokensPerSecondNormalized = underlyingTokensPerYearUnformatted
    .mul(parseUnits('1', 18)) // Normalize
    .div(SECONDS_PER_YEAR)

  let amountUnformatted
  if (poolReserveRateUnformatted.isZero()) {
    amountUnformatted = underlyingTokensPerSecondNormalized
      .mul(remainingSeconds)
      .div(parseUnits('1', 18)) // Denormalize
  } else if (poolReserveRateUnformatted.eq(ethers.constants.One)) {
    amountUnformatted = ethers.constants.Zero
  } else {
    amountUnformatted = underlyingTokensPerSecondNormalized
      .mul(remainingSeconds)
      .mul(oneMinusPoolReserveRateUnformatted)
      .div(decimalsUnformatted)
      .div(parseUnits('1', 18)) // Denormalize
  }

  const estimatedUsdAndAmountValues = calculateUsdValues(amountUnformatted, underlyingToken)

  const usdAndAmountValues = calculateUsdValues(
    amountUnformatted.add(_pool.prize.amountUnformatted),
    underlyingToken
  )

  pool.prize.yield = {
    ...pool.prize.yield,
    ...usdAndAmountValues,
    estimatedPrize: {
      ...estimatedUsdAndAmountValues
    }
  }
  return pool
}

// const calculateAaveYieldExtendedValues = (_pool, fetch) => {
// const pool = cloneDeep(_pool)

// TODO: Use for additional tokens aave drips
// const aaveAdditionalApy = _pool.prizePool.yieldSource.aave.additionalApy

// TODO: Use for additional tokens aave drips
// const aaveTotalValueUsd = null
// const aaveTotalValueUsdScaled = null

// pool.prize.yield = {
// ...pool.prize.yield,
// TODO: Use for additional tokens aave drips
// [YIELD_SOURCES.aave]: {
//   totalValueUsd: aaveTotalValueUsd,
//   totalValueUsdScaled: aaveTotalValueUsdScaled
// }
// }
//   return pool
// }

const calculateStakePrizeTotalValues = (_pool) => {
  const pool = cloneDeep(_pool)

  const usdAndAmountValues = calculateUsdValues(
    _pool.prize.amountUnformatted,
    _pool.tokens.underlyingToken
  )

  pool.prize.stake = {
    ...usdAndAmountValues
  }

  return pool
}

const calculateClaimableYieldPrizeTotalValues = (_pool) => {
  const pool = cloneDeep(_pool)

  const usdAndAmountValues = calculateUsdValues(
    _pool.prize.amountUnformatted,
    _pool.tokens.underlyingToken
  )

  pool.prize.yield = {
    ...usdAndAmountValues
  }

  return pool
}

const calculateUsdValues = (amountUnformatted, underlyingToken) => {
  const amount = formatUnits(amountUnformatted, underlyingToken.decimals)

  const totalUsdValueUnformatted = amountMultByUsd(amountUnformatted, underlyingToken.usd)
  const totalValueUsd = formatUnits(totalUsdValueUnformatted, underlyingToken.decimals)
  const totalValueUsdScaled = toScaledUsdBigNumber(totalValueUsd)
  return {
    amountUnformatted,
    amount,
    totalValueUsd,
    totalValueUsdScaled
  }
}
