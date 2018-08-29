import React from 'react'
import {
  Route,
} from 'react-router'

import TopicList from '../views/topic-list/index'
import TopicDetail from '../views/topic-detail/index'

export default () => [
  <Route path="/" component={TopicList} exact />,
  <Route path="/detail" component={TopicDetail} />,
]
