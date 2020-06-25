package firstvoices.api;

import firstvoices.api.endpoints.UserEndpoint;
import firstvoices.api.exceptions.ExceptionMappers;
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
import javax.ws.rs.ApplicationPath;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerProperties;

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
public class JerseyApplication extends ResourceConfig {

  //  private static final Log log = LogFactory.getLog(JerseyApplication.class);
  private static Log LOG = LogFactory.getLog(JerseyApplication.class);


  // run the application in a servlet container for local testing

//  private static final Logger log = LoggerFactory.getLogger(JerseyApplication.class);

  public JerseyApplication() {

    LOG.error("jersey application in startup");

//    log.error("startup started");

//    Injector injector = Guice.createInjector(new FirstVoicesModule());

    register(CORSFilter.class);
    register(JacksonFeature.class);
    register(ExceptionMappers.class);
    register(ObjectMapperConfiguration.class);
//    registerInstances(injector.getInstance(JWTFilter.class)); // or LocalAuthFilter to skip auth
//    registerInstances(injector.getInstance(LocalAuthFilter.class));

    property(ServerProperties.TRACING, "ALL");
    property(ServerProperties.TRACING_THRESHOLD, "VERBOSE");
//    property(ServerProperties.WADL_FEATURE_DISABLE, true);

//    registerInstances(injector.getInstance(ArchiveEndpoint.class));
//    registerInstances(injector.getInstance(SharedEndpoint.class));
//    registerInstances(injector.getInstance(UserEndpoint.class));
//    registerInstances(injector.getInstance(VocabularyEndpoint.class));

    register(UserEndpoint.class);

//    log.error("startup done");
    System.out.println("JA Startup Complete");
  }

}
