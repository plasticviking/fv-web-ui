package ca.firstvoices.simpleapi.services;

import ca.firstvoices.simpleapi.representations.ArchiveOverview;
import com.google.inject.Singleton;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

@Singleton
public class MapperRegistryImpl implements MapperRegistry {

  private Map<Class, Class<? extends ResultMapper>> map = new HashMap<>();

  public MapperRegistryImpl() {
//    map.put(ArchiveOverview.class, ArchiveOverviewMapper.class);
  }

  @Override
  public <T> ResultMapper<T> mapper(Class<T> mappedClass) {
    try {
      return (ResultMapper<T>) map.get(mappedClass).getConstructors()[0].newInstance();
    } catch (InstantiationException | IllegalAccessException | InvocationTargetException e) {
      throw new RuntimeException(e);
    }
  }

}
