import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './views/App'
import { AppContainer } from 'react-hot-loader' // eslint-disable-line

const root = document.getElementById('root');

const render = (Component) => {
  // 在开发环境下使用 render 而不使用服务端渲染的方法 hydrate
  const renderMethod = !!module.hot ? ReactDOM.render : ReactDOM.hydrate
  renderMethod(
    <AppContainer>
      <BrowserRouter>
        <Component />
      </BrowserRouter>
    </AppContainer>,
    root,
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./views/App', () => {
    const NextApp = require('./views/App').default   // eslint-disable-line
    render(NextApp)
  })
}
