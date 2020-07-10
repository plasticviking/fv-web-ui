package ca.firstvoices.simpleapi.representations.traits

import io.swagger.v3.oas.annotations.media.Schema

import java.time.LocalDateTime

trait HasID {
	@Schema(
		description = 'Unique ID',
		readOnly = true,
		nullable = false
	)
	String id
}
