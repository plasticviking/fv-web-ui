package ca.firstvoices;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import ca.firstvoices.simpleapi.JerseyApplication;
import ca.firstvoices.simpleapi.model.QueryBean;
import ca.firstvoices.simpleapi.services.FirstVoicesService;
import ca.firstvoices.testutils.TestDataConfiguration;
import ca.firstvoices.testutils.TestDataCreator;
import ca.firstvoices.testutils.TestDataTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.jersey.api.container.grizzly2.GrizzlyServerFactory;
import com.sun.jersey.api.core.ApplicationAdapter;
import com.sun.jersey.api.core.ResourceConfig;
import java.io.IOException;
import java.net.ServerSocket;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.inject.Inject;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.glassfish.grizzly.http.server.HttpServer;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.client.jaxrs.impl.HttpAutomationClient;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Features;
import org.nuxeo.runtime.test.runner.FeaturesRunner;
import org.nuxeo.runtime.test.runner.ServletContainerFeature;

@RunWith(FeaturesRunner.class)
@Features({PlatformFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.CLASS)
@TestDataConfiguration(createDialectTree = true)
@Deploy("FirstVoicesSimplifiedAPI")


//@Deploy("FirstVoicesTestUtilities")
//@Deploy({"FirstVoicesNuxeoPublisher"})

public class SimplifiedAPITest extends TestDataTest {

  @Inject
  private ServletContainerFeature servletContainerFeature;

  @Inject
  private TestDataCreator dataCreator;

  @Inject
  protected FirstVoicesService fvs;

  private String categoryID;


  private static int findFreePort() {
    try (ServerSocket socket = new ServerSocket(0)) {
      socket.setReuseAddress(true);
      return socket.getLocalPort();
    } catch (IOException e) {
      throw new RuntimeException("Cannot find free port");
    }
  }

  //  private boolean initialized = false;
  private static int port = -1;
  private static HttpServer server;

  @Before
  public void setUp() throws InterruptedException {
//    if (!initialized) {
//      dataCreator.createDialectTree(session);
//
//      this.initialized = true;
//    }
  }

  @BeforeClass
  public static void setupServer() throws IOException {
    ResourceConfig rc = new ApplicationAdapter(new JerseyApplication());
    port = findFreePort();

    String url = "http://localhost:" + port + "/";

    server = GrizzlyServerFactory.createHttpServer(url, rc);
    server.start();


  }

  @AfterClass
  public static void tearDown() {
    server.stop();
    port = -1;

  }

  @Test
  public void testServiceDirectly() {
    QueryBean qb = new QueryBean();
    qb.index = 0;
    qb.pageSize = 30;
    fvs.getArchives(qb);
  }

  @Test
  public void testGetUser() throws IOException {
    final String url = String.format("http://localhost:%s/v1/users/current",
        port,
        categoryID);

    validateRESTResponse(url, (node, response) -> {
      assertEquals("Unexpected status code", 200, response.getStatusLine().getStatusCode());
    });
  }

  @Test
  public void testGetArchives() throws IOException {
    final String url = String.format("http://localhost:%s/v1/archives",
        port,
        categoryID);

    validateRESTResponse(url, (node, response) -> {
      assertEquals("Unexpected status code", 200, response.getStatusLine().getStatusCode());
      System.out.println(node.asText());
      assertTrue("Records are returned", node.get("detail").size() > 0);
    });
  }

  @Test
  @Ignore
  public void testGetArchive() throws IOException {
    final String url = String.format("http://localhost:%s/v1/archives/asdf",
        port,
        categoryID);

    validateRESTResponse(url, (node, response) -> {
      assertEquals("Unexpected status code", 500, response.getStatusLine().getStatusCode());
      System.out.println(node.asText());
    });
  }

  private void validateRESTResponse(String url, RESTRequestValidator validator) throws IOException {
    ObjectMapper mapper = new ObjectMapper();

    HttpClient client = new HttpAutomationClient(url).http();
    HttpGet request = new HttpGet(url);
    String auth = Base64.getEncoder()
        .encodeToString("Administrator:Administrator".getBytes(Charset.defaultCharset()));
    request.setHeader("Authorization", "Basic " + auth);
    HttpResponse response = client.execute(request);
    String body = IOUtils.toString(
        response.getEntity().getContent(),
        StandardCharsets.UTF_8.name()
    );
    System.out.println("response body:\n" + body);
    JsonNode node = mapper.readTree(body);
    validator.validateResponse(node, response);
  }

  interface RESTRequestValidator {
    void validateResponse(JsonNode node, HttpResponse response);
  }

}
