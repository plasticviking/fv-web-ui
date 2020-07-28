package ca.firstvoices.simpleapi;

import ca.firstvoices.simpleapi.mocks.MockSigningKeyResolver;
import ca.firstvoices.simpleapi.security.JWTFilter;
import ca.firstvoices.simpleapi.utils.JerseyTestHelper;
import ca.firstvoices.testUtil.helpers.RESTTestHelper;
import ca.firstvoices.testUtil.annotations.TestDataConfiguration;
import ca.firstvoices.testUtil.AbstractTestDataCreatorTest;
import java.io.IOException;
import java.util.logging.Logger;
import javax.inject.Inject;
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
@Deploy("FirstVoicesSimplifiedAPI.test")
public class JWTTest extends AbstractTestDataCreatorTest {

  private static final Logger log = Logger.getLogger(JWTTest.class.getCanonicalName());

  @Inject
  MockSigningKeyResolver keyResolver;

  private static final JerseyTestHelper jersey = JerseyTestHelper.instance();

  @BeforeClass
  public static void setup() throws Exception {
    jersey.start(
        rc -> {
//          rc.getResourceFilterFactories().add(new JWTFilterFactory());
          rc.register(JWTFilter.class);
        }
    );
  }

  @AfterClass
  public static void shutdown() throws Exception {
    jersey.shutdown();
  }

  @Test
  public void testGetUserAuthorized() throws IOException {
    final String url = jersey.getUrl("/v1/users/current");
    RESTTestHelper
        .builder(url)
        .withBearerAuth(this.keyResolver.generateJWT())
        .execute();
  }


  @Test
  public void testGetUserUnAuthorized() throws IOException {
    final String url = jersey.getUrl("/v1/users/current");

    RESTTestHelper
        .builder(url)
        .withExpectedStatusCode(401)
        .execute();
  }

}
