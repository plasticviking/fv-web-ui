package ca.firstvoices.cognito;

import org.nuxeo.common.xmap.annotation.XNode;
import org.nuxeo.common.xmap.annotation.XObject;

public class AWSAwareUserManagerConfigurationService {

  private AWSAwareUserManagerConfigurationDescriptor config;

  public AWSAwareUserManagerConfigurationService(AWSAwareUserManagerConfigurationDescriptor config) {
    this.config = config;
  }

  public AWSAwareUserManagerConfigurationDescriptor getConfig() {
    return config;
  }
}
