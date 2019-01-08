import '@babel/polyfill'

import Aragon from '@aragon/client'

const app = new Aragon()

app.store(async (state, event) => {
    if (state === null) {
      state = { organisms: await getOrganisms() }
    }

    console.log('State from script')
    console.log(state)

    switch (event.event) {
      // case 'Buy':
      //   return { ...state, transactions: [{ type: 'buy', to: event.returnValues.to, tokens: event.returnValues.amount, eth: event.returnValues.value }, ...state.transactions], pool: await getPool(), supply: await getSupply() }
      // case 'Sell':
      //   return { ...state, transactions: [{ type: 'sell', from: event.returnValues.from, tokens: event.returnValues.amount, eth: event.returnValues.value }, ...state.transactions], pool: await getPool(), supply: await getSupply() }
      // case 'Withdraw':
      //   return { ...state, withdrawals: [{ value: event.returnValues.value }, ...state.withdrawals], pool: await getPool(), supply: await getSupply() }
      // case 'UpdateTap':
      //   return { ...state, tap: await getTap() }
      default:
        return state
    }
  })

function getOrganisms() {
  return new Promise(resolve => {
    app
      .call('getOrganisms')
      .subscribe(resolve)
  })
}
