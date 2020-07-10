package ca.firstvoices.simpleapi.exceptions

import javax.ws.rs.NotFoundException
import javax.ws.rs.core.Response
import javax.ws.rs.ext.ExceptionMapper

class ExceptionMappers implements ExceptionMapper<Exception> {

  @Override
  Response toResponse(Exception exception) {
    Response.ResponseBuilder rb = Response.status(400);
    return rb.build()
  }
}
