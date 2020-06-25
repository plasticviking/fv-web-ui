package firstvoices.services;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import firstvoices.api.FirstVoicesModule.NuxeoHost;
import firstvoices.api.FirstVoicesModule.NuxeoPassword;
import firstvoices.api.FirstVoicesModule.NuxeoUsername;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.ArchiveDetailPublic;
import firstvoices.api.representations.ArchiveOverview;
import firstvoices.api.representations.Asset;
import firstvoices.api.representations.Link;
import firstvoices.api.representations.Phrase;
import firstvoices.api.representations.Song;
import firstvoices.api.representations.Story;
import firstvoices.api.representations.Vocabulary;
import firstvoices.api.representations.VocabularyEntry;
import firstvoices.api.representations.Word;
import firstvoices.api.representations.containers.Metadata;
import firstvoices.api.representations.containers.SearchResult;
import firstvoices.api.representations.traits.Translatable;
import java.net.URL;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.nuxeo.client.NuxeoClient;
import org.nuxeo.client.objects.Document;
import org.nuxeo.client.objects.Documents;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class NuxeoFirstVoicesServiceImplementation implements FirstVoicesService {
  private static final Logger log = LoggerFactory.getLogger(NuxeoFirstVoicesServiceImplementation.class);

  private final String username, password, host;

  @Inject
  public NuxeoFirstVoicesServiceImplementation(
      @NuxeoHost String host,
      @NuxeoUsername String username,
      @NuxeoPassword String password
  ) {
    this.host = host;
    this.username = username;
    this.password = password;
  }

  private NuxeoClient getConnection() {
    return (new NuxeoClient.Builder())
        .url(this.host)
        .authentication(this.username, this.password)
        .schemas("*").readTimeout(100000).
            connect();
  }


  private Asset resolveAssetDetails(String assetID) {
    final String QUERY = "SELECT * FROM Document where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, assetID);
    Documents result = this.getConnection().repository().query(parameterizedQuery);

    if (result.getResultsCount() != 1)
      return null;

    Asset a = new Asset();
    Document d = result.getDocuments().get(0);
    try {
      a.setId(d.getUid());
      Map<String, String> content = d.getPropertyValue("file:content");

      a.setTitle(d.getPropertyValue("dc:title"));
      a.setUrl(new URL(content.get("data")));
      a.setSize(Long.parseLong(content.get("length")));
      a.setContentType(content.get("mime-type"));

      a.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      a.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

    } catch (Exception e) {
      log.error("Error hydrating asset", e);
    }

    return a;
  }

  @Override
  public Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVDialect, FVLanguage, FVLanguageFamily where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/Data'";
    Documents result = this.getConnection().repository().query(QUERY, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<ArchiveOverview>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("archive");
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      ArchiveOverview obj = new ArchiveOverview();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());
      obj.setType(d.getType());
      return obj;
    }).collect(Collectors.toList()));
    return md;
  }

  @Override
  public Metadata<ArchiveDetailPublic> getArchiveDetail(String archiveID) {
    return null;
  }

  @Override
  public Metadata<List<Word>> getWordsInArchive(String archiveID, QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVWord where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:ancestorId = '%s'";
    String parameterizedQuery = String.format(QUERY, archiveID);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Word>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("word");
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Word obj = new Word();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      d.getProperties().get("fv-word:part_of_speech");
      VocabularyEntry ve = new VocabularyEntry();
      ve.setName(d.getPropertyValue("fv-word:part_of_speech"));
      obj.setPartOfSpeech(ve);

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).collect(Collectors.toList()));

    return md;
  }

  @Override
  public Metadata<List<Phrase>> getPhrasesInArchive(String archiveID, QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVPhrase where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:ancestorId = '%s'";
    String parameterizedQuery = String.format(QUERY, archiveID);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Phrase>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("phrase");
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Phrase obj = new Phrase();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).collect(Collectors.toList()));

    return md;
  }

  @Override
  public Metadata<List<Story>> getStoriesInArchive(String archiveID, QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVStory where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:ancestorId = '%s'";
    String parameterizedQuery = String.format(QUERY, archiveID);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Story>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("story");
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Story obj = new Story();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).collect(Collectors.toList()));

    return md;
  }

  @Override
  public Metadata<List<Song>> getSongsInArchive(String archiveID, QueryBean queryParameters) {

    final String QUERY = "SELECT * FROM FVSong where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:ancestorId = '%s'";
    String parameterizedQuery = String.format(QUERY, archiveID);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Song>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("song");
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Song obj = new Song();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);
            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).collect(Collectors.toList()));

    return md;

  }

  @Override
  public Metadata<List<Vocabulary>> getVocabularies(QueryBean queryParameters) {
    return null;
  }

  @Override
  public Metadata<List<String>> getSharedCategories(QueryBean queryParameters) {

    final String QUERY = "SELECT * FROM Documents where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/SharedData/Shared Categories'";
    String parameterizedQuery = String.format(QUERY);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<String>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("string");

    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(Document::getTitle).collect(Collectors.toList()));

    return md;

  }

  @Override
  public Metadata<List<Link>> getSharedLinks(QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVLink where ecm:isTrashed = 0 and ecm:path STARTSWITH '/FV/sections/SharedData/Shared Links'";
    String parameterizedQuery = String.format(QUERY); // and ecm:isVersion = 0
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Link>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("link");

    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Link l = new Link();
      l.setId(d.getUid());
      l.setTitle(d.getTitle());

      try {
        Map<String, String> content = d.getPropertyValue("file:content");
        l.setHref(new URL(content.get("data")));
      } catch (Exception e) {
        log.error("Error hydrating asset", e);
      }

      d.getProperties().forEach((k, v) -> {
        System.out.println("k " + k + " = " + v);
      });
      return l;
    }).collect(Collectors.toList()));

    return md;

  }

  @Override
  public Metadata<List<Asset>> getSharedMedia(QueryBean queryParameters) {
    final String QUERY = "SELECT * FROM FVAudio,FVPhoto,FVVideo where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/SharedData/Shared Resources/'";
    String parameterizedQuery = String.format(QUERY);
    Documents result = this.getConnection().repository().query(parameterizedQuery, "" + queryParameters.pageSize, "" + queryParameters.index, null, null, null, null);
    Metadata<List<Asset>> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("asset");

    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Asset a = this.resolveAssetDetails(d.getUid());
      Asset.AssetType type;
      switch (d.getType()) {
        case "FVPicture":
          type = Asset.AssetType.PHOTO;
          break;
        case "FVAudio":
          type = Asset.AssetType.AUDIO;
          break;
        case "FVVideo":
          type = Asset.AssetType.VIDEO;
          break;
        default:
          type = Asset.AssetType.UNKNOWN;

      }
      a.setType(type);
      a.setTitle(d.getTitle());
      return a;
    }).collect(Collectors.toList()));

    return md;
  }

  @Override
  public Metadata<Asset> getSharedMediaDetail(String id) {
    log.warn("processing media get request");

    final String QUERY = "SELECT * FROM FVAudio,FVPhoto,FVVideo where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, id);
    Documents result = this.getConnection().repository().query(parameterizedQuery);
    Metadata<Asset> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("asset");

    if (result.getResultsCount() != 1) {
      md.setStatus("failure");
      return md;
    }
    md.setStatus(result.hasError() ? "error" : "success");

    md.setDetail(result.getDocuments().stream().map(d -> {
      Asset a = this.resolveAssetDetails(d.getUid());
      Asset.AssetType type;
      switch (d.getType()) {
        case "FVPicture":
          type = Asset.AssetType.PHOTO;
          break;
        case "FVAudio":
          type = Asset.AssetType.AUDIO;
          break;
        case "FVVideo":
          type = Asset.AssetType.VIDEO;
          break;
        default:
          type = Asset.AssetType.UNKNOWN;

      }
      a.setType(type);
      a.setTitle(d.getTitle());
      return a;
    }).findFirst().get());

    return md;

  }

  @Override
  public Metadata<List<SearchResult>> doSearch(String q, QueryBean queryParameters) {
    return null;
  }
//
//	@Cached("tout")
//	public List<HashMap> dumpEverything() {
//		final String QUERY = "SELECT * FROM Document where ecm:isTrashed = 0 and ecm:isVersion = 0";
//		String parameterizedQuery = String.format(QUERY);
//
//		return this.getConnection().repository().query(parameterizedQuery).getDocuments().stream().map(d -> {
//			HashMap obj = new HashMap();
//			obj.put("type", d.getType());
//			obj.put("title", d.getTitle());
//			obj.put("id", d.getUid());
//
//			d.getProperties().forEach((k, v) -> {
//				obj.put(k, v);
//			});
//
//
//			return obj;
//		}).collect(Collectors.toList());
//	}

  @Override
  public Metadata<Story> getStoryDetail(String id) {
    final String QUERY = "SELECT * FROM FVStory where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, id);
    Documents result = this.getConnection().repository().query(parameterizedQuery);
    Metadata<Story> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("story");

    if (result.getResultsCount() != 1) {
      md.setStatus("failure");
      return md;
    }
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Story obj = new Story();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      d.getProperties().get("fv-word:part_of_speech");

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).findFirst().get());

    return md;

  }

  @Override
  public Metadata<Song> getSongDetail(String id) {
    final String QUERY = "SELECT * FROM FVSong where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, id);
    Documents result = this.getConnection().repository().query(parameterizedQuery);
    Metadata<Song> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("song");

    if (result.getResultsCount() != 1) {
      md.setStatus("failure");
      return md;
    }
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Song obj = new Song();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).findFirst().get());

    return md;

  }

  //@todo
  @Override
  public Metadata<Phrase> getPhraseDetail(String id) {
    final String QUERY = "SELECT * FROM FVPhrase where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, id);
    Documents result = this.getConnection().repository().query(parameterizedQuery);
    Metadata<Phrase> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("phrase");

    if (result.getResultsCount() != 1) {
      md.setStatus("failure");
      return md;
    }
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Phrase obj = new Phrase();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).findFirst().get());

    return md;
  }

  @Override
  public Metadata<Word> getWordDetail(String id) {
    final String QUERY = "SELECT * FROM FVWord where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:uuid = '%s'";
    String parameterizedQuery = String.format(QUERY, id);
    Documents result = this.getConnection().repository().query(parameterizedQuery);
    Metadata<Word> md = new Metadata<>();
    md.setCount(result.getResultsCount());
    md.setDetailType("word");

    if (result.getResultsCount() != 1) {
      md.setStatus("failure");
      return md;
    }
    md.setStatus(result.hasError() ? "error" : "success");
    md.setDetail(result.getDocuments().stream().map(d -> {
      Word obj = new Word();
      obj.setTitle(d.getTitle());
      obj.setId(d.getUid());

      d.getProperties().get("fv-word:part_of_speech");
      VocabularyEntry ve = new VocabularyEntry();
      ve.setName(d.getPropertyValue("fv-word:part_of_speech"));
      obj.setPartOfSpeech(ve);

      Optional<List<String>> categories = Optional.ofNullable(d.getPropertyValue("fv-word:categories"));
      categories.ifPresent(c -> obj.getCategories().addAll(c));
      Optional<List<String>> culturalNotes = Optional.ofNullable(d.getPropertyValue("fv:cultural_note"));
      culturalNotes.ifPresent(c -> obj.getCulturalNotes().addAll(c));

      Optional<List<String>> contributors = Optional.ofNullable(d.getPropertyValue("dc:contributors"));
      contributors.ifPresent(c -> obj.getContributors().addAll(c));

      Optional<List<String>> relatedPictures = Optional.ofNullable(d.getPropertyValue("fv:related_pictures"));
      relatedPictures.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.PHOTO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedAudio = Optional.ofNullable(d.getPropertyValue("fv:related_audio"));
      relatedAudio.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.AUDIO);
            return a;
          }).collect(Collectors.toSet())
      ));
      Optional<List<String>> relatedVideo = Optional.ofNullable(d.getPropertyValue("fv:related_video"));
      relatedVideo.ifPresent(c -> obj.getAssets().addAll(
          c.stream().map(s -> {
            Asset a = this.resolveAssetDetails(s);

            a.setType(Asset.AssetType.VIDEO);
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> definitions = Optional.ofNullable(d.getPropertyValue("fv:definitions"));
      definitions.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            return a;
          }).collect(Collectors.toSet())
      ));

      Optional<List<Map<String, String>>> literalTranslations = Optional.ofNullable(d.getPropertyValue("fv:literal_translation"));
      literalTranslations.ifPresent(c -> obj.getTranslations().addAll(
          c.stream().map(s -> {
            Translatable.Translation a = new Translatable.Translation();
            a.setLanguage(s.get("language"));
            a.setTranslation(s.get("translation"));
            a.setLiteral(true);
            return a;
          }).collect(Collectors.toSet())
      ));

      obj.setModified(Instant.parse(d.getPropertyValue("dc:modified")));
      obj.setCreated(Instant.parse(d.getPropertyValue("dc:created")));

      return obj;
    }).findFirst().get());

    return md;

  }
}
