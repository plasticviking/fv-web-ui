package ca.firstvoices.categories.operations;

import javax.inject.Inject;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.OperationException;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.test.CoreFeature;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.elasticsearch.test.RepositoryElasticSearchFeature;
import org.nuxeo.runtime.test.runner.*;

@RunWith(FeaturesRunner.class)
@Features({AutomationFeature.class, PlatformFeature.class, RuntimeFeature.class, CoreFeature.class, RepositoryElasticSearchFeature.class})
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.METHOD)

@Deploy("FirstVoicesData:OSGI-INF/ca.firstvoices.operations.xml")
@PartialDeploy(bundle = "FirstVoicesData", extensions = {TargetExtensions.ContentModel.class})
public class TestListSharedCategories {

    @Inject
    protected CoreSession session;

    @Inject
    protected AutomationService automationService;

    private DocumentModel category1;
    private DocumentModel category2;

    @Before
    public void setUp() {
        session.createDocument(session.createDocumentModel("/", "FV", "Domain"));
        session.createDocument(session.createDocumentModel("/FV", "Workspaces", "WorkspaceRoot"));
        session.createDocument(session.createDocumentModel("/FV/Workspaces", "SharedData", "Workspace"));
        session.createDocument(session.createDocumentModel("/FV/Workspaces/SharedData", "Shared Categories", "FVCategories"));
        category1 = session.createDocument(session.createDocumentModel("/FV/Workspaces/SharedData/Shared Categories", "Category", "FVCategory"));
        category2 = session.createDocument(session.createDocumentModel("/FV/Workspaces/SharedData/Shared Categories", "Category2", "FVCategory"));
    }

    @Test
    public void listCategories() throws OperationException {
        OperationContext ctx = new OperationContext(session);
        DocumentModelList documentModelList = (DocumentModelList) automationService.run(ctx, ListSharedCategories.ID);
        System.out.println("here");
        Assert.assertTrue(documentModelList.contains(category1));
        Assert.assertTrue(documentModelList.contains(category2));
    }}

