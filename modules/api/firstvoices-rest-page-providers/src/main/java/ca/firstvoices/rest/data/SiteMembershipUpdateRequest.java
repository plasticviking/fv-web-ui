package ca.firstvoices.rest.data;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

public class SiteMembershipUpdateRequest implements Serializable {
  public static String ACCEPT = "ACCEPT";
  public static String IGNORE = "IGNORE";

  private final String messageToUser;
  private final String newStatus;

  public SiteMembershipUpdateRequest(final String newStatus, final String messageToUser) {
    this.messageToUser = messageToUser;
    this.newStatus = newStatus;

    // an Enum would be better, but harder to make play nice with Nuxeo
    List<String> validStatuses = Arrays.asList(ACCEPT, IGNORE);
    if (validStatuses.stream().noneMatch(s -> s.equals(this.newStatus))) {
      throw new IllegalArgumentException("Invalid status");
    }
  }

  public String getMessageToUser() {
    return messageToUser;
  }

  public String getNewStatus() {
    return newStatus;
  }
}
