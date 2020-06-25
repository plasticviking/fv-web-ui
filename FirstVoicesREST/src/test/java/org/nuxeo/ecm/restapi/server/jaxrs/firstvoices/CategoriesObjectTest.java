package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import static org.junit.Assert.assertEquals;
import com.google.common.io.CharStreams;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.inject.Inject;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.client.jaxrs.impl.HttpAutomationClient;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.test.CoreFeature;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.ServletContainerTransactionalFeature;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.ecm.webengine.test.WebEngineFeature;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Features;
import org.nuxeo.runtime.test.runner.FeaturesRunner;
import org.nuxeo.runtime.test.runner.ServletContainerFeature;
import org.nuxeo.runtime.test.runner.web.WebDriverFeature;

@RunWith(FeaturesRunner.class)
@Features({CoreFeature.class, PlatformFeature.class, WebEngineFeature.class, ServletContainerTransactionalFeature.class, WebDriverFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.CLASS)
//@Deploy({"org.nuxeo.ecm.platform", "FirstVoicesREST", "FirstVoicesRESTPageProviders"})
//@Deploy("org.nuxeo.binary.metadata")
//@Deploy("org.nuxeo.ecm.platform.url.core")
//@Deploy("org.nuxeo.ecm.platform.types.api")
//@Deploy("org.nuxeo.ecm.platform.types.core")
//@Deploy("org.nuxeo.ecm.platform.filemanager.api")
//@Deploy("org.nuxeo.ecm.platform.filemanager.core")
//@Deploy("org.nuxeo.ecm.platform.rendition.core")
//@Deploy("org.nuxeo.ecm.platform.tag")
//@Deploy("org.nuxeo.ecm.platform.commandline.executor")
//@Deploy("org.nuxeo.ecm.platform.convert")
//@Deploy("org.nuxeo.ecm.platform.preview")
//@Deploy("org.nuxeo.theme.styling")
@Deploy("org.nuxeo.web.resources.core")

// Video doctype
//@Deploy("org.nuxeo.ecm.platform.video.convert")

// Picture doctype
//@Deploy("org.nuxeo.ecm.platform.picture.core")
//@Deploy("org.nuxeo.ecm.platform.picture.api")
//@Deploy("org.nuxeo.ecm.platform.picture.convert")

// ElasticSearch / Search
//@Deploy("org.nuxeo.elasticsearch.core:elasticsearch-test-contrib.xml")
//@Deploy("org.nuxeo.ecm.platform.search.core")
@Deploy("org.nuxeo.ecm.platform.webapp.types")
@Deploy({"org.nuxeo.ecm.platform", "org.nuxeo.ecm.platform.restapi.server",
    "org.nuxeo.ecm.platform.web.common", "org.nuxeo.ecm.platform.web.common", "FirstVoicesData",
    "FirstVoicesREST", "FirstVoicesRESTPageProviders", "FirstVoicesSecurity"})
//@PartialDeploy(bundle = "FirstVoicesData", extensions = {TargetExtensions.ContentTemplate.class})
public class CategoriesObjectTest {


  @Inject
  private ServletContainerFeature servletContainerFeature;

  @Inject
  protected CoreSession session;

  @Before
  public void setUp() {
  }

  @Test
  public void testPublicCategories() throws IOException {
    final String url = String.format("http://localhost:%s/nuxeo/api/v1", servletContainerFeature.getPort());
    HttpClient client = new HttpAutomationClient(url).http();
    HttpGet request = new HttpGet(url);
    HttpResponse response = client.execute(request);

    String body = IOUtils.toString(response.getEntity().getContent(), StandardCharsets.UTF_8.name());

    System.err.println("got response body\n" + body);

    assertEquals("Unexpected status code", 200, response.getStatusLine().getStatusCode());
//    List<DocumentModel> documentModels = categories.listCategories(10, 1, false);
//    assert documentModels.size() > 0;
  }
}
