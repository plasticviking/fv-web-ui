package ca.firstvoices.simpleapi.services;

import ca.firstvoices.simpleapi.representations.ArchiveOverview;
import org.nuxeo.ecm.core.api.DocumentModel;

public class ArchiveOverviewMapper implements ResultMapper<ArchiveOverview> {

  @Override
  public ArchiveOverview map(DocumentModel dm) {
    ArchiveOverview obj = new ArchiveOverview();
    obj.setTitle(dm.getTitle());
    obj.setId(dm.getId());
    obj.setType(dm.getType());
    return obj;
  }
}
