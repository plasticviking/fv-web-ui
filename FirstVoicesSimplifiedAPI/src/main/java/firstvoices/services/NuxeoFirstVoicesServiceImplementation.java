package firstvoices.services;

import com.google.inject.Singleton;
import firstvoices.api.model.QueryBean;
import firstvoices.api.representations.ArchiveOverview;
import firstvoices.api.representations.containers.Metadata;
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
public class NuxeoFirstVoicesServiceImplementation extends AbstractFirstVoicesService {
  private static final Log LOG = LogFactory.getLog(NuxeoFirstVoicesServiceImplementation.class);

  private <V> Metadata<List<V>> buildListResponse(Class<V> resultClass, String ppName, QueryBean queryParams, Object... params) {
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
          .getPageProvider(ppName, null, null, null, props);

      pageProvider.setPageSize(queryParams.pageSize);
      pageProvider.setCurrentPage(queryParams.index);

      List<DocumentModel> results = pageProvider.getCurrentPage();
      ResultMapper<V> mapper = MapperRegistry.mapper(resultClass);
      md.setCount(pageProvider.getResultsCount());
      md.setDetailType("archive");
      md.setStatus(pageProvider.hasError() ? "error" : "success");
      md.setDetail(results.stream().map(dm -> mapper.map(dm)).collect(Collectors.toList()));

      TransactionHelper.commitOrRollbackTransaction();

      return md;
    }
  }


  private <V> Metadata<V> buildSingleResponse(
      String ppName,
      QueryBean queryParams,
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
          .getPageProvider(ppName, null, null, null, props);

      pageProvider.setPageSize(queryParams.pageSize);
      pageProvider.setCurrentPage(queryParams.index);

      List<DocumentModel> results = pageProvider.getCurrentPage();
      TransactionHelper.commitOrRollbackTransaction();

      return md;
    }
  }


  @Override
  public Metadata<List<ArchiveOverview>> getArchives(QueryBean queryParams) {
    LOG.info("running query");
    return buildListResponse(ArchiveOverview.class, "LIST_ARCHIVES_PP", queryParams);
  }

}
