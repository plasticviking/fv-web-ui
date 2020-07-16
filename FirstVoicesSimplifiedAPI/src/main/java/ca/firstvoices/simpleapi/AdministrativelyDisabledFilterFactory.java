package ca.firstvoices.simpleapi;

import ca.firstvoices.simpleapi.endpoints.AuthorizationEndpoint;
import ca.firstvoices.simpleapi.exceptions.AdministrativelyDisabledException;
import ca.firstvoices.simpleapi.nuxeo.SimpleAPINuxeoConfiguration;
import com.sun.jersey.api.model.AbstractMethod;
import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerRequestFilter;
import com.sun.jersey.spi.container.ContainerResponseFilter;
import com.sun.jersey.spi.container.ResourceFilter;
import com.sun.jersey.spi.container.ResourceFilterFactory;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import org.nuxeo.runtime.api.Framework;

public class AdministrativelyDisabledFilterFactory implements ResourceFilterFactory {

  private static final Logger log = Logger.getLogger(AdministrativelyDisabledFilterFactory.class.getCanonicalName());

  private final Set<String> disabledEndpoints = new HashSet<>();

  public AdministrativelyDisabledFilterFactory() {
    SimpleAPINuxeoConfiguration config = Framework.getService(SimpleAPINuxeoConfiguration.class);
    disabledEndpoints.addAll(config.getDisabledEndpoints());
  }

  @Override
  public List<ResourceFilter> create(AbstractMethod abstractMethod) {
    List<ResourceFilter> filters = new LinkedList<>();
    filters.add(new ResourceFilter() {
      @Override
      public ContainerRequestFilter getRequestFilter() {
        return containerRequest -> {
          log.fine("request filter on method" + abstractMethod.toString());
          Optional<AdministrativelyDisabled> annotation = Optional.ofNullable(
              abstractMethod.getResource().getAnnotation(AdministrativelyDisabled.class)
          );
          annotation.ifPresent(a -> {
            log.fine("annotation present: " + a.value());
            if (disabledEndpoints.contains(a.value())) {
              throw new AdministrativelyDisabledException();
            }
          });
          return containerRequest;
        };
      }

      @Override
      public ContainerResponseFilter getResponseFilter() {
        return null;
      }
    });

    return filters;
  }
}
