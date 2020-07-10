package ca.firstvoices.testutils;

import javax.inject.Inject;
import org.junit.Before;
import org.junit.BeforeClass;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Deploys;
import org.nuxeo.runtime.test.runner.PartialDeploy;
import org.nuxeo.runtime.test.runner.TargetExtensions;

@Deploys({
    @Deploy("FirstVoicesNuxeoPublisher"),
    @Deploy("org.nuxeo.binary.metadata"),
    @Deploy("org.nuxeo.ecm.platform.url.core"),
    @Deploy("org.nuxeo.ecm.platform.types.api"),
    @Deploy("org.nuxeo.ecm.platform.types.core"),
    @Deploy("org.nuxeo.ecm.platform.webapp.types"),
    @Deploy("org.nuxeo.ecm.platform.publisher.core"),
    @Deploy("FirstVoicesTestUtilities"),
    @Deploy("FirstVoicesData:OSGI-INF/ca.firstvoices.listeners.xml"),
    @Deploy("FirstVoicesData:OSGI-INF/ca.firstvoices.operations.xml")
})
@PartialDeploy(bundle = "FirstVoicesData", extensions = {TargetExtensions.ContentModel.class})
public abstract class TestDataTest {

  @Inject
  private TestDataCreator dataCreator;

  @Inject
  private CoreSession session;

  @Before
  public void initData() {
    Class<? extends TestDataTest> clz = this.getClass();

    if (clz.isAnnotationPresent(TestDataConfiguration.class)) {
      TestDataConfiguration config = clz.getAnnotation(TestDataConfiguration.class);
      try {
        dataCreator.createDialectTree(this.session);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    } else {
      System.out.println("No config present");
    }
  }

}
