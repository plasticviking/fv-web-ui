import {
  GET_TOKEN_REQUEST,
  GET_TOKEN_COMPLETE,
  GET_TOKEN_ERROR,
  GET_TOKEN_NOT_LOGGED_IN,
  GET_TOKEN_STARTED,
  GET_TOKEN_REQUEST_REFRESH
} from "../actions";


class TokenState {

  constructor() {
    this.loading = false;
    this.error = false;
    this.success = false;
    this.expiresAt = -1;
    this.token = null;

  }

  loading: boolean;
  error: boolean;
  success: boolean;
  token: string;
  expiresAt: number;
}

const initialState = new TokenState();

const Token = (state = initialState, action) => {
  switch (action.type) {

    case GET_TOKEN_REQUEST: {
      return {
        ...state,
        loading: false,
        error: false,
        success: false
      }
    }
    case GET_TOKEN_STARTED: {
      return {
        ...state,
        loading: true,
        error: false,
        success: false
      }
    }
    case GET_TOKEN_COMPLETE: {
      return {
        ...state,
        loading: false,
        success: true,
        error: false,
        token: action.payload.token
      }
    }
    case GET_TOKEN_ERROR: {
      return {
        ...state,
        loading: false,
        success: false,
        error: true
      }
    }
    case   GET_TOKEN_NOT_LOGGED_IN: {
      return {
        ...state,
        loading: false,
        success: false,
        error: true
      }
    }

    default:
      return state;
  }
};

export {Token};
