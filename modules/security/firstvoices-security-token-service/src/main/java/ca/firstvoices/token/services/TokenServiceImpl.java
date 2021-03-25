package ca.firstvoices.token.services;

import ca.firstvoices.token.representations.Token;
import java.util.logging.Logger;

public class TokenServiceImpl implements TokenService {

  private static final Logger log = Logger.getLogger(TokenServiceImpl.class.getCanonicalName());

  public TokenServiceImpl() {
    log.info("token service available");
  }

  @Override
  public Token getToken() {
    log.info("token service called");

    Token t = new Token("test token");
    return t;
  }
}
