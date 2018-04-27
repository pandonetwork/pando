const Pando0x = require ('../dist/main.js')

let opts = {
  user: {
    account: '0x2d6ef21eb58f164841b41a7b749d0d957790620a'
  },
  ethereum: {
    gateway: 'http://localhost:8545'
  }
}

let opts2 = {
  user: {
    account: '0x5465464564'
  },
  ethereum: {
    gateway: 'http://localhost:8544'
  }
}

const main = async () => {
  
  let pando0x = new Pando0x(opts)
  
  // await pando0x.dao.create()
  
  
  console.log('avant le create')
  
  let repo = await pando0x.repository.load('.')
  // await repo.initialize()
  
  console.log('avant le commit')
  
  
await repo.updateIndex()
  // await repo.add(['./mocks/test.md'])
  // await repo.add(['./mocks/test2.md'])
  
  // let cid = await repo.commit('toto')
  // 
  // console.log('arpès le commit')
  // 
  // console.log(cid)
  
}

main()

