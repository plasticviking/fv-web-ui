import React from 'react';

import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from '../state/store';
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const PageStructure = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <main>
          <div>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="" component={LandingPage} />
              <Route path="*" component={NotFound} />
            </Switch>
          </div>
        </main>
      </BrowserRouter>
    </Provider>
  )
};

export default PageStructure;
