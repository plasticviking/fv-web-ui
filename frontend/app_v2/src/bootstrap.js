import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Switch } from 'react-router-dom'
import AppV1Provider from 'app_v1/FVProvider'
import 'tailwindcss/tailwind.css'
import { BrowserRouter as Router } from 'react-router-dom'
import AppFrameContainer from './components/AppFrame/AppFrameContainer'
import { QueryClient, QueryClientProvider } from 'react-query'
import AppStateProvider from 'common/AppStateProvider'
import ScrollToTop from 'common/ScrollToTop'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, { message: status }) => {
        if (status !== '404' && status !== '401') {
          return false
        }
        return failureCount > 2
      },
    },
  },
})

ReactDOM.render(
  <AppV1Provider>
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Switch>
          <Route path="/:sitename">
            <AppStateProvider>
              <AppFrameContainer />
            </AppStateProvider>
          </Route>

          <div className="grid h-screen">
            <h1 className="place-self-center font-bold text-3xl">Missing site name in url</h1>
          </div>
        </Switch>
      </Router>
    </QueryClientProvider>
  </AppV1Provider>,
  document.getElementById('root')
)
