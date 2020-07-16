package ca.firstvoices.testUtil;

import ca.firstvoices.publisher.services.FirstVoicesPublisherService;
import java.util.concurrent.TimeUnit;
import javax.inject.Inject;
import javax.inject.Singleton;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.work.api.WorkManager;
import org.nuxeo.runtime.api.Framework;
import org.nuxeo.runtime.transaction.TransactionHelper;

/**
 * @author Rob J
 *
 * The intent of this class is to move creation of test data for all modules to
 * a common location to reduce duplication.
 */
@Singleton
public class TestDataCreator {

  @Inject
  FirstVoicesPublisherService publisherService;

  public void createDialectTree(CoreSession session) throws InterruptedException {

    session.removeChildren(session.getRootDocument().getRef());
    session.save();

    session.createDocument(session.createDocumentModel("/", "FV", "Domain"));
    session.createDocument(session.createDocumentModel("/FV", "Workspaces", "WorkspaceRoot"));
    session.createDocument(session.createDocumentModel("/FV/Workspaces", "Data", "Workspace"));

    DocumentModel workspaceLanguageFamily = session.createDocument(
        session.createDocumentModel("/FV/Workspaces/Data", "Family", "FVLanguageFamily")
    );

    session.saveDocument(workspaceLanguageFamily);

    session.createDocument(
        session.createDocumentModel("/FV/Workspaces/Data/Family", "Language", "FVLanguage")
    );

    DocumentModel workspaceDialect = session.createDocument(
        session.createDocumentModel("/FV/Workspaces/Data/Family/Language", "Dialect", "FVDialect")
    );
    workspaceDialect = session.saveDocument(workspaceDialect);

    DocumentModel testCategory = session.createDocument(
        session.createDocumentModel(
            "/FV/Workspaces/Data/Family/Language/Dialect/Categories",
            "Test Category",
            "FVCategory")
    );
    session.saveDocument(testCategory);
    DocumentModel testSubCategory = session.createDocument(
        session.createDocumentModel(
            "/FV/Workspaces/Data/Family/Language/Dialect/Categories/Test Category",
            "Subcategory",
            "FVCategory"));
    session.saveDocument(testSubCategory);

    DocumentModel wsd = publisherService.publish(workspaceDialect);
    session.saveDocument(wsd);

    DocumentModel cat = publisherService.publish(testCategory);
    publisherService.publish(testSubCategory);

    session.save();

    TransactionHelper.commitOrRollbackTransaction();
    Framework.getService(WorkManager.class).awaitCompletion(10L, TimeUnit.SECONDS);
  }


}
