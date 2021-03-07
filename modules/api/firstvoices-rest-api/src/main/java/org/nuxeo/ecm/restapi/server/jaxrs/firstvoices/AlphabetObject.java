package org.nuxeo.ecm.restapi.server.jaxrs.firstvoices;


import ca.firstvoices.rest.data.Alphabet;
import ca.firstvoices.rest.data.Character;
import ca.firstvoices.rest.data.Word;
import java.io.Serializable;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import javax.print.Doc;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.platform.query.api.PageProvider;
import org.nuxeo.ecm.platform.query.api.PageProviderService;
import org.nuxeo.ecm.platform.query.nxql.CoreQueryDocumentPageProvider;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.DefaultObject;
import org.nuxeo.runtime.api.Framework;

@WebObject(type = "alphabet")
@Produces(MediaType.APPLICATION_JSON)
public class AlphabetObject extends DefaultObject {

  public static final String FIND_ALPHABET_PP = "FIND_ALPHABET_PP";
  public static final String FIND_CHARACTERS_IN_ALPHABET_PP = "FIND_CHARACTERS_IN_ALPHABET_PP";

  @GET
  @Path("/{dialectId}")
  public Response getAlphabet(
      @PathParam("dialectId") String id) {

    final PageProviderService pageProviderService = Framework.getService(PageProviderService.class);

    final Map<String, Serializable> props = new HashMap<>();

    final CoreSession session = getContext().getCoreSession();

    props.put(CoreQueryDocumentPageProvider.CORE_SESSION_PROPERTY, (Serializable) session);

    PageProvider<DocumentModel> pageProvider =
        (PageProvider<DocumentModel>) pageProviderService.getPageProvider(FIND_ALPHABET_PP,
            null,
            null,
            null,
            props,
            id);


    DocumentModel doc = pageProvider.getCurrentEntry();
    if (doc == null) {
      return Response.status(404).build();
    }

    Alphabet alphabet = new Alphabet(doc.getId());

    pageProvider = (PageProvider<DocumentModel>) pageProviderService.getPageProvider(
        FIND_CHARACTERS_IN_ALPHABET_PP,
        null,
        null,
        null,
        props,
        doc.getId());

    List<DocumentModel> allCharacters = new LinkedList<>();
    allCharacters.addAll(pageProvider.getCurrentPage());
    while (pageProvider.isNextPageAvailable()) {
      pageProvider.nextPage();
      allCharacters.addAll(pageProvider.getCurrentPage());
    }

    for (DocumentModel charDoc: allCharacters) {
      Character c = new Character(charDoc.getId(), charDoc.getTitle());

      Object v = charDoc.getPropertyValue("fvcharacter:related_words");
      if (v != null) {
        Word relatedWord;
      }

      alphabet.getCharacters().add(c);
    }




    // Map<String, Category> categoryMap = new HashMap<>();

    //
    //    pageProvider = (PageProvider<DocumentModel>) pageProviderService.getPageProvider(
    //        FIND_CATEGORY_IN_CATEGORIES_PP,
    //        null,
    //        null,
    //        null,
    //        props,
    //        categoriesDoc.getId());
    //
    //    List<DocumentModel> allCategories = new LinkedList<>();
    //    allCategories.addAll(pageProvider.getCurrentPage());
    //    while (pageProvider.isNextPageAvailable()) {
    //      pageProvider.nextPage();
    //      allCategories.addAll(pageProvider.getCurrentPage());
    //    }
    //
    //    String wordsInCategoryPP = FIND_WORDS_WITH_CATEGORY_PP;
    //    if (categoriesDoc.getPathAsString().toLowerCase().startsWith("/fv/sections")) {
    //      wordsInCategoryPP = FIND_WORDS_WITH_CATEGORY_PROXIED_PP;
    //    }
    //
    //    for (DocumentModel category : allCategories) {
    //
    //
    //      PageProvider<DocumentModel> wordsInCategoryPageProvider =
    //          (PageProvider<DocumentModel>) pageProviderService.getPageProvider(
    //              wordsInCategoryPP,
    //              null,
    //              null,
    //              null,
    //              props,
    //              category.getId());
    //
    //
    //      List<DocumentModel> allWords = new LinkedList<>(wordsInCategoryPageProvider
    //     .getCurrentPage());
    //      while (wordsInCategoryPageProvider.isNextPageAvailable()) {
    //        wordsInCategoryPageProvider.nextPage();
    //        allWords.addAll(wordsInCategoryPageProvider.getCurrentPage());
    //      }
    //
    //      int entryCount = allWords.size();
    //
    //      String parentId = null;
    //      DocumentRef parentDocumentRef = category.getParentRef();
    //      if (parentDocumentRef != null) {
    //        DocumentModel document = session.getDocument(parentDocumentRef);
    //        if (DialectTypesConstants.FV_CATEGORY.equals(document.getType())) {
    //          parentId = document.getId();
    //        }
    //
    //        Category c = new Category(category.getId(), parentId, category.getTitle(),
    //       entryCount);
    //        categoryMap.put(category.getId(), c);
    //      }
    //    }
    //
    //    for (final Category cat : categoryMap.values()) {
    //      if (cat.getParentId() != null && categoryMap.containsKey(cat.getParentId())) {
    //        categoryMap.get(cat.getParentId()).incrementEntryCount(cat.getEntryCount());
    //      }
    //    }
    //
    //    List<Category> list = new ArrayList<>(categoryMap.values());
    //
    //    if (inUseOnly) {
    //      list.removeIf(i -> i.getEntryCount() == 0);
    //    }

    return Response.ok(alphabet).build();

  }

}

