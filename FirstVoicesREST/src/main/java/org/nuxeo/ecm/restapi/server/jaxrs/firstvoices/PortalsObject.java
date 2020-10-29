package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import ca.firstvoices.rest.helpers.EtagHelper;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.nuxeo.ecm.platform.query.api.PageProvider;
import org.nuxeo.ecm.platform.query.api.PageProviderService;
import org.nuxeo.ecm.platform.query.nxql.CoreQueryDocumentPageProvider;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.DefaultObject;
import org.nuxeo.runtime.api.Framework;

@WebObject(type = "portal")
@Produces({MediaType.APPLICATION_JSON})
public class PortalsObject extends DefaultObject {

  public static final String PORTALS_LIST_PP = "PORTALS_LIST_PP";

  private List<DocumentModel> getPageProviderResults(String ppName,
                                                     Integer pageSize,
                                                     Integer currentPage,
                                                     Object... params) {
    PageProviderService pageProviderService = Framework.getService(PageProviderService.class);
    Map<String, Serializable> props = new HashMap<>();
    props.put(CoreQueryDocumentPageProvider.CORE_SESSION_PROPERTY,
        (Serializable) getContext().getCoreSession());

    PageProvider<DocumentModel> pageProvider =
        (PageProvider<DocumentModel>) pageProviderService.getPageProvider(ppName,
            null,
            null,
            null,
            props,
            params);

    if (pageSize != null) {
      pageProvider.setPageSize(pageSize);
    }
    if (currentPage != null) {
      pageProvider.setCurrentPage(currentPage);
    }

    return pageProvider.getCurrentPage();
  }

  @GET
  @Path("/")
  public Response listPortals(@Context HttpServletRequest request,
                              @QueryParam(value = "pageSize") Integer pageSize,
                              @QueryParam(value = "currentPage") Integer currentPage) {

    request.setAttribute("enrichers.document", "lightancestry,lightportal");

    List<DocumentModel> results = getPageProviderResults(PORTALS_LIST_PP, pageSize, currentPage);
    String etag = EtagHelper.computeEtag(results);
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

}
