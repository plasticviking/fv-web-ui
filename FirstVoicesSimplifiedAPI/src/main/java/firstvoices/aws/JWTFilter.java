package firstvoices.aws;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import firstvoices.api.FirstVoicesModule;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
@JWTAuth
@Priority(Priorities.AUTHENTICATION)
public class JWTFilter implements ContainerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JWTFilter.class);

  @Context
  private ResourceInfo resourceInfo;

  private final UserContextStore userContextStore;
  private JWKSKeyResolver keyResolver;

  @Inject
  public JWTFilter(UserContextStore userContextStore,
                   @FirstVoicesModule.JWKSUrl String jwksURL) {
    this.userContextStore = userContextStore;
    JwkProvider keyStore = new JwkProviderBuilder(jwksURL).build();
    this.keyResolver = new JWKSKeyResolver(keyStore);
  }

  @Override
  public void filter(ContainerRequestContext requestContext) throws IOException {
    Method method = resourceInfo.getResourceMethod();

    Set<String> requiredScopes = new HashSet<>();

    if (method != null) {
      JWTAuth annotation = method.getAnnotation(JWTAuth.class);

      log.debug("request should have all of these scopes: " + String.join(",",
          Arrays.asList(annotation.requiredScopes())));

      requiredScopes.addAll(Arrays.asList(annotation.requiredScopes()));
    }

    try {
      String auth = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
      String token = auth.substring("Bearer".length()).trim();

      final JwtParser parser = Jwts.parserBuilder()
          .setSigningKeyResolver(this.keyResolver)
          .build();

      // will throw exceptions if signature verify failed
      Jws<Claims> jws = parser.parseClaimsJws(token);

      // check the scopes
      log.info(jws.getBody().toString());
      String scope = jws.getBody().get("scope", String.class);
      List<String> jwtScopes = Arrays.asList(scope.split("\\s+"));

      if (!jwtScopes.containsAll(requiredScopes)) {
        log.debug("JWT does not contain all required scopes for this call");
        requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
      } else {
        log.debug("Request authorized");

        // for now, we only use client tokens. Personal tokens could have an identifiable subject loaded from Nuxeo
        this.userContextStore.setCurrentUser(null);
      }

    } catch (Exception e) {
      log.error("token decode failed. access denied.", e);
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
    }

  }
}
