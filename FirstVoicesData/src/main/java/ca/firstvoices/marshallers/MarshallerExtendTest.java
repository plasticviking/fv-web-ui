package ca.firstvoices.marshallers;

import com.fasterxml.jackson.core.JsonGenerator;

import org.nuxeo.ecm.core.api.*;
import org.nuxeo.ecm.core.io.marshallers.json.document.DocumentModelJsonWriter;
import org.nuxeo.ecm.core.io.registry.reflect.Instantiations;
import org.nuxeo.ecm.core.io.registry.reflect.Priorities;
import org.nuxeo.ecm.core.io.registry.reflect.Setup;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/*
    This marshaller will add the field "additional" with the value "information" to any endpoints which return a DocumentModel
 */
@Setup(mode = Instantiations.SINGLETON, priority = Priorities.OVERRIDE_REFERENCE)
public class MarshallerExtendTest extends DocumentModelJsonWriter {
    public void extend(DocumentModel document, JsonGenerator jg) throws IOException {
        super.extend(document, jg);
        CoreSession session = document.getCoreSession();
        String parentLanguageID = (String) document.getPropertyValue("fva:language");
        if (parentLanguageID != null) {
            DocumentRef ref = new IdRef(parentLanguageID);
            DocumentModel doc = session.getDocument(ref);
            Map<String, Object> map = new HashMap<>();
            Map<String, Object> properties = new HashMap<>();
            map.put("dc:title", doc.getPropertyValue("dc:title"));
            map.put("fva:family", doc.getPropertyValue("fva:family"));
            map.put("state", doc.getCurrentLifeCycleState());
            map.put("path", doc.getPath().toString());
            properties.put("uid:major_version", doc.getPropertyValue("uid:major_version"));
            properties.put("uid:minor_version", doc.getPropertyValue("uid:minor_version"));
            map.put("properties", properties);
            jg.writeObjectField("parentLanguageFamily", map);
        }
    }
}
