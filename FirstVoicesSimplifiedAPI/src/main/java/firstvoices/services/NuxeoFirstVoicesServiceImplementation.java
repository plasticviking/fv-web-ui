package firstvoices.services;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.ArchiveOverview;
import firstvoices.api.representations.containers.Metadata;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.security.auth.login.LoginContext;
import javax.security.auth.login.LoginException;
import org.nuxeo.ecm.core.api.CloseableCoreSession;
import org.nuxeo.ecm.core.api.CoreInstance;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.UnrestrictedSessionRunner;
import org.nuxeo.ecm.platform.query.nxql.CoreQueryUnrestrictedSessionRunner;
import org.nuxeo.ecm.webengine.WebEngine;
import org.nuxeo.runtime.api.Framework;
import org.nuxeo.runtime.transaction.TransactionHelper;

@Singleton
public class NuxeoFirstVoicesServiceImplementation extends AbstractFirstVoicesService {
//  private static final Logger log = LogManager.getLogger("NuxeoFirstVoicesServiceImplementation");


  @Override
  public Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParams) {
//    List<ArchiveOverview> l = new ArrayList<>();
//    ArchiveOverview ao = new ArchiveOverview();
//    ao.setTitle("al1");
//    l.add(ao);
//    Metadata<List<ArchiveOverview>> m = new Metadata<>();
//    m.setDetail(l);
//    m.setCount(1);
//    m.setStatus("ok");
//    return m;
//  }
    final String QUERY = "SELECT * FROM FVDialect, FVLanguage, FVLanguageFamily where ecm:isTrashed = 0 and ecm:isVersion = 0 and ecm:path STARTSWITH '/FV/sections/Data'";
//    UnrestrictedSessionRunner esr = new UnrestrictedSessionRunner(getDefaultRepositoty) {
//      @Override
//      public void run() {
//
//      }
//    };
//
//
    try {
      LoginContext login = Framework.login();
    } catch (LoginException e) {
      e.printStackTrace();
    }
    TransactionHelper.startTransaction();

    try (CloseableCoreSession session = CoreInstance.openCoreSession(null)) {
      DocumentModelList result = session.query(QUERY);

//      Documents result = this.getConnection().repository().query(QUERY, "" + queryParams.pageSize, "" + queryParams.index, null, null, null, null);
      Metadata<List<ArchiveOverview>> md = new Metadata<>();
      md.setCount(result.totalSize());
      md.setDetailType("archive");
//      md.setStatus(result.hasError() ? "error" : "success");
      md.setDetail(result.stream().map(d -> {
        ArchiveOverview obj = new ArchiveOverview();
        obj.setTitle(d.getTitle());
        obj.setId(d.getId());
        obj.setType(d.getType());
        return obj;
      }).collect(Collectors.toList()));
      TransactionHelper.commitOrRollbackTransaction();

      return md;
    }
  }

}
