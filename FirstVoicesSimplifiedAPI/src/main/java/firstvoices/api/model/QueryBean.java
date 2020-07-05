package firstvoices.api.model;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.QueryParam;

public class QueryBean {
  public QueryBean() {
  }

  public QueryBean(long pageSize, long index) {
    this.pageSize = pageSize;
    this.index = index;
  }

  @Parameter(
      description = "The maximum number of results to return",
      schema = @Schema(
          allowableValues = {"10", "25", "50", "100"}
      )
  )
  @DefaultValue("25")
  @QueryParam("pageSize")
  public long pageSize;

  @Parameter(
      description = "An optional parameter with the zero-based index of the page to retrieve",
      example = "0"
  )
  @QueryParam("index")
  @DefaultValue("0")

  public long index;

  @Override
  public String toString() {
    return String.format("QueryBean: %d %d", pageSize, index);
  }
}
