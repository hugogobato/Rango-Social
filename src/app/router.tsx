import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import App from '../App'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'ranking',
        element: (
          <div className="py-10 text-center text-muted-foreground">
            Em construção... 🏆
          </div>
        ),
      },
      {
        path: 'review',
        element: (
          <div className="py-10 text-center text-muted-foreground">
            Em construção... ➕
          </div>
        ),
      },
      {
        path: 'notifications',
        element: (
          <div className="py-10 text-center text-muted-foreground">
            Em construção... 🔔
          </div>
        ),
      },
      {
        path: 'profile',
        element: (
          <div className="py-10 text-center text-muted-foreground">
            Em construção... 👤
          </div>
        ),
      },
      {
        path: 'ai',
        element: (
          <div className="py-10 text-center text-muted-foreground">
            Em construção... 🤖
          </div>
        ),
      },
    ],
  },
])
