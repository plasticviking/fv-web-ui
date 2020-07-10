package ca.firstvoices.simpleapi.services;


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
  public Metadata<List<SearchResult<?>>> doSearch(String q, QueryBean queryParameters) {
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
