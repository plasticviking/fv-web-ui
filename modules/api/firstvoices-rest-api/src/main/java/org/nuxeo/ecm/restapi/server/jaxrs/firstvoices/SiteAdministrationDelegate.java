package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import ca.firstvoices.rest.data.AdminSiteJoinRequest;
import ca.firstvoices.rest.data.AdminSiteJoinRequestList;
import java.util.GregorianCalendar;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.query.sql.NXQL;


public class SiteAdministrationDelegate {

  private final Optional<String> dialectId;
  private final CoreSession session;

  public SiteAdministrationDelegate(final CoreSession session, final Optional<String> dialectId) {
    this.session = session;
    this.dialectId = dialectId;
  }

  public Response listJoinRequests(HttpServletRequest request, String site) {
    if (!dialectId.isPresent()) {
      return Response.status(404).build();
    }

    DocumentModelList joinRequestDocuments = session.query(
        "SELECT * from FVSiteJoinRequest where fvjoinrequest:dialect = " + NXQL.escapeString(
            dialectId.get()));
    AdminSiteJoinRequestList joinRequestList = new AdminSiteJoinRequestList(joinRequestDocuments
        .stream()
        .map(d -> {
          AdminSiteJoinRequest e = new AdminSiteJoinRequest(
              d.getPropertyValue("fvjoinrequest:user").toString(),
              "b",
              "c",
              ((GregorianCalendar) d.getPropertyValue("fvjoinrequest:requestTime")).getTime(),
              d.getPropertyValue("fvjoinrequest:interestReason").toString(),
              d.getPropertyValue("fvjoinrequest:interestReason").toString(),
              d.getPropertyValue("fvjoinrequest:comment").toString(),
              Boolean.parseBoolean(d.getPropertyValue("fvjoinrequest:communityMember").toString()),
              Boolean.parseBoolean(d.getPropertyValue("fvjoinrequest:languageTeam").toString()));
          return e;
        })
        .collect(Collectors.toList()));
    return Response.ok(joinRequestList).build();
  }

}
