package ca.firstvoices.cognito;


import ca.firstvoices.cognito.exceptions.MiscellaneousFailureException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.platform.usermanager.UserManagerImpl;
import org.nuxeo.runtime.api.Framework;


/**
 * Extend Nuxeo's builtin UserManagerImpl to intercept the checkUsernamePassword method
 */
public class AWSAwareUserManager extends UserManagerImpl {

  private static Log LOG = LogFactory.getLog(AWSAwareUserManager.class);

  private AWSAuthenticationService aws;
  private AWSAwareUserManagerConfigurationService configurationService;

  private boolean awsConnectionSucceeded = false;
  private boolean awsAuthenticationEnabled;

  private AWSAuthenticationService getAWSAuthenticationService() {
    if (this.aws != null) {
      return this.aws;
    }

    this.aws = Framework.getService(AWSAuthenticationService.class);
    return this.aws;
  }

  private AWSAwareUserManagerConfigurationService getAWSAwareUserManagerConfigurationService() {
    if (this.configurationService != null) {
      return this.configurationService;
    }
    return Framework.getService(AWSAwareUserManagerConfigurationService.class);
  }

  public AWSAwareUserManager() {
    this.awsAuthenticationEnabled = getAWSAwareUserManagerConfigurationService()
        .getConfig().authenticateWithCognito;

    LOG.error("Startup. AWS Authentication is "
        + (this.awsAuthenticationEnabled ? "enabled" : "disabled")
    );

    if (this.awsAuthenticationEnabled) {
      try {
        getAWSAuthenticationService().testConnection();
        this.awsConnectionSucceeded = true;
      } catch (MiscellaneousFailureException e) {
        LOG.error("AWS Connection failed. Authentication will fallback to local for this session");
      }
    }
  }

  @Override
  /** If the config option `authenticateWithCognito` is false, this simply delegates to the
   * default functionality (local auth)
   *
   * Otherwise, attempt to authenticate with Cognito. If the user exists (or was migrated),
   * also check that it exists locally (since this code does not yet provide a method to retrieve
   * a NuxeoPrincipal from Cognito directory data)
   */
  public boolean checkUsernamePassword(String username, String password) {

    if (!this.awsAuthenticationEnabled) {
      return super.checkUsernamePassword(username, password);
    }

    if (!this.awsConnectionSucceeded) {
      return super.checkUsernamePassword(username, password);
    }

    try {
      if (getAWSAuthenticationService().authenticate(username, password)) {
        /* AWS Authentication succeeded, but we only consider this a success if the local user
        actually exists */
        return this.getPrincipal(username) != null;
      } else {
        // The user entered an incorrect password
        return false;
      }
    } catch (MiscellaneousFailureException e) {
      LOG.error("An error occurred while verifying credentials with AWS Cognito."
          + " Falling back to local auth.");
      return super.checkUsernamePassword(username, password);
    }

  }

}
