package ca.firstvoices.cognito;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.platform.usermanager.UserManagerImpl;
import org.nuxeo.runtime.api.Framework;
import org.nuxeo.runtime.services.config.ConfigurationService;

public class CognitoAuthenticationProvider extends UserManagerImpl {

    private static Log LOG = LogFactory.getLog(CognitoAuthenticationProvider.class);

    public CognitoAuthenticationProvider() {
        LOG.error("CAP startup");
        System.out.println("cap startup");
    }

    @Override
    public boolean checkUsernamePassword(String username, String password) {
        ConfigurationService configurationService = Framework.getService(ConfigurationService.class);
        boolean enabled = Boolean.parseBoolean(configurationService.getProperty("ca.firstvoices.cognito.migrationEnabled"));

        LOG.warn("Delegating auth request with username: " + username + " to super");
        System.out.println("cap auth enabled? " + (enabled ? " yes " : " no "));
        return super.checkUsernamePassword(username, password);
    }
}
