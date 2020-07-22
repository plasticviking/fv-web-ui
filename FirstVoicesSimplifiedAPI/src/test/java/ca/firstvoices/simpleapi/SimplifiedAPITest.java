package ca.firstvoices.simpleapi;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import ca.firstvoices.simpleapi.utils.JerseyTestHelper;
import ca.firstvoices.testUtil.AbstractTestDataCreatorTest;
import ca.firstvoices.testUtil.annotations.TestDataConfiguration;
import ca.firstvoices.testUtil.helpers.RESTTestHelper;
import java.io.IOException;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.inject.Inject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Features;
import org.nuxeo.runtime.test.runner.FeaturesRunner;
import org.nuxeo.runtime.transaction.TransactionHelper;

@RunWith(FeaturesRunner.class)
@Features({PlatformFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.CLASS)
@TestDataConfiguration(createDialectTree = true)
@Deploy("FirstVoicesSimplifiedAPI")
public class SimplifiedAPITest extends AbstractTestDataCreatorTest {

  private static final Logger log = Logger.getLogger(SimplifiedAPITest.class.getCanonicalName());

  private static final JerseyTestHelper jersey = JerseyTestHelper.instance();

  @BeforeClass
  public static void setup() throws Exception {
    jersey.start(rc -> {

//      rc.getResourceFilterFactories().add(new AdministrativelyDisabledFilterFactory());
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

          node.get("detail").elements().forEachRemaining(e -> {
            System.out.println("Contains nodes: " + e.toString());
          });
        }
    );
  }

  @Inject
  CoreSession session;

  @Test
  public void testGetArchiveOK() throws IOException {
    final String url = jersey.getUrl("/v1/archives/" + this.dataCreator.getPublishedDialects().stream().findFirst().orElseThrow(() -> new RuntimeException("no published dialects exist")));


    TransactionHelper.startTransaction();
    DocumentModelList list = session.query("SELECT * FROM FVDialect, FVLanguage, FVLanguageFamily where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/Data'");
    String s = list.stream().map(dm -> ("document " + dm.getType() + ":" + dm.getPathAsString() + ":" + dm.getTitle() + ":" + dm.getId())).collect(Collectors.joining("\n"));
    System.out.println("confirming tree:\n" + s);
    TransactionHelper.commitOrRollbackTransaction();

    System.out.println("checking url " + url);

    RESTTestHelper.builder(url).withAdministratorBasicAuth().execute(
        (node, response) -> {
          assertEquals("Unexpected status code", 200, response.getStatusLine().getStatusCode());
          assertNotNull("Records are returned", node.get("detail"));

          node.get("detail").elements().forEachRemaining(e -> {
            System.out.println("Contains nodes: " + e.toString());
          });
        }
    );
  }

  @Test
  public void testMissingArchive404() throws IOException {
    final String url = jersey.getUrl("/v1/archives/asdf12345");
    RESTTestHelper.builder(url).withAdministratorBasicAuth().withExpectedStatusCode(404).execute();
  }

}
