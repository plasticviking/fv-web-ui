package ca.firstvoices.testUtil.helpers;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TestDataYAMLBean {
  private String name;
  private String type;
  private boolean publish = false;
  private String path;
  private String publishPath;

  public TestDataYAMLBean() {

  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public boolean isPublish() {
    return publish;
  }

  public void setPublish(boolean publish) {
    this.publish = publish;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getPublishPath() {
    return publishPath;
  }

  public void setPublishPath(String publishPath) {
    this.publishPath = publishPath;
  }

  public Map<String, String> getProperties() {
    return properties;
  }

  public void setProperties(Map<String, String> properties) {
    this.properties = properties;
  }

  private Map<String, String> properties;

  List<TestDataYAMLBean> children = new LinkedList<>();

  public List<TestDataYAMLBean> getChildren() {
    return children;
  }

  public void setChildren(List<TestDataYAMLBean> children) {
    this.children = children;
  }

  @Override
  public String toString() {
    return "TestDataYAMLBean{" +
        "name='" + name + '\'' +
        ", type='" + type + '\'' +
        ", publish=" + publish +
        ", path='" + path + '\'' +
        ", publishPath='" + publishPath + '\'' +
        ", properties=" + properties +
        ", children=[" + children.stream().map(TestDataYAMLBean::toString).collect(Collectors.joining(", ")) + "]" +
    '}';
  }
}
