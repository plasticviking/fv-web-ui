package firstvoices.api;

import com.google.inject.AbstractModule;
import com.google.inject.BindingAnnotation;
import firstvoices.services.FirstVoicesService;
import firstvoices.services.NuxeoFirstVoicesServiceImplementation;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class FirstVoicesModule extends AbstractModule {

  private static String getEnv(String key, String fallback, boolean raiseException) {
    final String v = System.getenv(key);
    if (v == null) {
      if (raiseException) {
        throw new RuntimeException("" + key + " is required in the environment");
      } else {
        return fallback;
      }
    }
    return v;
  }

  private static String getEnv(String key, String fallback) {
    return getEnv(key, fallback, false);
  }

  private static final Log log = LogFactory.getLog(FirstVoicesModule.class);

  @Override
  protected void configure() {
    log.error("Config start");
    log.fatal("fatal start");
    System.err.println("FirstVoicesModule Configuring");

    bind(FirstVoicesService.class).to(NuxeoFirstVoicesServiceImplementation.class);

    bindConstant().annotatedWith(NuxeoHost.class).to(getEnv("NUXEO_HOST", "http://127.0.0.01/"));
    bindConstant().annotatedWith(NuxeoUsername.class).to(getEnv("NUXEO_USERNAME", ""));
    bindConstant().annotatedWith(NuxeoPassword.class).to(getEnv("NUXEO_PASSWORD", ""));
    bindConstant().annotatedWith(JWKSUrl.class).to(getEnv("JWKS_URL", "http://127.0.0.1:4000/"));
    System.err.println("FirstVoicesModule Configured");
  }

  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @BindingAnnotation
  public static @interface NuxeoHost {
  }

  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @BindingAnnotation
  public static @interface NuxeoUsername {
  }

  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @BindingAnnotation
  public static @interface NuxeoPassword {
  }

  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @BindingAnnotation
  public static @interface JWKSUrl {
  }
}
