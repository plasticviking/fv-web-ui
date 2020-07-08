package firstvoices.services;

import firstvoices.api.representations.ArchiveOverview;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

public class MapperRegistry {

  private static Map<Class, Class<? extends ResultMapper>> map = new HashMap<>();

  static {
    map.put(ArchiveOverview.class, ArchiveOverviewMapper.class);
  }

  public static <T> ResultMapper<T> mapper(Class<T> mappedClass) {
    try {
      return (ResultMapper<T>) map.get(mappedClass).getConstructors()[0].newInstance();
    } catch (InstantiationException | IllegalAccessException | InvocationTargetException e) {
      throw new RuntimeException(e);
    }
  }

  ;
}
