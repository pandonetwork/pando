import '@babel/polyfill'

import Aragon from '@aragon/client'

const app = new Aragon()

const initialState = {
  count: 0
}
app.store(async (state, event) => {
  if (state === null) state = initialState

  switch (event.event) {
    case 'Increment':
      return { count: await getValue() }
    case 'Decrement':
      return { count: await getValue() }
    default:
      return state
  }
})

function getValue() {
  // Get current value from the contract by calling the public getter
  return new Promise(resolve => {
    app
      .call('value')
      .first()
      .map(value => parseInt(value, 10))
      .subscribe(resolve)
  })
}
