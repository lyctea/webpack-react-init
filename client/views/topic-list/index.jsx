import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import Helmet from 'react-helmet'
import PropTypes from 'prop-types'
import AppState from '../../store/app-state'

@inject('appState')
@observer
class TopicList extends React.Component {
  componentDidMount() {
    // do something
  }

  changeName = (event) => {
    const { appState } = this.props
    appState.changeName(event.target.value)
  }

  asyncBootstrap() {
    const { appState } = this.props
    return new Promise((resolve) => {
      setTimeout(() => {
        appState.count = 3
        resolve(true)
      }, 1000)
    })
  }

  render() {
    const { appState } = this.props
    return (
      <div>
        <Helmet>
          <title>This is topic list</title>
          <meta name="description" content="This is description" />
        </Helmet>
        <input type="text" onChange={this.changeName} />
        <span>{appState.msg}</span>
      </div>
    )
  }
}


TopicList.propTypes = {
  appState: PropTypes.instanceOf(AppState),
}

export default TopicList
