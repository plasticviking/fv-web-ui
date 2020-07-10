package ca.firstvoices.simpleapi.endpoints;

import ca.firstvoices.simpleapi.exceptions.NotImplementedException;
import ca.firstvoices.simpleapi.representations.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@Path("/v1/users")
@SecurityRequirements(
    {
        @SecurityRequirement(name = "oauth2", scopes = {"archives:public"})
    }
)
public class UserEndpoint {

  private static Log LOG = LogFactory.getLog(UserEndpoint.class);

//  private UserContextStore userContextStore;
//
//  @Inject
//  public UserEndpoint(UserContextStore userContextStore) {
//    this.userContextStore = userContextStore;
//  }

  @GET
  @Path("/current")
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
      description = "Get details for the currently-authenticated user",
      operationId = "GET CURRENT USER",
      responses = {
          @ApiResponse(
              description = "The current user",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = User.class
                  )
              )

          )
      }
      ,
      tags = {"Access", "User"}
  )

  public Response getCurrentUser(@QueryParam(value = "username") String username) {
    throw new NotImplementedException();
  }

}
