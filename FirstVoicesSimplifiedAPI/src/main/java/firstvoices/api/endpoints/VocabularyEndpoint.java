package firstvoices.api.endpoints;

import com.google.inject.Inject;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.*;
import firstvoices.api.representations.containers.Metadata;
import firstvoices.aws.JWTAuth;
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

@Path("/v1/vocabularies")
@SecurityRequirements(
    {
        @SecurityRequirement(name = "oauth2", scopes = {"archives:public"})
    }
)
public class VocabularyEndpoint {

  private static final Logger log = LoggerFactory.getLogger(VocabularyEndpoint.class);

  @Inject
  public VocabularyEndpoint(FirstVoicesService service) {
    this.service = service;
  }

  private final FirstVoicesService service;

  private static class VocabularyListResponse extends Metadata<List<Vocabulary>> {
  }

  private static class VocabularyEntryResponse extends Metadata<List<VocabularyEntry>> {
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
      description = "Get list of all vocabularies",
      operationId = "LIST VOCABULARIES",
      responses = {
          @ApiResponse(
              description = "List of vocabularies",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = VocabularyListResponse.class
                  )
              )
          ),
          @ApiResponse(
              description = "Vocabulary not found",
              responseCode = "404"
          )
      },
      tags = {"Vocabulary"}
  )
  public Response getVocabularies(@BeanParam QueryBean query) {
    return Response.ok(service.getVocabularies(query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{vocabularyID}")
  @Operation(
      description = "Get list of all entries in a vocabulary",
      operationId = "GET VOCABULARY",
      security = {},
      responses = {
          @ApiResponse(
              description = "List of entries",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = VocabularyEntryResponse.class
                  )
              )
          )
      },
      tags = {"Vocabulary"}
  )
  public Response getWords(@PathParam("vocabularyID") String vocabularyID,
                           @BeanParam QueryBean query

  ) {
    return Response.ok().build();
  }

}
