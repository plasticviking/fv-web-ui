package ca.firstvoices.simpleapi.security;

import com.sun.jersey.api.model.AbstractMethod;
import com.sun.jersey.spi.container.ContainerRequestFilter;
import com.sun.jersey.spi.container.ContainerResponseFilter;
import com.sun.jersey.spi.container.ResourceFilter;
import com.sun.jersey.spi.container.ResourceFilterFactory;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;

public class JWTFilterFactory implements ResourceFilterFactory {
  private static final Logger log = Logger.getLogger(JWTFilterFactory.class.getCanonicalName());

  @Override
  public List<ResourceFilter> create(AbstractMethod abstractMethod) {
    List<ResourceFilter> filters = new LinkedList<>();
    Set<String> requiredScopes = new HashSet<>();

    Optional<JWTAuth> resourceAnnotation = Optional.ofNullable(
        abstractMethod.getResource().getAnnotation(JWTAuth.class)
    );
    Optional<JWTAuth> methodAnnotation = Optional.ofNullable(
        abstractMethod.getAnnotation(JWTAuth.class)
    );

    resourceAnnotation.ifPresent(a -> {
      log.info(String.format("type-level annotation present for %s, scopes [%s]",
          abstractMethod.getMethod().getName(),
          String.join(", ", a.requiredScopes())
      ));
      requiredScopes.addAll(Arrays.asList(a.requiredScopes()));
    });
    methodAnnotation.ifPresent(a -> {
      log.info(String.format("method-level annotation present for %s, scopes [%s]",
          abstractMethod.getMethod().getName(),
          String.join(", ", a.requiredScopes())
      ));
      requiredScopes.addAll(Arrays.asList(a.requiredScopes()));
    });

    if (resourceAnnotation.isPresent() || methodAnnotation.isPresent()) {
      filters.add(new ResourceFilter() {
        @Override
        public ContainerRequestFilter getRequestFilter() {
          return new JWTFilter(requiredScopes.toArray(new String[0]));
        }

        @Override
        public ContainerResponseFilter getResponseFilter() {
          return null;
        }
      });
    }
    return filters;
  }
}
