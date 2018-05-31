const opts = {
  user: {
    account: '0x2d6ef21eb58f164841b41a7b749d0d957790620a'
  },
  ethereum: {
    gateway: 'http://localhost:8545'
  }
}

const cids = {
  'test-directory/test-1.md': 'QmTC9KZuuF1tJ69ruoA2Cm9quGBZiL663Ahb4wJnUAPSRn',
  'test-directory/test-2.md': 'QmfAE9AGw3snCsmDqArUCGYGvqNpee3RKM5BcB7e3qyjgS',
  'test-directory/test-subdirectory/test.md': 'QmaRMPXt4R9mWgkVR8DvBBwxJsAMUZdNV9mvSvtPUe6Ccc',
  'test.md': 'QmbxGVmc917jMqK1EQy2SzUEA2WahwGW8ztX7NLNX59MzX'
}

export { opts, cids }