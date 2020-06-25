package firstvoices.aws;

import com.auth0.jwk.JwkProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.SigningKeyResolver;
import java.security.Key;

public class JWKSKeyResolver implements SigningKeyResolver {

  private JwkProvider keyStore;

  public JWKSKeyResolver(JwkProvider keyStore) {
    this.keyStore = keyStore;
  }

  @Override
  public Key resolveSigningKey(JwsHeader jwsHeader, Claims claims) {
    String kid = jwsHeader.getKeyId();
    try {
      return keyStore.get(kid).getPublicKey();
    } catch (Exception e) {
      System.err.println(e.toString());
      return null;
    }
  }

  @Override
  public Key resolveSigningKey(JwsHeader jwsHeader, String claims) {
    String kid = jwsHeader.getKeyId();
    try {
      return keyStore.get(kid).getPublicKey();
    } catch (Exception e) {
      System.err.println(e.toString());
      return null;
    }
  }
}
