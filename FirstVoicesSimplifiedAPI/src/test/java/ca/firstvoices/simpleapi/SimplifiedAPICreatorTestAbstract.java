package ca.firstvoices.simpleapi;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import ca.firstvoices.simpleapi.utils.JerseyTestHelper;
import ca.firstvoices.testUtil.helpers.RESTTestHelper;
import ca.firstvoices.testUtil.annotations.TestDataConfiguration;
import ca.firstvoices.testUtil.AbstractTestDataCreatorTest;
import java.io.IOException;
import java.util.logging.Logger;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Features;
import org.nuxeo.runtime.test.runner.FeaturesRunner;

@RunWith(FeaturesRunner.class)
@Features({PlatformFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.CLASS)
@TestDataConfiguration(createDialectTree = true)
@Deploy("FirstVoicesSimplifiedAPI")
public class SimplifiedAPICreatorTestAbstract extends AbstractTestDataCreatorTest {

  private static final Logger log = Logger.getLogger(SimplifiedAPICreatorTestAbstract.class.getCanonicalName());

  private static final JerseyTestHelper jersey = JerseyTestHelper.instance();

  @BeforeClass
  public static void setup() throws Exception {
    jersey.start(rc -> {
      rc.getResourceFilterFactories().add(new AdministrativelyDisabledFilterFactory());
    });
  }

  @AfterClass
  public static void shutdown() throws Exception {
    jersey.shutdown();
  }

  @Test
  public void testGetUser() throws IOException {
    final String url = jersey.getUrl("/v1/users/current");
    RESTTestHelper.builder(url).withAdministratorBasicAuth().execute();
  }

  @Test
  public void testGetArchives() throws IOException {
    final String url = jersey.getUrl("/v1/archives");

    RESTTestHelper.builder(url).withAdministratorBasicAuth().execute(
        (node, response) -> {
          assertEquals("Unexpected status code", 200, response.getStatusLine().getStatusCode());
          assertTrue("Records are returned", node.get("detail").size() > 0);
        }
    );
  }

  @Test
  public void testMissingArchive404() throws IOException {
    final String url = jersey.getUrl("/v1/archives/asdf12345/words");
    RESTTestHelper.builder(url).withAdministratorBasicAuth().withExpectedStatusCode(404).execute();
  }

}
