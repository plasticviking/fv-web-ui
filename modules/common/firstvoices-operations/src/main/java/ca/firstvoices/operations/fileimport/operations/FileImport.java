/*
 *
 *  *
 *  * Copyright 2020 First People's Cultural Council
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  * /
 *
 */

package ca.firstvoices.operations.fileimport.operations;

import ca.firstvoices.operations.fileimport.services.FileImportService;
import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.runtime.api.Framework;

@Operation(id = FileImport.ID,
    category = Constants.CAT_EXECUTION,
    label = "Import file",
    description = "")
public class FileImport {

  FileImportService fileImportService = Framework.getService(FileImportService.class);

  public static final String ID = "Microservices.FileImport";

  @Param(name = "file_url", required = true) protected String fileUrl;
  @Param(name = "file_name", required = true) protected String fileName;

  @Context CoreSession session;

  @OperationMethod()
  public void run() {
    fileImportService.importFile(session, fileUrl, fileName);
  }
}
