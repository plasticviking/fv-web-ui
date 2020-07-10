package ca.firstvoices.simpleapi.services;

public interface MapperRegistry {
  <T> ResultMapper<T> mapper(Class<T> mappedClass);
}
