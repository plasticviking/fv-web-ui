package ca.firstvoices.rest.freshness.services;

public interface DirectoryFreshnessService {

  static final String FV_LABEL_DIRECTORY = "fv_labels";
  static final String FV_LABEL_CATEGORIES_DIRECTORY = "fv_label_category";

  String getSerial(final String directoryName);

  void updateSerial(final String directoryName);
}
