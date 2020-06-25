package firstvoices.api.endpoints;

import com.google.inject.Inject;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.User;
import firstvoices.api.representations.containers.Metadata;
import firstvoices.api.representations.containers.SearchResult;
import firstvoices.services.FirstVoicesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/v1/search")
@SecurityRequirements(
    {
        @SecurityRequirement(name = "oauth2", scopes = {"archives:public"})
    }
)
public class SearchEndpoint {


  @Inject
  public SearchEndpoint(FirstVoicesService service) {
    this.service = service;
  }

  private final FirstVoicesService service;


  private static final Logger log = LoggerFactory.getLogger(SearchEndpoint.class);

  private static class SearchResponse extends Metadata<List<SearchResult>> {
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
      description = "Execute a search query",
      operationId = "SEARCH",
      responses = {
          @ApiResponse(
              description = "",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = SearchResponse.class
                  )
              )
          )
      },
      tags = {"Search"}
  )
  public Response doSearch(@QueryParam("q") String q, @BeanParam QueryBean query) {
    return Response.ok(service.doSearch(q, query)).build();
  }

}
