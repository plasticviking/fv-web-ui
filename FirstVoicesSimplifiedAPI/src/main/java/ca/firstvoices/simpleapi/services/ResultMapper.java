package ca.firstvoices.simpleapi.services;

import org.nuxeo.ecm.core.api.DocumentModel;

public interface ResultMapper<T> {
  T map(DocumentModel dm);
}