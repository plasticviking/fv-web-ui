package ca.firstvoices.simpleapi;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import ca.firstvoices.simpleapi.model.QueryBean;
import ca.firstvoices.simpleapi.services.FirstVoicesService;
import ca.firstvoices.testUtil.annotations.TestDataConfiguration;
import ca.firstvoices.testUtil.AbstractTestDataCreatorTest;
import java.util.logging.Logger;
import javax.inject.Inject;
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
public class DirectServiceCreatorTestAbstract extends AbstractTestDataCreatorTest {

  private static final Logger log = Logger.getLogger(DirectServiceCreatorTestAbstract.class.getCanonicalName());

  @Inject
  protected FirstVoicesService fvs;

  @Test
  public void testServiceDirectly() {
    QueryBean qb = new QueryBean();
    qb.index = 0;
    qb.pageSize = 30;
    fvs.getArchives(qb);
  }

}
