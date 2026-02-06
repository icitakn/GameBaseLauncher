import { useRoutes } from 'react-router-dom'
import { AddGamebase } from './screens/add-gamebase'
import { Gamebase } from './screens/gamebase'
import Games from './screens/games'
import { EditGamebase } from './screens/edit-gamebase'
import Settings from './screens/settings'
import { Artists } from './screens/artists'
import { Musicians } from './screens/musicians'
import { Programmers } from './screens/programmers'
import { Publishers } from './screens/publishers'
import { Musics } from './screens/musics'
import { Developers } from './screens/developers'
import { Crackers } from './screens/crackers'
import Dashboard from './screens/dashboard'
import { ReactNode } from 'react'
import Layout from './layout'

export default function Router(): ReactNode {
  const routes = useRoutes([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          element: <Dashboard />
        },
        {
          path: '/gamebase/add',
          element: <AddGamebase />
        },
        {
          path: '/gamebase/:gamebaseId',
          element: <Gamebase />
        },
        {
          path: '/gamebase/:gamebaseId/edit',
          element: <EditGamebase />
        },
        {
          path: '/gamebase/:gamebaseId/games',
          element: <Games />
        },
        {
          path: '/gamebase/:gamebaseId/artists',
          element: <Artists />
        },
        {
          path: '/gamebase/:gamebaseId/musics',
          element: <Musics />
        },
        {
          path: '/gamebase/:gamebaseId/musicians',
          element: <Musicians />
        },
        {
          path: '/gamebase/:gamebaseId/publishers',
          element: <Publishers />
        },
        {
          path: '/gamebase/:gamebaseId/developers',
          element: <Developers />
        },
        {
          path: '/gamebase/:gamebaseId/programmers',
          element: <Programmers />
        },
        {
          path: '/gamebase/:gamebaseId/crackers',
          element: <Crackers />
        },
        {
          path: '/settings',
          element: <Settings />
        }
      ]
    }
  ])

  return routes
}
