package ca.firstvoices.simpleapi;

import org.apache.catalina.filters.CorsFilter;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.servlet.ServletContainer;

public class SimpleAPIServlet extends ServletContainer {

  public SimpleAPIServlet() {
    super(
        ResourceConfig.forApplication(new JerseyApplication())
        .register(CorsFilter.class)
    );
  }
}
