package ca.firstvoices.categories.operations;

import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.core.api.*;

@Operation(id=ListSharedCategories.ID, category=Constants.CAT_DOCUMENT, label="List Shared Categories", description="Describe here what your operation does.")
public class ListSharedCategories {

    public static final String ID = "Document.ListSharedCategories";

    @Context
    protected CoreSession session;

    @OperationMethod
    public DocumentModelList run() {
        DocumentRef documentRef = new PathRef("/FV/Workspaces/SharedData/Shared Categories");
        DocumentModelList documentModel = session.getChildren(documentRef);
        return documentModel;
    }
}
