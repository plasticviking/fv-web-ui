package ca.firstvoices.token.endpoints;

import ca.firstvoices.token.representations.Token;
import ca.firstvoices.token.services.TokenService;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.nuxeo.runtime.api.Framework;

@Path("/mine")
public class TokenEndpoint {

  private TokenService getTokenService() {
    return Framework.getService(TokenService.class);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getToken() {
    Token t = getTokenService().getToken();
    System.out.println("called");
    if (t != null) {
      return Response.ok(t).build();
    }

    return Response.status(401).build();
  }

}
