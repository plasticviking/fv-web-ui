package ca.firstvoices.simpleapi.services;

import ca.firstvoices.simpleapi.exceptions.NotFoundException;
import ca.firstvoices.simpleapi.exceptions.NotImplementedException;
import ca.firstvoices.simpleapi.model.AnnotationNuxeoMapper;
import ca.firstvoices.simpleapi.model.QueryBean;
import ca.firstvoices.simpleapi.representations.ArchiveDetailPublic;
import ca.firstvoices.simpleapi.representations.ArchiveOverview;
import ca.firstvoices.simpleapi.representations.Asset;
import ca.firstvoices.simpleapi.representations.Link;
import ca.firstvoices.simpleapi.representations.Phrase;
import ca.firstvoices.simpleapi.representations.Song;
import ca.firstvoices.simpleapi.representations.Story;
import ca.firstvoices.simpleapi.representations.Vocabulary;
import ca.firstvoices.simpleapi.representations.Word;
import ca.firstvoices.simpleapi.representations.containers.Metadata;
import ca.firstvoices.simpleapi.representations.containers.SearchResult;
import com.google.inject.Singleton;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.api.CloseableCoreSession;
import org.nuxeo.ecm.core.api.CoreInstance;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.platform.query.api.PageProvider;
import org.nuxeo.ecm.platform.query.api.PageProviderService;
import org.nuxeo.ecm.platform.query.nxql.CoreQueryDocumentPageProvider;
import org.nuxeo.runtime.api.Framework;
import org.nuxeo.runtime.transaction.TransactionHelper;

@Singleton
public class NuxeoFirstVoicesServiceImplementation implements FirstVoicesService {

  private static final Log LOG = LogFactory.getLog(NuxeoFirstVoicesServiceImplementation.class);

  private <V> Metadata<List<V>> buildListResponse(Class<V> resultClass, String ppName, String detailType, QueryBean queryParams, Object... params) {
    Metadata<List<V>> md = new Metadata<>();

    try {
      LoginContext login = Framework.login();
    } catch (LoginException e) {
      LOG.error(e);
    }
    TransactionHelper.startTransaction();

    try (CloseableCoreSession session = CoreInstance.openCoreSession(null)) {

      Map<String, Serializable> props = new HashMap<>();
      props.put(
          CoreQueryDocumentPageProvider.CORE_SESSION_PROPERTY,
          (Serializable) session
      );
      PageProviderService pageProviderService = Framework.getService(PageProviderService.class);

      PageProvider<DocumentModel> pageProvider = (PageProvider<DocumentModel>) pageProviderService
          .getPageProvider(ppName, null, null, null, props, params);

      pageProvider.setPageSize(queryParams.pageSize);
      pageProvider.setCurrentPage(queryParams.index);

      List<DocumentModel> results = pageProvider.getCurrentPage();
      md.setCount(pageProvider.getResultsCount());
      md.setDetailType(detailType);
      md.setStatus(pageProvider.hasError() ? "error" : "success");
      md.setDetail(results.stream().map(dm -> AnnotationNuxeoMapper.mapFrom(resultClass, dm)).collect(Collectors.toList()));

      TransactionHelper.commitOrRollbackTransaction();

      return md;
    }
  }


  private <V> Metadata<V> buildSingleResponse(
      Class<V> resultClass,
      String ppName,
      String detailType,
      boolean throwOnNotFound,
      Object... params) {
    Metadata<V> md = new Metadata<>();

    try {
      LoginContext login = Framework.login();
    } catch (LoginException e) {
      e.printStackTrace();
    }
    TransactionHelper.startTransaction();

    try (CloseableCoreSession session = CoreInstance.openCoreSession(null)) {

      Map<String, Serializable> props = new HashMap<>();
      props.put(
          CoreQueryDocumentPageProvider.CORE_SESSION_PROPERTY,
          (Serializable) session
      );
      PageProviderService pageProviderService = Framework.getService(PageProviderService.class);

      PageProvider<DocumentModel> pageProvider = (PageProvider<DocumentModel>) pageProviderService
          .getPageProvider(ppName, null, null, null, props, params);

      System.out.println("Found " + pageProvider.getResultsCount() + " results for id " + params[0].toString());

//      pageProvider.setPageSize(pageProvider.getResultsCount());
      pageProvider.setPageSize(pageProvider.getMaxPageSize());

      List<DocumentModel> results = pageProvider.getCurrentPage();

      if (results.size() == 0) {
        throw new NotFoundException();
      }
      md.setCount(pageProvider.getResultsCount());
      md.setDetailType(detailType);
      md.setStatus(pageProvider.hasError() ? "error" : "success");

      results.stream().findFirst().ifPresent(dm -> {
        md.setDetail(AnnotationNuxeoMapper.mapFrom(resultClass, dm));
      });

      TransactionHelper.commitOrRollbackTransaction();

      return md;
    }
  }


  @Override
  public Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParameters) {
    return buildListResponse(ArchiveOverview.class, "LIST_ARCHIVES_PP", "archive", queryParameters);
  }

  @Override
  public Metadata<ArchiveDetailPublic> getArchiveDetail(String archiveID) {
    return buildSingleResponse(ArchiveDetailPublic.class, "GET_ARCHIVE_PP", "archive", true, archiveID);
  }

  @Override
  public Metadata<List<Word>> getWordsInArchive(String archiveID, QueryBean queryParameters) throws NotFoundException {
    return buildListResponse(Word.class, "WORDS_IN_ARCHIVE_PP", "word", queryParameters, archiveID);
  }

  @Override
  public Metadata<List<Phrase>> getPhrasesInArchive(String archiveID, QueryBean queryParameters) {
    return buildListResponse(Phrase.class, "PHRASES_IN_ARCHIVE_PP", "phrase", queryParameters, archiveID);
  }

  @Override
  public Metadata<List<Story>> getStoriesInArchive(String archiveID, QueryBean queryParameters) {
    return buildListResponse(Story.class, "STORIES_IN_ARCHIVE_PP", "story", queryParameters, archiveID);

  }

  @Override
  public Metadata<List<Song>> getSongsInArchive(String archiveID, QueryBean queryParameters) {
    return buildListResponse(Song.class, "SONGS_IN_ARCHIVE_PP", "song", queryParameters, archiveID);
  }

  @Override
  public Metadata<List<Vocabulary>> getVocabularies(QueryBean queryParameters) {
    return buildListResponse(Vocabulary.class, "LIST_VOCABULARIES_PP", "vocabulary", queryParameters);
  }

  @Override
  public Metadata<List<String>> getSharedCategories(QueryBean queryParameters) {
    return buildListResponse(String.class, "LIST_SHARED_CATEGORIES_PP", "string", queryParameters);
  }

  @Override
  public Metadata<List<Link>> getSharedLinks(QueryBean queryParameters) {
    return buildListResponse(Link.class, "LIST_SHARED_LINKS_PP", "link", queryParameters);
  }

  @Override
  public Metadata<List<Asset>> getSharedMedia(QueryBean queryParameters) {
    return buildListResponse(Asset.class, "LIST_SHARED_ASSETS_PP", "asset", queryParameters);
  }

  @Override
  public Metadata<Asset> getSharedMediaDetail(String id) {
    return buildSingleResponse(Asset.class, "GET_SHARED_ASSET_PP", "asset", true, id);
  }

  @Override
  public Metadata<List<SearchResult<?>>> doSearch(String q, QueryBean queryParameters) {
    throw new NotImplementedException();
  }

  @Override
  public Metadata<Story> getStoryDetail(String id) {
    return buildSingleResponse(Story.class, "GET_STORY_PP", "story", true, id);
  }

  @Override
  public Metadata<Song> getSongDetail(String id) {
    return buildSingleResponse(Song.class, "GET_SONG_PP", "song", true, id);
  }

  @Override
  public Metadata<Phrase> getPhraseDetail(String id) {
    return buildSingleResponse(Phrase.class, "GET_PHRASE_PP", "phrase", true, id);
  }

  @Override
  public Metadata<Word> getWordDetail(String id) {
    return buildSingleResponse(Word.class, "GET_WORD_PP", "word", true, id);
  }

}
