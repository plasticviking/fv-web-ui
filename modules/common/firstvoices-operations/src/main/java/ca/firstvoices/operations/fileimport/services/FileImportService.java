package ca.firstvoices.operations.fileimport.services;

import org.nuxeo.ecm.core.api.CoreSession;

public interface FileImportService {

  void importFile(CoreSession session, String fileUrl, String filename);
}
