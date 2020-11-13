package ca.firstvoices.rest.freshness.listeners;

import ca.firstvoices.rest.freshness.services.DirectoryFreshnessService;
import javax.inject.Inject;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.event.Event;
import org.nuxeo.ecm.core.event.EventContext;
import org.nuxeo.ecm.core.event.EventListener;
import org.nuxeo.ecm.core.event.impl.DocumentEventContext;

public class DirectoryFreshnessListener implements EventListener {

  @Inject private DirectoryFreshnessService directoryFreshnessService;

  @Override
  public void handleEvent(final Event event) {
    EventContext ctx = event.getContext();
    if (!(ctx instanceof DocumentEventContext)) {
      return;
    }

    DocumentModel doc = ((DocumentEventContext) ctx).getSourceDocument();
    if (doc == null) {
      return;
    }
    String type = doc.getType();
    if ("fv_label".equals(type)) {
      directoryFreshnessService.updateSerial(DirectoryFreshnessService.FV_LABEL_DIRECTORY);
    } else if ("fv_label_category".equals(type)) {
      directoryFreshnessService.updateSerial(DirectoryFreshnessService
          .FV_LABEL_CATEGORIES_DIRECTORY);
    }
  }

}
