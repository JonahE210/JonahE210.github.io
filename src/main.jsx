import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './styles/tokens.css'
import './styles/reset.css'
import './styles/global.css'

import App from './App.jsx'
import Home from './pages/Home.jsx'
import Work from './pages/Work.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Life from './pages/Life.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * A data router rather than <BrowserRouter>. The View Transitions
 * integration — `<Link viewTransition>` and useViewTransitionState, which is
 * what lets a project card morph into its own page — is only wired up on this
 * router. Routes move here from App, and App becomes the shell around
 * <Outlet>.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'work', element: <Work /> },
      { path: 'work/:slug', element: <ProjectDetail /> },
      { path: 'life', element: <Life /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
