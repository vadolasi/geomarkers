import { render } from "preact"
import { Suspense } from "preact/compat"
import {
  BrowserRouter as Router,
  useRoutes,
} from "react-router-dom"

import "uno.css"
import "@unocss/reset/tailwind.css"
import routes from "~react-pages"

const App = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      {useRoutes(routes)}
    </Suspense>
  )
}

render(
  <Router>
    <App />
  </Router>,
  document.getElementById("app")!
)
