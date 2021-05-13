package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;

import ca.firstvoices.core.io.utils.StateUtils;
import ca.firstvoices.rest.data.SearchResult;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;
import org.elasticsearch.search.SearchHit;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.webengine.model.impl.DefaultObject;
import org.nuxeo.elasticsearch.fetcher.EsFetcher;

public abstract class AbstractSearchlikeObject extends DefaultObject {

  protected static final String ECM_PRIMARY_TYPE = "ecm:primaryType";

  protected static String getFriendlyType(DocumentModel dm) {

    switch (dm.getType()) {
      case "FVBook":
        return Optional.ofNullable(dm.getPropertyValue("fvbook:type")).orElse("book").toString();
      case "FVPhrase":
        return "phrase";
      case "FVWord":
        return "word";
      default:
        return "unknown";
    }

  }

  public static class ElasticSearchResultConsumer implements EsFetcher.HitDocConsumer {

    private CoreSession session;
    private Predicate<DocumentModel> exactMatchP;

    public ElasticSearchResultConsumer(CoreSession session, Predicate<DocumentModel> exactMatchP) {
      this.session = session;
      this.exactMatchP = exactMatchP;
    }

    private List<SearchResult> rez = new LinkedList<>();

    @Override
    public void accept(
        final SearchHit fields, final DocumentModel d) {

      if (d.isTrashed()) {
        return;
      }

      SearchResult sr = new SearchResult();
      sr.setId(d.getId());
      sr.setTitle(d.getTitle());
      sr.setPath(d.getPathAsString());

      // find the parent dialect, if there is one
      List<DocumentModel> parents = session.getParentDocuments(d.getRef());

      Optional.ofNullable(parents).orElse(new ArrayList<>()).stream().filter(p -> p
          .getType()
          .equalsIgnoreCase("FVDialect")).findFirst().ifPresent(p -> sr.setParentDialect(p.getId(),
          p.getName(),
          (String) p.getPropertyValue("fvdialect:short_url")));

      // need to load it from the DB to get the required fields
      DocumentModel dbDoc = session.getDocument(d.getRef());
      sr.setType(AbstractSearchlikeObject.getFriendlyType(dbDoc));

      Object audio = dbDoc.getPropertyValue("fv:related_audio");
      if (audio != null) {
        if (audio instanceof String) {
          sr.getAudio().add((String) audio);
        }
        if (audio instanceof List) {
          for (Object s : (List) audio) {
            if (s != null) {
              if (s instanceof String) {
                sr.getAudio().add((String) s);
              } else {
                sr.getAudio().add(s.toString());
              }
            }
          }
        }
        if (audio instanceof Object[]) {
          for (Object s : (Object[]) audio) {
            if (s != null) {
              if (s instanceof String) {
                sr.getAudio().add((String) s);
              } else {
                sr.getAudio().add(s.toString());
              }
            }
          }
        }
      }

      List<Map<String, String>> definitions = (List<Map<String, String>>) dbDoc.getPropertyValue(
          "fv:definitions");

      for (Map<String, String> definition : definitions) {
        if (definition.containsKey("translation")) {
          String translation = definition.get("translation");
          sr.getTranslations().add(translation);
        }
      }
      if (this.exactMatchP != null) {
        sr.setExactMatch(this.exactMatchP.test(dbDoc));
      }

      if (fields != null) {
        sr.setScore(fields.getScore());
      }

      if (this.exactMatchP != null) {
        sr.setExactMatch(this.exactMatchP.test(dbDoc));
      }

      sr.setVisibility(StateUtils.stateToVisibility(dbDoc.getCurrentLifeCycleState()));

      rez.add(sr);
    }

    public List<SearchResult> getResults() {
      return rez;
    }
  }
}
