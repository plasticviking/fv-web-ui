package ca.firstvoices.simpleapi;

import ca.firstvoices.simpleapi.exceptions.AdministrativelyDisabledException;
import com.sun.jersey.api.model.AbstractMethod;
import com.sun.jersey.spi.container.ContainerRequest;
import com.sun.jersey.spi.container.ContainerRequestFilter;
import com.sun.jersey.spi.container.ContainerResponseFilter;
import com.sun.jersey.spi.container.ResourceFilter;
import com.sun.jersey.spi.container.ResourceFilterFactory;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import javax.ws.rs.ext.Provider;

//import javax.ws.rs.container.ContainerRequestContext;
//import javax.ws.rs.container.ContainerRequestFilter;
//import javax.ws.rs.container.ContainerResponseContext;
//import javax.ws.rs.container.ContainerResponseFilter;
//import javax.ws.rs.container.ResourceInfo;

@Provider
public class AdministrativelyDisabledFilterFactory implements ResourceFilterFactory {
  @Override
  public List<ResourceFilter> create(AbstractMethod abstractMethod) {
    List<ResourceFilter> filters = new LinkedList<>();
    filters.add(new ResourceFilter() {
      @Override
      public ContainerRequestFilter getRequestFilter() {
        return new ContainerRequestFilter() {
          @Override
          public ContainerRequest filter(ContainerRequest containerRequest) {
            System.out.println("request filter on method" + abstractMethod.toString());
            Optional<AdministrativelyDisabled> annotation = Optional.ofNullable(abstractMethod.getResource().getAnnotation(AdministrativelyDisabled.class));
            annotation.ifPresent(a -> {
              System.out.println("annotation present: " + a.value());
              if (a.value().equals("test-disabled")) {
                throw new AdministrativelyDisabledException();
              }
            });
            return containerRequest;
          }
        };
      }

      @Override
      public ContainerResponseFilter getResponseFilter() {
        return null;
      }
    });

    return filters;
  }

  //  @Override
//  public ContainerRequest filter(ContainerRequest request) {
//    request.
//    return null;
//  }

  //  @Context
//  ResourceInfo resourceInfo;
//
//
//  @Override
//  public void filter(ContainerRequestContext requestContext) throws IOException {
//    System.out.println("request filter");
//    Optional<AdministrativelyDisabled> annotationsByType = Optional.of(resourceInfo.getResourceClass().getAnnotation(AdministrativelyDisabled.class));
//    annotationsByType.ifPresent(
//        annotation -> {
//          System.out.println("annotation present: " + annotation.value());
//          if (annotation.value().equals("test-disabled")) {
//            requestContext.abortWith(
//                Response.status(Response.Status.SERVICE_UNAVAILABLE).entity(
//                    new ErrorResponseEntity("Service administratively disabled")
//                ).build()
//            );
//          }
//
//        }
//    );
//  }
}
