package firstvoices.api.representations

import firstvoices.api.representations.traits.HasID
import firstvoices.api.representations.traits.SwaggerFix
import io.swagger.v3.oas.annotations.media.Schema

class User implements Serializable, SwaggerFix, HasID {
	@Schema(
		description = 'Unique username',
		example = 'jsmith'
	)
	String username

	@Schema(
		description = 'Display Name',
		example = 'John Smith'
	)
	String displayName
}
