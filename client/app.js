import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line

const root = document.getElementById('root');

const render = (Component) => {
  // 在开发环境下使用 render 而不使用服务端渲染的方法 hydrate
  const renderMethod = !!module.hot ? ReactDOM.render : ReactDOM.hydrate
  renderMethod(
    <AppContainer>
      <Component />
    </AppContainer>,
    root,
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    const NextApp = require('./App.jsx').default   // eslint-disable-line
    render(NextApp)
  })
}
