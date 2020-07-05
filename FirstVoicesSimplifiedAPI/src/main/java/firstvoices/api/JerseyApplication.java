package firstvoices.api;

import firstvoices.api.endpoints.ArchiveEndpoint;
import firstvoices.api.endpoints.UserEndpoint;
import firstvoices.services.FirstVoicesService;
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

  //  private static final Log log = LogFactory.getLog(JerseyApplication.class);
  private static Log LOG = LogFactory.getLog(JerseyApplication.class);

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


//  @Override
//  public Map<String, Object> getProperties() {
//    Map<String, Object> props = new HashMap<>();
//    return props;
//  }

  // run the application in a servlet container for local testing

//  private static final Logger log = LoggerFactory.getLogger(JerseyApplication.class);

  public JerseyApplication() {

//    LOG.error("jersey application in startup");
//
////    log.error("startup started");
//
////    Injector injector = Guice.createInjector(new FirstVoicesModule());
//
//    register(CORSFilter.class);
//    register(JacksonFeature.class);
//    register(ExceptionMappers.class);
//    register(ObjectMapperConfiguration.class);
////    registerInstances(injector.getInstance(JWTFilter.class)); // or LocalAuthFilter to skip auth
////    registerInstances(injector.getInstance(LocalAuthFilter.class));
//
//    property(ServerProperties.TRACING, "ALL");
//    property(ServerProperties.TRACING_THRESHOLD, "VERBOSE");
////    property(ServerProperties.WADL_FEATURE_DISABLE, true);
//
////    registerInstances(injector.getInstance(ArchiveEndpoint.class));
////    registerInstances(injector.getInstance(SharedEndpoint.class));
////    registerInstances(injector.getInstance(UserEndpoint.class));
////    registerInstances(injector.getInstance(VocabularyEndpoint.class));
//
//    register(UserEndpoint.class);

//    log.error("startup done");
    System.out.println("JA Startup Complete");
  }

}
