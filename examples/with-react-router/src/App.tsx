import * as React from 'react'
import { useRoutes } from 'react-router'
import { Layout } from './Layout'
import { HomePage } from './routes/Home'
import { ProjectsPage } from './routes/Projects'
import { NotFoundPage } from './routes/NotFound'
import { ProjectPage } from './routes/Project'

function App() {
  const element = useRoutes([
    // These are the same as the props you provide to <Route>
    { path: '/', element: <HomePage /> },
    {
      path: 'projects', children: [
        { path: '/', element: <ProjectsPage /> },
        { path: ':id', element: <ProjectPage /> },
      ]
    },
    { path: '*', element: <NotFoundPage /> },
  ])
  return <Layout>{element}</Layout>
}

export default App
