package ca.firstvoices.FVCategory.operations;

import java.io.IOException;
import java.util.Map;

import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.automation.core.util.DocumentHelper;
import org.nuxeo.ecm.core.api.ConcurrentUpdateException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentRef;

/**
 *
 */
@Operation(id=UpdateCategory.ID, category=Constants.CAT_DOCUMENT, label="Update Category", description="Set multiple properties on the input document. The properties are specified as key=value pairs separated by a new line. The key used for a property is the property xpath.")
public class UpdateCategory {

    public static final String ID = "Document.UpdateCategory";

    @Context
    protected CoreSession session;

    @Param(name = "properties")
    protected Map<String, String> properties;

    @Param(name = "target", required = false)
    protected DocumentRef target; // the path or the ID

    @Param(name = "save", required = false, values = "true")
    protected boolean save = true;


    @OperationMethod(collector = DocumentModelCollector.class)
    public DocumentModel run(DocumentModel doc) throws ConcurrentUpdateException, IOException {
        DocumentHelper.setProperties(session, doc, properties);
        if (save) {
            doc = session.saveDocument(doc); // may throw ConcurrentUpdateException if bad change token
        }
        if (target != null) {
            // update Parent Category i.e. move document
            DocumentRef src = doc.getRef();
            String name = doc.getName();
            doc = session.move(src, target, null);
        }
        return doc;
    }
}
