package ca.firstvoices.simpleapi.representations.traits

import ca.firstvoices.simpleapi.model.NuxeoMapping
import io.swagger.v3.oas.annotations.media.Schema

trait HasID {
	@Schema(
		description = 'Unique ID',
		readOnly = true,
		nullable = false
	)
	@NuxeoMapping(sourceField = "id")
	String id
}
