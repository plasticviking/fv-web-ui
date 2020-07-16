package ca.firstvoices.simpleapi.model;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.reflect.FieldUtils;
import org.nuxeo.ecm.core.api.DocumentModel;

public class AnnotationNuxeoMapper {

  public static <T> T mapFrom(Class<T> clazz, DocumentModel dm) {

    NuxeoMapping ax = clazz.getAnnotation(NuxeoMapping.class);
    if (ax != null) {
      try {
        NuxeoMapper<T> nuxeoMapper = (NuxeoMapper<T>) ax.mapperClass().getConstructor().newInstance();
        return nuxeoMapper.mapFrom(dm);
      } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
        e.printStackTrace();
      }
    }

    Field[] declaredFields = clazz.getDeclaredFields();
    String fields = Arrays.asList(declaredFields).stream().map(Field::getName).collect(Collectors.joining("\n"));

    try {
      T origin = clazz.getConstructor().newInstance();

      Arrays.asList(declaredFields).stream().filter(df -> Optional.ofNullable(df.getAnnotation(NuxeoMapping.class)).isPresent())
          .forEach(df -> {
            String source = df.getAnnotation(NuxeoMapping.class).sourceField();

            try {
              Object property = PropertyUtils.getProperty(dm, source);
              FieldUtils.writeField(df, origin, property, true);

            } catch (IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
              e.printStackTrace();
            }
          });

      return origin;

    } catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
      e.printStackTrace();
    }
    return null;
  }

}
