package firstvoices.api.representations

import firstvoices.api.representations.traits.HasID
import firstvoices.api.representations.traits.SwaggerFix
import firstvoices.api.representations.traits.Titled
import io.swagger.v3.oas.annotations.media.Schema

class Link implements Serializable, SwaggerFix, Titled, HasID {

	@Schema(
		description = 'Destination URL',
		example = 'https://www.firstvoices.com/'
	)
	URL href
}
