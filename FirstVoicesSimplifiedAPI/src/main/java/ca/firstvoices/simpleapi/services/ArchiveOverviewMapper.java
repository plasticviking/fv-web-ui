package ca.firstvoices.simpleapi.services;

import ca.firstvoices.simpleapi.model.NuxeoMapper;
import ca.firstvoices.simpleapi.representations.ArchiveOverview;
import org.nuxeo.ecm.core.api.DocumentModel;

public class ArchiveOverviewMapper implements NuxeoMapper<ArchiveOverview> {

  @Override
  public ArchiveOverview mapFrom(DocumentModel dm) {
    ArchiveOverview obj = new ArchiveOverview();
    obj.setTitle(dm.getTitle());
    obj.setId(dm.getId());
    obj.setType(dm.getType());
    return obj;
  }
}
