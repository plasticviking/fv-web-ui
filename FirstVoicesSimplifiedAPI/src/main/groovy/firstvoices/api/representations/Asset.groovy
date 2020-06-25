package firstvoices.api.representations

import firstvoices.api.representations.traits.Contributors
import firstvoices.api.representations.traits.SwaggerFix
import firstvoices.api.representations.traits.Timestamps
import firstvoices.api.representations.traits.Titled
import io.swagger.v3.oas.annotations.media.Schema

@Schema(
	description = "Represents a media asset such as picture, audio file, or video"
)
class Asset implements Serializable, Titled, SwaggerFix, Contributors, Timestamps {
	enum AssetType {
		AUDIO,
		VIDEO,
		PHOTO,
		UNKNOWN
	}

	String id
	URL url
	long size
	String contentType
	AssetType type
}
