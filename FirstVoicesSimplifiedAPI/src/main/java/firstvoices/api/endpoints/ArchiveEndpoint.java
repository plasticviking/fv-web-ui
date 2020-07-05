package firstvoices.api.endpoints;

import com.google.inject.Inject;
import firstvoices.api.representations.containers.Metadata;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.ArchiveDetailPrivate;
import firstvoices.api.representations.ArchiveDetailPublic;
import firstvoices.api.representations.ArchiveOverview;
import firstvoices.api.representations.Phrase;
import firstvoices.api.representations.Song;
import firstvoices.api.representations.Story;
import firstvoices.api.representations.Word;
import firstvoices.services.FirstVoicesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.QueryParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.BeanParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;


@Path("/v1/archives")
@SecurityRequirements(
    {
        @SecurityRequirement(name = "oauth2", scopes = {"archives:public"})
    }
)
public class ArchiveEndpoint {


  private static class WordOverviewResponse extends Metadata<List<Word>> {
  }

  private static class WordDetailResponse extends Metadata<Word> {
  }

  private static class StoryOverviewResponse extends Metadata<List<Story>> {
  }

  private static class PhraseOverviewResponse extends Metadata<List<Phrase>> {
  }

  private static class SongOverviewResponse extends Metadata<List<Song>> {
  }

  private static class SongDetailResponse extends Metadata<Song> {
  }

  private static class PhraseDetailResponse extends Metadata<Phrase> {
  }

  private static class StoryDetailResponse extends Metadata<Story> {
  }

  private static class PublicLanguageResponse extends Metadata<ArchiveDetailPublic> {
  }

  private static class AdminLanguageResponse extends Metadata<ArchiveDetailPrivate> {
  }

  private static class LanguageOverviewResponse extends Metadata<List<ArchiveOverview>> {
  }

  private static final Logger log = LoggerFactory.getLogger(ArchiveEndpoint.class);


  @Inject
  public ArchiveEndpoint(FirstVoicesService service) {
    this.service = service;
  }

  private final FirstVoicesService service;


  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Operation(
      description = "Get list of all archives",
      operationId = "LIST ARCHIVES",
      responses = {
          @ApiResponse(
              description = "List of archives",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = LanguageOverviewResponse.class
                  )
              )
          )
      },
      tags = {"Archive"}
  )
  public Response getArchives(
      @Parameter(
          description = "The maximum number of results to return",
          schema = @Schema(
              allowableValues = {"10", "25", "50", "100"}
          )
      )
      @DefaultValue("25")
      @QueryParam("pageSize")
          long pageSize,

      @Parameter(
          description = "An optional parameter with the zero-based index of the page to retrieve",
          example = "0"
      )
      @QueryParam("index")
      @DefaultValue("0")
          long index
  ) {
    return Response.ok(service.getArchives(new QueryBean(pageSize, index))).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/words")
  @Operation(
      description = "Get list of all words in an archive",
      operationId = "LIST WORDS",
      security = {},
      responses = {
          @ApiResponse(
              description = "List of words",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = WordOverviewResponse.class
                  )
              )
          ),
          @ApiResponse(
              description = "Archive not found",
              responseCode = "404"
          )
      },
      tags = {"Archive"}
  )
  public Response getWords(@PathParam("archiveID") String archive,
                           @BeanParam QueryBean query

  ) {
    return Response.ok(service.getWordsInArchive(archive, query)).build();
  }


  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/phrases")
  @Operation(
      description = "Get list of all phrases in an archive",
      operationId = "LIST PHRASES",
      security = {},
      responses = {
          @ApiResponse(
              description = "List of phrases",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = PhraseOverviewResponse.class
                  )
              )
          )
          ,
          @ApiResponse(
              description = "Archive not found",
              responseCode = "404"
          )
      },
      tags = {"Archive"}
  )
  public Response getPhrases(@PathParam("archiveID") String archive,
                             @BeanParam QueryBean query
  ) {
    return Response.ok(service.getPhrasesInArchive(archive, query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/songs")
  @Operation(
      description = "Get list of all songs in an archive",
      operationId = "LIST SONGS",
      security = {
      },
      responses = {
          @ApiResponse(
              description = "List of songs",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = SongOverviewResponse.class
                  )
              )
          )
          ,
          @ApiResponse(
              description = "Archive not found",
              responseCode = "404"
          )
      },
      tags = {"Archive"}
  )
  public Response getSongs(@PathParam("archiveID") String archive,
                           @BeanParam QueryBean query
  ) {
    return Response.ok(service.getSongsInArchive(archive, query)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/stories")
  @Operation(
      description = "Get list of all stories in an archive",
      operationId = "LIST STORIES",
      security = {
      },
      responses = {
          @ApiResponse(
              description = "List of stories",
              responseCode = "200",
              content = @Content(
                  schema = @Schema(
                      implementation = StoryOverviewResponse.class
                  )
              )
          )
          ,
          @ApiResponse(
              description = "Archive not found",
              responseCode = "404"
          )
      },
      tags = {"Archive"}
  )
  public Response getStories(
      @PathParam("archiveID") String archive,
      @BeanParam QueryBean query
  ) {
    return Response.ok(service.getStoriesInArchive(archive, query)).build();
  }


  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}")
  @Operation(
      description = "Get archive detail",
      operationId = "GET ARCHIVE",
      security = {
          @SecurityRequirement(name = "oauth2", scopes = {"communities:public"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:recorder"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:admin"})
      },
      responses = {
          @ApiResponse(
              description = "Community details",
              content = @Content(
                  schema = @Schema(
                      type = "object",
                      oneOf = {
                          PublicLanguageResponse.class,
                          AdminLanguageResponse.class
                      },
                      discriminatorProperty = "responseType"
                  )
              ),
              responseCode = "200"
          ),
          @ApiResponse(responseCode = "404", description = "Language not found")
      },
      tags = {"Archive"}
  )
  public Response getLanguage(@PathParam("archiveID") String archive) {
    return Response.ok(service.getArchiveDetail(archive)).build();
  }


  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/words/{wordID}")
  @Operation(
      description = "Get word detail",
      operationId = "GET WORD",
      security = {
          @SecurityRequirement(name = "oauth2", scopes = {"communities:public"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:recorder"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:admin"})
      },
      responses = {
          @ApiResponse(
              description = "Word details",
              content = @Content(
                  schema = @Schema(
                      implementation = WordDetailResponse.class
                  )
              ),
              responseCode = "200"
          ),
          @ApiResponse(responseCode = "404", description = "Word not found")
      },
      tags = {"Archive"}
  )
  public Response getWord(@PathParam("archiveID") String archiveId, @PathParam("wordID") String wordId) {
    return Response.ok(service.getWordDetail(wordId)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/phrases/{phraseID}")
  @Operation(
      description = "Get phrase detail",
      operationId = "GET PHRASE",
      security = {
          @SecurityRequirement(name = "oauth2", scopes = {"communities:public"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:recorder"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:admin"})
      },
      responses = {
          @ApiResponse(
              description = "Phrase details",
              content = @Content(
                  schema = @Schema(
                      implementation = PhraseDetailResponse.class
                  )
              ),
              responseCode = "200"
          ),
          @ApiResponse(responseCode = "404", description = "Phrase not found")
      },
      tags = {"Archive"}
  )
  public Response getPhrase(@PathParam("archiveID") String archiveId, @PathParam("phraseID") String phraseID) {
    return Response.ok(service.getPhraseDetail(phraseID)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/songs/{songID}")
  @Operation(
      description = "Get song detail",
      operationId = "GET SONG",
      security = {
          @SecurityRequirement(name = "oauth2", scopes = {"communities:public"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:recorder"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:admin"})
      },
      responses = {
          @ApiResponse(
              description = "Song details",
              content = @Content(
                  schema = @Schema(
                      implementation = SongDetailResponse.class
                  )
              ),
              responseCode = "200"
          ),
          @ApiResponse(responseCode = "404", description = "Song not found")
      },
      tags = {"Archive"}
  )
  public Response getSong(@PathParam("archiveID") String archiveId, @PathParam("songID") String songID) {
    return Response.ok(service.getWordDetail(songID)).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("/{archiveID}/stories/{storyID}")
  @Operation(
      description = "Get story detail",
      operationId = "GET STORY",
      security = {
          @SecurityRequirement(name = "oauth2", scopes = {"communities:public"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:recorder"}),
          @SecurityRequirement(name = "oauth2", scopes = {"communities:admin"})
      },
      responses = {
          @ApiResponse(
              description = "Word details",
              content = @Content(
                  schema = @Schema(
                      implementation = StoryDetailResponse.class
                  )
              ),
              responseCode = "200"
          ),
          @ApiResponse(responseCode = "404", description = "Story not found")
      },
      tags = {"Archive"}
  )
  public Response getStory(@PathParam("archiveID") String archiveId, @PathParam("storyID") String storyID) {
    return Response.ok(service.getStoryDetail(storyID)).build();
  }
}
