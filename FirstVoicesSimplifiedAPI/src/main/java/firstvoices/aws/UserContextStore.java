package firstvoices.aws;

import firstvoices.api.representations.User;
import javax.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class UserContextStore {
  private static final Logger log = LoggerFactory.getLogger(UserContextStore.class);

  private ThreadLocal<User> currentUser = new ThreadLocal<User>();

  public User getCurrentUser() {
    return currentUser.get();
  }

  public void setCurrentUser(User user) {
    currentUser.set(user);
  }
}
