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

public interface FirstVoicesService {

  Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParameters);

  Metadata<ArchiveDetailPublic> getArchiveDetail(String archiveID);

  Metadata<List<Word>> getWordsInArchive(String archiveID, QueryBean queryParameters);

  Metadata<List<Phrase>> getPhrasesInArchive(String archiveID, QueryBean queryParameters);

  Metadata<List<Story>> getStoriesInArchive(String archiveID, QueryBean queryParameters);

  Metadata<List<Song>> getSongsInArchive(String archiveID, QueryBean queryParameters);

  Metadata<List<Vocabulary>> getVocabularies(QueryBean queryParameters);

  Metadata<List<String>> getSharedCategories(QueryBean queryParameters);

  Metadata<List<Link>> getSharedLinks(QueryBean queryParameters);

  Metadata<List<Asset>> getSharedMedia(QueryBean queryParameters);

  Metadata<Asset> getSharedMediaDetail(String id);

  Metadata<List<SearchResult>> doSearch(String q, QueryBean queryParameters);

  Metadata<Story> getStoryDetail(String id);

  Metadata<Song> getSongDetail(String id);

  //@todo
  Metadata<Phrase> getPhraseDetail(String id);

  Metadata<Word> getWordDetail(String id);

}
