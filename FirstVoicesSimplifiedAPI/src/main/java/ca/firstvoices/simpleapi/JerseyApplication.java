package ca.firstvoices.simpleapi;


import ca.firstvoices.simpleapi.endpoints.ArchiveEndpoint;
import ca.firstvoices.simpleapi.endpoints.UserEndpoint;
import ca.firstvoices.simpleapi.services.FirstVoicesService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.OAuthFlow;
import io.swagger.v3.oas.annotations.security.OAuthFlows;
import io.swagger.v3.oas.annotations.security.OAuthScope;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.runtime.api.Framework;

@ApplicationPath("/")
@OpenAPIDefinition(
    info = @Info(
        title = "First Voices API",
        version = "0.0.3/prerelease",
        description = "First Voices API documentation",
        license = @License(name = "Unspecified License"),
        contact = @Contact(
            name = "First Peoples' Cultural Council",
            url = "http://www.fpcc.ca/",
            email = "info@fpcc.ca")
    ),
    security = {
        @SecurityRequirement(name = "List Archives", scopes = {"archives:public"})
    },
    servers = {
        @Server(
            description = "Local Development Server",
            url = "http://localhost:8000/"
        )
    }
)
@SecurityScheme(name = "oauth2",
    type = SecuritySchemeType.OAUTH2,
    flows = @OAuthFlows(
        implicit = @OAuthFlow(authorizationUrl = "http://localhost:8888/auth",
            scopes = {
                @OAuthScope(name = "archives:public", description = "read public archive data"),
                @OAuthScope(name = "archives:recorder", description = "view unpublished content and submit new content"),
                @OAuthScope(name = "archives:admin", description = "administer archives and publish new content")
            }
        )
    )
)
public class JerseyApplication extends Application {

  private static final Log LOG = LogFactory.getLog(JerseyApplication.class);

  @Override
  public Set<Object> getSingletons() {
    Set<Object> singletons = new HashSet<>();
    UserEndpoint userEndpoint = new UserEndpoint();
    singletons.add(userEndpoint);
    FirstVoicesService firstVoicesService = Framework.getService(FirstVoicesService.class);
    ArchiveEndpoint archiveEndpoint = new ArchiveEndpoint(firstVoicesService);
    singletons.add(archiveEndpoint);
    return singletons;
  }

  public JerseyApplication() {
    System.out.println("jersey application deployment complete");
    LOG.info("JA Startup Complete");
  }

}
