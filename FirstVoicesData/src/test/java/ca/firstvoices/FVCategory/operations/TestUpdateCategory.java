package ca.firstvoices.FVCategory.operations;

import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.OperationException;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.PathRef;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.ecm.core.io.marshallers.json.AbstractJsonWriterTest;
import org.nuxeo.ecm.core.io.marshallers.json.document.DocumentModelJsonWriter;
import org.nuxeo.ecm.core.test.CoreFeature;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.elasticsearch.test.RepositoryElasticSearchFeature;
import org.nuxeo.runtime.test.runner.*;

@RunWith(FeaturesRunner.class)
@Features({AutomationFeature.class, PlatformFeature.class, RuntimeFeature.class, CoreFeature.class, RepositoryElasticSearchFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.METHOD)

@Deploy("org.nuxeo.binary.metadata")
@Deploy("org.nuxeo.ecm.platform.url.core")
@Deploy("org.nuxeo.ecm.platform.types.api")
@Deploy("org.nuxeo.ecm.platform.types.core")
@Deploy("org.nuxeo.ecm.platform.filemanager.api")
@Deploy("org.nuxeo.ecm.platform.filemanager.core")
@Deploy("org.nuxeo.ecm.platform.rendition.core")
@Deploy("org.nuxeo.ecm.platform.tag")
@Deploy("org.nuxeo.ecm.platform.commandline.executor")
@Deploy("org.nuxeo.ecm.platform.convert")
@Deploy("org.nuxeo.ecm.platform.preview")

// Audio doctype
@Deploy("org.nuxeo.ecm.platform.audio.core")

// Video doctype
@Deploy("org.nuxeo.ecm.platform.video.convert")
@Deploy("org.nuxeo.ecm.platform.video.core")

// Picture doctype
@Deploy("org.nuxeo.ecm.platform.picture.core")
@Deploy("org.nuxeo.ecm.platform.picture.api")
@Deploy("org.nuxeo.ecm.platform.picture.convert")

// ElasticSearch / Search
@Deploy("org.nuxeo.elasticsearch.core:elasticsearch-test-contrib.xml")
@Deploy("org.nuxeo.ecm.platform.search.core")
@Deploy("org.nuxeo.ecm.platform.webapp.types")

@Deploy("FirstVoicesData:OSGI-INF/ca.firstvoices.FVCategory.operations.xml")
//@Deploy("FirstVoicesData")
@PartialDeploy(bundle = "FirstVoicesData", extensions = {TargetExtensions.ContentModel.class})
public class TestUpdateCategory extends AbstractJsonWriterTest.Local<DocumentModelJsonWriter, DocumentModel>{

    public TestUpdateCategory(){
        super(DocumentModelJsonWriter.class, DocumentModel.class);
    }

    @Inject
    protected CoreSession session;

    DocumentModel parentCategory1 = null;
    DocumentModel parentCategory2 = null;
    DocumentModel category = null;

    @Inject
    private UpdateCategory updateCategoryInstance;

    @Inject
    protected AutomationService automationService;

    @Before
    public void setUpTest() {

        assertNotNull("Should have a valid session", session);

        // Create a FVCategory documents
        session.createDocument(session.createDocumentModel("/", "FV", "Domain"));
        session.createDocument(session.createDocumentModel("/", "Family", "FVLanguageFamily"));
        session.createDocument(session.createDocumentModel("/Family", "Language", "FVLanguage"));
        session.createDocument(session.createDocumentModel("/Family/Language", "Dialect", "FVDialect"));
        session.createDocument(session.createDocumentModel("/Family/Language/Dialect", "Categories", "FVCategories"));

        parentCategory1 = session.createDocumentModel("/Family/Language/Dialect/Categories", "TestParentCategory1", "FVCategory");
        parentCategory1.setPropertyValue("dc:title", "Parent Category 1");
        parentCategory1 = session.createDocument(parentCategory1);

        parentCategory2 = session.createDocumentModel("/Family/Language/Dialect/Categories", "TestParentCategory2", "FVCategory");
        parentCategory2.setPropertyValue("dc:title", "Parent Category 2");
        parentCategory2 = session.createDocument(parentCategory2);

        category = session.createDocumentModel("/Family/Language/Dialect/Categories/TestParentCategory1", "Category", "FVCategory");
        category = session.createDocument(category);
    }

    @Test
    public void updateCategory() throws OperationException {

        category.setPropertyValue("dc:title", "Category Title");
        category.setPropertyValue("dc:description", "A description of the category without a target.");

        OperationContext ctx = new OperationContext(session);
        ctx.setInput(category);

        DocumentModel doc = (DocumentModel) automationService.run(ctx, UpdateCategory.ID);
        assertEquals("A description of the category without a target.", doc.getPropertyValue("dc:description"));
    }

    @Test
    public void updateCategoryWithParameters() throws OperationException {

        category.setPropertyValue("dc:title", "Category Title");
        category.setPropertyValue("dc:description", "A description of the category with a target.");

        final String newParent = parentCategory2.getId();
        Map<String, Object> params = new HashMap<>();
        params.put("target", newParent);

        OperationContext ctx = new OperationContext(session);
        ctx.setInput(category);

        DocumentModel doc = (DocumentModel) automationService.run(ctx, UpdateCategory.ID, params);
        assertEquals("/Family/Language/Dialect/Categories/TestParentCategory2/Category", doc.getPathAsString());
    }
}
