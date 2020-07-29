package ca.firstvoices.simpleapi.nuxeo;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.runtime.model.ComponentInstance;
import org.nuxeo.runtime.model.DefaultComponent;

public class SimpleAPINuxeoConfigurationFactory extends DefaultComponent {
  private static Log LOG = LogFactory.getLog(SimpleAPINuxeoConfigurationFactory.class);


  private SimpleAPINuxeoConfiguration config;

  @Override
  public <T> T getAdapter(Class<T> adapter) {

    if (SimpleAPINuxeoConfiguration.class.isAssignableFrom(adapter)) {
      if (this.config == null) {
        LOG.warn("SimpleAPINuxeoConfigurationDescriptor instance requested but"
            + " we are not configured");
      }
      return (T) this.config;
    }
    return null;
  }

  @Override
  public void registerContribution(Object contribution, String xp, ComponentInstance component) {

    if ("configuration".equals(xp)) {
      LOG.info("Configuration loaded: " + contribution.toString());
      this.config = (SimpleAPINuxeoConfiguration) contribution;
    }

    super.registerContribution(contribution, xp, component);
  }

  @Override
  public void unregisterContribution(Object contribution, String xp, ComponentInstance component) {
    if ("configuration".equals(xp)) {
      this.config = null;
    }
    super.unregisterContribution(contribution, xp, component);
  }


}
