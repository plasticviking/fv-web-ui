package firstvoices.api.endpoints;

import com.google.inject.Inject;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.*;
import firstvoices.api.representations.containers.Metadata;
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

@Path("/v1/shared")
@SecurityRequirements(
    {
        @SecurityRequirement(name = "oauth2", scopes = {"archives:public"})
    }
)
public class SharedEndpoint {

  private static class CategoryListResponse extends Metadata<List<String>> {
  }

  private static class CategoryResponse extends Metadata<String> {
  }

  private static class LinkListResponse extends Metadata<List<Link>> {
  }

  private static class LinkResponse extends Metadata<Link> {
  }

  private static class MediaListResponse extends Metadata<List<Asset>> {
  }

  private static class MediaReponse extends Metadata<Asset> {
  }


  private static final Logger log = LoggerFactory.getLogger(SharedEndpoint.class);


  @Inject
  public SharedEndpoint(FirstVoicesService service) {
    this.service = service;
  }

  private final FirstVoicesService service;

  @GET
  @Path("/categories")
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
      description = "Get list of all shared categories",
      operationId = "LIST SHARED CATEGORIES",
      responses = {
          @ApiResponse(
              description = "List of categories",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = CategoryListResponse.class
                  )
              )
          )
      },
      tags = {"Shared"}
  )
  public Response getCategories(@BeanParam QueryBean query) {
    return Response.ok(service.getSharedCategories(query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/links")
  @Operation(
      description = "Get list of all shared links",
      operationId = "LIST SHARED LINKS",
      security = {},
      responses = {
          @ApiResponse(
              description = "List of links",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = LinkListResponse.class
                  )
              )
          )
      },
      tags = {"Shared"}
  )
  public Response getLinks(@BeanParam QueryBean query
  ) {
    return Response.ok(service.getSharedLinks(query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/media")
  @Operation(
      description = "Get list of all shared media",
      operationId = "LIST SHARED MEDIA",
      security = {},
      responses = {
          @ApiResponse(
              description = "List of media",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = MediaListResponse.class
                  )
              )
          )
      },
      tags = {"Shared"}
  )
  public Response getMedia(@BeanParam QueryBean query
  ) {
    return Response.ok(service.getSharedMedia(query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/media/{mediaID}")
  @Operation(
      description = "Get shared media details",
      operationId = "GET SHARED MEDIA",
      security = {},
      responses = {
          @ApiResponse(
              description = "Media details",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = MediaReponse.class
                  )
              )
          ),
          @ApiResponse(
              description = "Media not found",
              responseCode = "404"
          )
      },
      tags = {"Shared"}
  )
  public Response getSharedMediaDetail(
      @PathParam("mediaID") String mediaID,
      @BeanParam QueryBean query
  ) {
    return Response.ok(service.getSharedMediaDetail(mediaID)).build();
  }
}
