package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import ca.firstvoices.rest.helpers.EtagHelper;
import ca.firstvoices.rest.helpers.PageProviderHelper;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.http.HttpHeaders;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.DefaultObject;

@WebObject(type = "portal")
@Produces({MediaType.APPLICATION_JSON})
public class PortalsObject extends DefaultObject {

  public static final String PORTALS_LIST_SECTIONS_PP = "PORTALS_LIST_SECTIONS_PP";
  public static final String PORTALS_LIST_WORKSPACES_PP = "PORTALS_LIST_WORKSPACES_PP";

  private Response simplePageProviderResponse(HttpServletRequest request,
                                              String pageProviderName,
                                              Integer pageSize,
                                              Integer currentPage) {


    request.setAttribute("enrichers.document", "lightancestry,lightportal");

    List<DocumentModel> results =
        PageProviderHelper.getPageProviderResults(getContext().getCoreSession(),
            pageProviderName,
            pageSize,
            currentPage);

    String etag = EtagHelper.computeEtag(results, EtagHelper.DC_MODIFIED_MAPPER);
    String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);

    if (ifNoneMatch != null && ifNoneMatch.equals(etag)) {
      return Response.notModified().build();
    }

    Response.ResponseBuilder responseBuilder =
        Response.ok().entity(results).cacheControl(CacheControl.valueOf("must-revalidate"));

    if (etag != null) {
      responseBuilder.header(HttpHeaders.ETAG, etag);
    }

    return responseBuilder.build();
  }

  @GET
  @Path("sections")
  public Response listPortalsSections(@Context HttpServletRequest request,
                                      @QueryParam(value = "pageSize") Integer pageSize,
                                      @QueryParam(value = "currentPage") Integer currentPage) {
    return simplePageProviderResponse(request, PORTALS_LIST_SECTIONS_PP, pageSize, currentPage);
  }

  @GET
  @Path("Workspaces")
  public Response listPortalsWorkspaces(@Context HttpServletRequest request,
                                        @QueryParam(value = "pageSize") Integer pageSize,
                                        @QueryParam(value = "currentPage") Integer currentPage) {
    return simplePageProviderResponse(request, PORTALS_LIST_WORKSPACES_PP, pageSize, currentPage);
  }

}
