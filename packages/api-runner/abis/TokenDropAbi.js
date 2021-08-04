export const TokenDropAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'newTokens', type: 'uint256' }
    ],
    name: 'Claimed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'newTokens', type: 'uint256' }],
    name: 'Dropped',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'addAssetToken',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [{ internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' }
    ],
    name: 'beforeTokenTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'claim',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'drop',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'exchangeRateMantissa',
    outputs: [{ internalType: 'uint112', name: '', type: 'uint112' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IERC20Upgradeable', name: '_measure', type: 'address' },
      { internalType: 'contract IERC20Upgradeable', name: '_asset', type: 'address' }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'lastDripTimestamp',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'measure',
    outputs: [{ internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalUnclaimed',
    outputs: [{ internalType: 'uint112', name: '', type: 'uint112' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userStates',
    outputs: [
      { internalType: 'uint128', name: 'lastExchangeRateMantissa', type: 'uint128' },
      { internalType: 'uint128', name: 'balance', type: 'uint128' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
