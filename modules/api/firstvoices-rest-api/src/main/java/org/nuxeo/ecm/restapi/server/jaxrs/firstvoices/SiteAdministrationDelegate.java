package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import ca.firstvoices.operations.FVRequestToJoinDialectAdminAction;
import ca.firstvoices.rest.data.AdminSiteJoinRequest;
import ca.firstvoices.rest.data.AdminSiteJoinRequestList;
import ca.firstvoices.rest.data.SiteMembershipUpdateRequest;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.OperationException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.UnrestrictedSessionRunner;
import org.nuxeo.ecm.core.query.sql.NXQL;
import org.nuxeo.runtime.api.Framework;


public class SiteAdministrationDelegate {

  private final Optional<String> dialectId;
  private final CoreSession session;

  public SiteAdministrationDelegate(final CoreSession session, final Optional<String> dialectId) {
    this.session = session;
    this.dialectId = dialectId;
  }

  /**
   * Language admin to get list of pending join request
   */
  public Response listJoinRequests(HttpServletRequest request, String site) {
    if (!dialectId.isPresent()) {
      return Response.status(404).build();
    }

    JoinRequestListQueryRunner runner = new JoinRequestListQueryRunner(session, dialectId.get());
    runner.runUnrestricted();

    return Response.ok(runner.getResult()).build();

  }

  /**
   * Language admin get details of join request
   */
  public Response getJoinRequest(HttpServletRequest request, String site, String requestId) {

    if (!dialectId.isPresent()) {
      return Response.status(404).build();
    }

    JoinRequestQueryRunner runner = new JoinRequestQueryRunner(session, dialectId.get(), requestId);
    runner.runUnrestricted();

    return Response.ok(runner.getResult()).build();
  }

  /**
   * Language admin approve join request
   */
  public Response updateJoinRequest(
      final HttpServletRequest request, final String site, final String requestId,
      final SiteMembershipUpdateRequest joinRequest) {

    if (!dialectId.isPresent()) {
      return Response.status(404).build();
    }

    final AutomationService automationService = Framework.getService(AutomationService.class);
    OperationContext operationContext = new OperationContext(session);

    Map<String, Object> params = new HashMap<>();
    params.put("requestId", requestId);
    params.put("messageToUser", joinRequest.getMessageToUser());
    params.put("newStatus", joinRequest.getNewStatus());


    try {
      automationService.run(operationContext, FVRequestToJoinDialectAdminAction.ID, params);
    } catch (OperationException e) {
      return Response.status(500).entity("Failed to action this join request").build();
    }

    return Response.ok().build();
  }

  private static AdminSiteJoinRequest mapper(DocumentModel d) {
    AdminSiteJoinRequest e = new AdminSiteJoinRequest(
        d.getId(),
        d.getPropertyValue("fvjoinrequest:user").toString(),
        "b",
        "c",
        ((GregorianCalendar) d.getPropertyValue("fvjoinrequest:requestTime")).getTime(),
        Optional
            .ofNullable(d.getPropertyValue("fvjoinrequest:status"))
            .orElse("UNKNOWN")
            .toString(),
        Optional
            .ofNullable(d.getPropertyValue("fvjoinrequest:interestReason"))
            .orElse("")
            .toString(),
        Optional.ofNullable(d.getPropertyValue("fvjoinrequest:comment")).orElse("").toString(),
        Optional
            .ofNullable((Boolean) d.getPropertyValue("fvjoinrequest:communityMember"))
            .orElse(false),
        Optional
            .ofNullable((Boolean) d.getPropertyValue("fvjoinrequest:languageTeam"))
            .orElse(false));

    return e;
  }

  private static class JoinRequestListQueryRunner extends UnrestrictedSessionRunner {

    private String dialect;
    private AdminSiteJoinRequestList result;

    JoinRequestListQueryRunner(CoreSession session, String dialect) {
      super(session);
      this.dialect = dialect;
    }

    @Override
    public void run() {
      DocumentModelList queryResult = session.query(
          "SELECT * from FVSiteJoinRequest where fvjoinrequest:dialect = " + NXQL.escapeString(
              dialect) + " and fvjoinrequest:status = 'NEW' order by "
              + "fvjoinrequest:requestTime desc");

      this.result = new AdminSiteJoinRequestList(queryResult
          .stream()
          .map(SiteAdministrationDelegate::mapper)
          .collect(Collectors.toList()));
    }

    public AdminSiteJoinRequestList getResult() {
      return result;
    }
  }

  private static class JoinRequestQueryRunner extends UnrestrictedSessionRunner {

    private String dialect;
    private String requestId;
    private AdminSiteJoinRequest result;

    JoinRequestQueryRunner(CoreSession session, String dialect, String requestId) {
      super(session);
      this.dialect = dialect;
      this.requestId = requestId;
    }

    @Override
    public void run() {
      DocumentModelList queryResult = session.query(
          "SELECT * from FVSiteJoinRequest where fvjoinrequest:dialect = " + NXQL.escapeString(
              dialect) + " and ecm:uuid = " + NXQL.escapeString(requestId));

      this.result = queryResult
          .stream()
          .map(SiteAdministrationDelegate::mapper)
          .findFirst()
          .orElseThrow(() -> {
            return new IllegalArgumentException("Not found");
          });
    }

    public AdminSiteJoinRequest getResult() {
      return result;
    }
  }
}
