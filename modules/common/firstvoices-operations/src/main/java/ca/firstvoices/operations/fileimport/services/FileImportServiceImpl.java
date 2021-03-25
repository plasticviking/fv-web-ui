package ca.firstvoices.operations.fileimport.services;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.OperationException;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.impl.blob.URLBlob;
import org.nuxeo.runtime.api.Framework;

public class FileImportServiceImpl implements FileImportService {

  @Override
  public void importFile(CoreSession session, String fileUrl, String filename) {
    try {
      OperationContext ctx = new OperationContext(session);
      org.nuxeo.ecm.automation.AutomationService service =
          Framework.getService(AutomationService.class);


      Blob blob = new URLBlob(new URL(fileUrl));

      blob.setFilename(filename);
      blob.setMimeType("image/jpeg");

      DocumentModel doc = session.createDocumentModel("/FV/Workspaces/Batches/BatchResources",
          filename,
          "FVPicture");
      doc.setPropertyValue("dc:title", "Imported Picture " + filename);
      doc = session.createDocument(doc);
      session.save();

      ctx.setInput(blob);

      Map<String, Object> params = new HashMap<>();

      params.put("document", doc.getPath().toString());
      params.put("xpath", "file:content");
      params.put("save", true);
      service.run(ctx, "Blob.AttachOnDocument", params);

    } catch (MalformedURLException | OperationException er) {
      throw new RuntimeException(er);
    }
  }
}
