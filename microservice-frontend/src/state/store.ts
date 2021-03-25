import {applyMiddleware, compose, createStore} from "redux";
import createSagaMiddleware from 'redux-saga';

import tokenSaga from "./sagas/token";

import logger from 'redux-logger';
import {rootReducer} from "./reducers";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer,
  compose(applyMiddleware(sagaMiddleware, logger))
);

// run the sagas
sagaMiddleware.run(tokenSaga);

export default store;
