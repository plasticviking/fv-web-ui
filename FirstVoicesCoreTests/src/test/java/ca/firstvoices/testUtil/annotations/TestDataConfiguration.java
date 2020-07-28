package ca.firstvoices.testUtil.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface TestDataConfiguration {
  boolean createDialectTree() default false;

  String[] classPathYAML() default {};
}
