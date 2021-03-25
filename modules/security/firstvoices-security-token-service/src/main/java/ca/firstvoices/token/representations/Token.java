package ca.firstvoices.token.representations;

import java.util.HashSet;
import java.util.Set;

public class Token {

  private String username;
  private final Set<String> groups = new HashSet<>();

  public Set<String> getGroups() {
    return groups;
  }

  public String getUsername() {
    return username;
  }

  public Token(final String username) {
    this.username = username;
  }
}
