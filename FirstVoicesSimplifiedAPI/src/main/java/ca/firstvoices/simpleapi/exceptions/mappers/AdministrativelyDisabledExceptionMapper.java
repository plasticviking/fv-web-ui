package ca.firstvoices.simpleapi.exceptions.mappers;

import ca.firstvoices.simpleapi.exceptions.AdministrativelyDisabledException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

@Provider
public class AdministrativelyDisabledExceptionMapper implements ExceptionMapper<AdministrativelyDisabledException> {

  @Override
  public Response toResponse(AdministrativelyDisabledException e) {
    return Response.status(Response.Status.SERVICE_UNAVAILABLE).entity(
        new ErrorResponseEntity("Service administratively disabled")
    ).build();
  }
}
