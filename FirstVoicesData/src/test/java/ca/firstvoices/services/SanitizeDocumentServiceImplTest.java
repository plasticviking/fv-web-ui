package ca.firstvoices.services;

import ca.firstvoices.testUtil.*;
import org.junit.Test;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.PathRef;

import static org.junit.Assert.*;

public class SanitizeDocumentServiceImplTest extends AbstractFirstVoicesDataTest {

  @Test
  public void trimWhitespaceTest() {
    // Get the DocumentModels for each of the parent documents
    DocumentModel languageFamily = session.getDocument(new PathRef("/FV/Family"));
    assertNotNull("Language family cannot be null", languageFamily);
    DocumentModel language = session.getDocument(new PathRef("/FV/Family/Language"));
    assertNotNull("Language cannot be null", language);
    DocumentModel dialect = getCurrentDialect();
    assertNotNull("Dialect cannot be null", dialect);
    DocumentModel dictionary = getCurrentDictionary();
    assertNotNull("Dictionary cannot be null", dictionary);
    
    // Create a new word & phrase document
    DocumentModel TestWord = createDocument(session, session.createDocumentModel("/FV/Family/Language/Dialect/Dictionary", " Test Word ", "FVWord"));
    DocumentModel TestPhrase = createDocument(session, session.createDocumentModel("/FV/Family/Language/Dialect/Dictionary", "  Test Phrase  ", "FVPhrase"));

    assertNotNull(TestWord);
    assertNotNull(TestPhrase);

    assertEquals(TestWord.getTitle(), " Test Word ");
    assertEquals(TestPhrase.getTitle(), "  Test Phrase  ");

    // Run the service against the word & phrase documents
    sanitizeDocumentService.sanitizeDocument(session, TestWord);
    sanitizeDocumentService.sanitizeDocument(session, TestPhrase);

    assertEquals(TestWord.getTitle(), "Test Word");
    assertEquals(TestPhrase.getTitle(), "Test Phrase");

  }

}
