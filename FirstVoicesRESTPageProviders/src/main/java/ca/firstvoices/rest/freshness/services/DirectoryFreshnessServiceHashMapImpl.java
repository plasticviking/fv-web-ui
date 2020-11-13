package ca.firstvoices.rest.freshness.services;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class DirectoryFreshnessServiceHashMapImpl implements DirectoryFreshnessService {

  private final Map<String, String> serials = new HashMap<>();

  @Override
  public String getSerial(final String directoryName) {
    if (!serials.containsKey(directoryName)) {
      updateSerial(directoryName);
    }

    return serials.get(directoryName);
  }

  @Override
  public void updateSerial(final String directoryName) {
    serials.put(directoryName, UUID.randomUUID().toString());
  }
}
