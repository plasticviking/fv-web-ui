package firstvoices.services;

import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.ArchiveDetailPublic;
import firstvoices.api.representations.ArchiveOverview;
import firstvoices.api.representations.Asset;
import firstvoices.api.representations.Link;
import firstvoices.api.representations.Phrase;
import firstvoices.api.representations.Song;
import firstvoices.api.representations.Story;
import firstvoices.api.representations.Vocabulary;
import firstvoices.api.representations.Word;
import firstvoices.api.representations.containers.Metadata;
import firstvoices.api.representations.containers.SearchResult;
import java.util.List;

public abstract class AbstractFirstVoicesService implements FirstVoicesService {
  @Override
  public Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<ArchiveDetailPublic> getArchiveDetail(String archiveID) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Word>> getWordsInArchive(String archiveID, QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Phrase>> getPhrasesInArchive(String archiveID, QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Story>> getStoriesInArchive(String archiveID, QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Song>> getSongsInArchive(String archiveID, QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Vocabulary>> getVocabularies(QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<String>> getSharedCategories(QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Link>> getSharedLinks(QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<Asset>> getSharedMedia(QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<Asset> getSharedMediaDetail(String id) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<List<SearchResult>> doSearch(String q, QueryBean queryParameters) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<Story> getStoryDetail(String id) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<Song> getSongDetail(String id) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<Phrase> getPhraseDetail(String id) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Metadata<Word> getWordDetail(String id) {
    throw new UnsupportedOperationException();
  }
}
