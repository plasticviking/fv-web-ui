package ca.firstvoices.simpleapi.security;

import ca.firstvoices.simpleapi.exceptions.UnauthorizedAccessException;
import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerRequestFilter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SigningKeyResolver;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import javax.ws.rs.core.HttpHeaders;
import org.nuxeo.runtime.api.Framework;


public class JWTFilter implements ContainerRequestFilter {

  private static final Logger log = Logger.getLogger(JWTFilter.class.getCanonicalName());

  private final UserContextStore userContextStore;

  private final Set<String> requiredScopes = new HashSet<>();

  private final SigningKeyResolver keyResolver;

  public JWTFilter(String... requiredScopes) {

    this.userContextStore = Framework.getService(UserContextStore.class);
    this.keyResolver = Framework.getService(SigningKeyResolver.class);
    this.requiredScopes.addAll(Arrays.asList(requiredScopes));
  }

  @Override
  public ContainerRequest filter(ContainerRequest containerRequest) {

    log.fine("Key resolver implementation class: " + this.keyResolver.getClass().getName());

    log.fine("request should have all of these scopes: "
        + String.join(", ", this.requiredScopes));

    try {

      String auth = containerRequest.getHeaderValue(HttpHeaders.AUTHORIZATION);
      String token = auth.substring("Bearer".length()).trim();

      final JwtParser parser = Jwts.parserBuilder()
          .setSigningKeyResolver(this.keyResolver)
          .build();

      // will throw exceptions if signature verify failed
      Jws<Claims> jws = parser.parseClaimsJws(token);

      // check the scopes, if present
      log.info(jws.getBody().toString());
      Optional<String> scope = Optional.ofNullable(jws.getBody().get("scope", String.class));
      List<String> jwtScopes = scope
          .map(s -> Arrays.asList(s.split("\\s+"))).orElse(new LinkedList<String>());

      if (!jwtScopes.containsAll(requiredScopes)) {
        log.warning("JWT does not contain all required scopes for this call");
        throw new UnauthorizedAccessException();
      } else {
        log.fine("Request authorized");

        /*for now, we only use client tokens.
         Personal tokens could have an identifiable subject loaded from Nuxeo*/
        this.userContextStore.setCurrentUser(null);
      }

    } catch (Exception e) {
      log.warning("token decode failed. access denied.\n" + e);
      throw new UnauthorizedAccessException();
    }

    return containerRequest;
  }

}
