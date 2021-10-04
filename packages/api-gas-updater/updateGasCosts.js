import { log } from '../../utils/sentry'
import { getGasKey } from '../../utils/kvKeys'

// Confirmation time!
// `https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=2000000000&apiKey=${ETHERSCAN_API_KEY}`

/**
 * Get latest gas cost for chain and store the response in cloudflares KV
 * @param {*} event
 * @param {*} chainId The chain id to refresh gas costs for
 * @returns
 */
export const updateGasCosts = async (event, chainId) => {
  let gasCosts

  // Uses Etherscan's API
  if (chainId === 1) {
    const response = await fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apiKey=${ETHERSCAN_API_KEY}`
    )
    gasCosts = await response.json()
  }

  // Scrapes PolygonScan's gastracker html page (no API)
  if (chainId === 56) {
    gasCosts = await scrapePolygonScan()
  }

  if (!gasCosts) {
    event.waitUntil(log(new Error('No gas costs fetched during update'), event.request))
    return false
  } else {
    event.waitUntil(GAS.put(getGasKey(chainId), JSON.stringify(gasCosts)), {
      metadata: {
        lastUpdated: new Date(Date.now()).toUTCString()
      }
    })
    event.waitUntil(GAS.put(`${chainId} - Last updated`, new Date(Date.now()).toUTCString()))
  }
}

const scrapePolygonScan = async () => {
  const fetch = require('node-fetch')
  const cheerio = require('cheerio')

  let gasCosts

  const get = async () => {
    const response = await fetch(`https://polygonscan.com/gastracker`)
    const body = await response.text()

    const $ = cheerio.load(body)
    const standard = $('span#standardgas')
      .text()
      .split(' ')[0]
    const fast = $('span#fastgas')
      .text()
      .split(' ')[0]
    const rapid = $('span#rapidgas')
      .text()
      .split(' ')[0]

    const result = {
      result: {
        SafeGasPrice: standard,
        ProposeGasPrice: fast,
        FastGasPrice: rapid
      }
    }

    gasCosts = JSON.stringify(result)
    console.log(gasCosts)
  }

  get()
}
