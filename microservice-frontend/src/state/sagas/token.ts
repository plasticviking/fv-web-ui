import {all, delay, put, takeLatest} from 'redux-saga/effects'

import {GET_TOKEN_COMPLETE, GET_TOKEN_REQUEST, GET_TOKEN_REQUEST_REFRESH,} from "../actions";
import axios from "axios";
import CONFIG from "../../config";


const MIN_TOKEN_FRESHNESS = 1 * 60;
const GRACE_PERIOD = 15;

function* keepTokenFresh() {

  // yield put({type: AUTH_UPDATE_TOKEN_STATE});

  // const expiresIn = keycloakInstance.tokenParsed['exp']
  //   - Math.ceil(new Date().getTime() / 1000)
  //   + keycloakInstance.timeSkew;

  //yield delay((expiresIn - GRACE_PERIOD) * 1000);'
  yield delay(30000);
  console.dir('refreshing token');
  yield put({type: GET_TOKEN_REQUEST});
}

function* getToken() {

  const response = yield axios.get(`${CONFIG.TOKEN_URL}`);
  const jwt = response.data;
  console.dir(jwt);

  yield put({type: GET_TOKEN_COMPLETE, payload: {token: jwt}});
  yield put({type: GET_TOKEN_REQUEST_REFRESH});
}


function* tokenSaga() {
  yield put({type: GET_TOKEN_REQUEST_REFRESH});

  yield all([
    takeLatest(GET_TOKEN_REQUEST, getToken),
    takeLatest(GET_TOKEN_REQUEST_REFRESH, keepTokenFresh)
  ]);
}

export default tokenSaga;
