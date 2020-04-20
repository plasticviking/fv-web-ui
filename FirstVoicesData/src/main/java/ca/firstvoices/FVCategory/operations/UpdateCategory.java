package ca.firstvoices.FVCategory.operations;

import java.io.IOException;

import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.ConcurrentUpdateException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.IdRef;

/**
 *
 */
@Operation(id = UpdateCategory.ID, category = Constants.CAT_DOCUMENT, label = "Update Category", description = "Set multiple properties on the input document. Move document to new target location.")
public class UpdateCategory {

    public static final String ID = "Document.UpdateCategory";

    @Context
    protected CoreSession session;

    @Param(name = "target", required = false)
    protected String target; // the path or the ID

    @OperationMethod(collector = DocumentModelCollector.class)
    public DocumentModel run(DocumentModel doc) throws ConcurrentUpdateException, IOException {

        doc = session.saveDocument(doc); // may throw ConcurrentUpdateException if bad change token

        if (target != null) {
            IdRef targetRef = new IdRef(target);
            // update Parent Category i.e. move document
            DocumentRef src = doc.getRef();
            doc = session.move(src, targetRef, null);
        }
        return doc;
    }
}
