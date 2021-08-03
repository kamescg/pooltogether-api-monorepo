export const CompoundComptrollerAbi = [
  {
    constant: true,
    inputs: [],
    name: 'pendingAdmin',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'newPendingAdmin', type: 'address' }],
    name: '_setPendingAdmin',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'comptrollerImplementation',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: '_acceptImplementation',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'pendingComptrollerImplementation',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [{ name: 'newPendingImplementation', type: 'address' }],
    name: '_setPendingImplementation',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: '_acceptAdmin',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  { inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'oldPendingImplementation', type: 'address' },
      { indexed: false, name: 'newPendingImplementation', type: 'address' }
    ],
    name: 'NewPendingImplementation',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'oldImplementation', type: 'address' },
      { indexed: false, name: 'newImplementation', type: 'address' }
    ],
    name: 'NewImplementation',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'oldPendingAdmin', type: 'address' },
      { indexed: false, name: 'newPendingAdmin', type: 'address' }
    ],
    name: 'NewPendingAdmin',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'oldAdmin', type: 'address' },
      { indexed: false, name: 'newAdmin', type: 'address' }
    ],
    name: 'NewAdmin',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'error', type: 'uint256' },
      { indexed: false, name: 'info', type: 'uint256' },
      { indexed: false, name: 'detail', type: 'uint256' }
    ],
    name: 'Failure',
    type: 'event'
  }
]
