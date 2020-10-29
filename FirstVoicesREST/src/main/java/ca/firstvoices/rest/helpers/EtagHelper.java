package ca.firstvoices.rest.helpers;

import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import org.nuxeo.ecm.core.api.DocumentModel;

public class EtagHelper {

  private EtagHelper() {

  }

  public static String computeEtag(List<DocumentModel> docs) {

    MessageDigest md;

    try {
      md = MessageDigest.getInstance("SHA-256");
    } catch (NoSuchAlgorithmException e) {
      return null;
    }

    for (DocumentModel doc : docs) {
      String ct = doc.getChangeToken();
      md.update(ct.getBytes(Charset.defaultCharset()));
    }

    return Base64.getEncoder().encodeToString(md.digest());
  }
}
