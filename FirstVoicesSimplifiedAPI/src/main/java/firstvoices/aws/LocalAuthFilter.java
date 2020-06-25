package firstvoices.aws;

import firstvoices.api.representations.User;
import java.io.IOException;
import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
@JWTAuth
@Priority(Priorities.AUTHENTICATION)
public class LocalAuthFilter implements ContainerRequestFilter {

  // just inject a user into the context. For testing only.

  private static final Logger log = LoggerFactory.getLogger(LocalAuthFilter.class);

  @Context
  private ResourceInfo resourceInfo;

  private final UserContextStore userContextStore;

  @Inject
  public LocalAuthFilter(UserContextStore userContextStore) {
    this.userContextStore = userContextStore;
  }

  @Override
  public void filter(ContainerRequestContext requestContext) throws IOException {
    User u = new User();

    u.setDisplayName("Filter-injected user");

    userContextStore.setCurrentUser(u);
  }
}
