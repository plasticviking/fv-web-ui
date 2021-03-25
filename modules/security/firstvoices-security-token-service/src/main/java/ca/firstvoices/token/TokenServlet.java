package ca.firstvoices.token;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;
import javax.crypto.SecretKey;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpHeaders;
import org.apache.http.entity.ContentType;
import org.nuxeo.ecm.core.api.NuxeoPrincipal;

public class TokenServlet extends HttpServlet {

  private static final Logger log = Logger.getLogger(TokenServlet.class.getCanonicalName());

  public TokenServlet() {
    log.info("token servlet instantiated");
  }

  @Override
  protected void doGet(
      final HttpServletRequest req, final HttpServletResponse resp)
      throws ServletException, IOException {
    log.info("doGet");
    try {


      Date expiration = new Date(System.currentTimeMillis() + 1000 * 60 * 5); // 5 minutes
      Date notBefore = new Date(System.currentTimeMillis() - 15000); // clock sync window

      byte[] keyBytes =
          Base64
              .decodeBase64("b0Dd1pxJp+pIGA4uqNgNdtQw9N7DaD1F9BSum9QTBMc="
              .getBytes(StandardCharsets.UTF_8));

      SecretKey key = Keys.hmacShaKeyFor(keyBytes);

      final AtomicReference<String> principal = new AtomicReference<>("unknown");
      List<String> groups = new ArrayList<>();
      try {
        Optional.ofNullable(req.getSession()).ifPresent(session -> {
          NuxeoPrincipal np = (NuxeoPrincipal) session.getAttribute("currentNuxeoPrincipal");
          if (np != null) {
            principal.set(np.getName());
            groups.addAll(np.getAllGroups());
          }
        });

      } catch (Exception e) {
        log.severe(e::toString);
      }

      if (!principal.get().equals("unknown")) {
        resp.setStatus(200);
        resp.setHeader(HttpHeaders.CONTENT_TYPE, ContentType.APPLICATION_JSON.toString());
      } else {
        resp.sendError(401);
        return;
      }

      Map<String, Object> claims = new HashMap<>();
      claims.put("groups", groups);

      String jwt =
          Jwts
              .builder()
              .setSubject(principal.get())
              .setExpiration(expiration)
              .setNotBefore(notBefore)
              .setIssuedAt(new Date())
              .setIssuer("firstvoices")
              .addClaims(claims)
              .signWith(key)
              .compact();

      byte[] responseBuffer = jwt.getBytes(StandardCharsets.UTF_8);
      ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(responseBuffer);
      IOUtils.copy(byteArrayInputStream, resp.getOutputStream());
    } catch (Exception e) {
      log.severe(e::toString);
    }
    log.info("doGet finished");
  }
}
