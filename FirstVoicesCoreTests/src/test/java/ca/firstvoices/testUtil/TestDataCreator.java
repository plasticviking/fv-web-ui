package ca.firstvoices.testUtil;

import ca.firstvoices.publisher.services.FirstVoicesPublisherService;
import ca.firstvoices.testUtil.helpers.TestDataYAMLBean;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.inject.Inject;
import javax.inject.Singleton;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.PathRef;
import org.nuxeo.ecm.core.work.api.WorkManager;
import org.nuxeo.runtime.api.Framework;
import org.nuxeo.runtime.transaction.TransactionHelper;

/**
 * @author Rob J
 * <p>
 * The intent of this class is to move creation of test data for all modules to
 * a common location to reduce duplication.
 */
@Singleton
public class TestDataCreator {

  @Inject
  FirstVoicesPublisherService publisherService;

  public void createDialectTree(CoreSession session) throws InterruptedException {

    publishedDialects.clear();
    publishedCategories.clear();

    session.removeChildren(session.getRootDocument().getRef());
    session.save();

    session.createDocument(session.createDocumentModel("/", "FV", "Domain"));
    session.createDocument(session.createDocumentModel("/FV", "Workspaces", "WorkspaceRoot"));
    session.createDocument(session.createDocumentModel("/FV/Workspaces", "Data", "Workspace"));
    session.createDocument(session.createDocumentModel("/FV", "sections", "WorkspaceRoot"));
    DocumentModel dataRoot = session.createDocument(session.createDocumentModel("/FV/sections", "Data", "Workspace"));


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
    DocumentModel publishedDialect = publisherService.publishDocument(session, workspaceDialect, dataRoot);
//    DocumentModel publishedDialect = publisherService.publish(workspaceDialect);
//    session.saveDocument(publishedDialect);
    publishedDialects.add(publishedDialect.getId());

    DocumentModel cat = publisherService.publish(testCategory);
    DocumentModel publishedCat = publisherService.publish(testSubCategory);
    publishedCategories.add(publishedCat.getId());

    session.save();

    DocumentModelList list = session.query("SELECT * FROM FVDialect, FVLanguage, FVLanguageFamily where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/Data'");
    String s = list.stream().map(dm -> ("document " + dm.getType() + ":" + dm.getPathAsString() + ":" + dm.getTitle() + ":" + dm.getId())).collect(Collectors.joining("\n"));
    System.out.println("Generated tree:\n" + s);

    TransactionHelper.commitOrRollbackTransaction();
    Framework.getService(WorkManager.class).awaitCompletion(10L, TimeUnit.SECONDS);
  }

  public void parseYamlDirectives(CoreSession session, List<TestDataYAMLBean> inputs) {
    if (TransactionHelper.isNoTransaction()) {
      TransactionHelper.startTransaction();
    }


    System.out.println("dumping mapped");
    List<TestDataYAMLBean> mapped = inputs.stream().flatMap(FunctionalFlattener::flattener).peek(System.out::println).collect(Collectors.toList());

    mapped.stream().forEach(input -> {
      DocumentModel document = session.createDocument(session.createDocumentModel(input.getPath(), input.getName(), input.getType()));
      if (input.isPublish()) {
        DocumentModel parent = session.getDocument(new PathRef(input.getPublishPath()));
        publisherService.publishDocument(session, document, parent);
      }
      session.save();
    });
    TransactionHelper.commitOrRollbackTransaction();
  }

  private final Set<String> publishedDialects = new HashSet<>();
  private final Set<String> publishedCategories = new HashSet<>();

  public Set<String> getPublishedCategories() {
    return Collections.unmodifiableSet(publishedCategories);
  }

  public Set<String> getPublishedDialects() {
    return Collections.unmodifiableSet(publishedDialects);
  }

  static class FunctionalFlattener {
    public static Stream<TestDataYAMLBean> flattener(TestDataYAMLBean i) {
      return Stream.concat(Stream.of(i), i.getChildren().stream().map(c -> {
        c.setPath(i.getPath() + (i.getPath().endsWith("/") ? "" : "/") + i.getName());
        if (i.getPublishPath() != null) {
          c.setPublishPath(i.getPublishPath() + (i.getPublishPath().endsWith("/") ? "" : "/") + i.getName());
          c.setPublish(i.isPublish());
        }
        return c;
      }).flatMap(FunctionalFlattener::flattener));
    }
  }
}


