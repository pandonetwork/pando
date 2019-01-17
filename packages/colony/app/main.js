import '@babel/polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import Aragon, { providers } from '@aragon/client'
import App from './App'

class ConnectedApp extends React.Component {
  state = {
    app: new Aragon(new providers.WindowMessage(window.parent)),
    observable: null,
    account: '',
    organisms: [],
  }

  componentDidMount() {
    window.addEventListener('message', this.handleWrapperMessage)

    if (module.hot) {
      module.hot.dispose(() => {
        window.location.reload()
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleWrapperMessage)
  }

  handleWrapperMessage = ({ data }) => {
    if (data.from !== 'wrapper') {
      return
    }
    if (data.name === 'ready') {
      const { app } = this.state
      this.sendMessageToWrapper('ready', true)
      this.setState({
        observable: app.state(),
      })
      app.accounts().subscribe(accounts => {
        this.setState({
          account: accounts[0],
        })
      })

      app.state().subscribe(state => {
        console.log('State from main.js')
        console.log(state)
        this.setState(state)
      })
    }
  }

  sendMessageToWrapper = (name, value) => {
    window.parent.postMessage({ from: 'app', name, value }, '*')
  }

  render() {
    return <App {...this.state} />
  }
}

ReactDOM.render(<ConnectedApp />, document.getElementById('root'))
