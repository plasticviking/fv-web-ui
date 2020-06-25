package firstvoices.api.representations

import firstvoices.api.representations.traits.Contributors
import firstvoices.api.representations.traits.HasID
import firstvoices.api.representations.traits.LexicalEntity
import firstvoices.api.representations.traits.SwaggerFix
import firstvoices.api.representations.traits.Timestamps
import firstvoices.api.representations.traits.Titled
import firstvoices.api.representations.traits.Translatable
import io.swagger.v3.oas.annotations.media.Schema

class Word implements Serializable, SwaggerFix, Titled, Timestamps, HasID, LexicalEntity, Translatable, Contributors {

	@Schema(
//		allowableValues = ["{'name':Noun", "Verb", "..."]
		description='The word\'s part of speech (Noun, verb, etc.)'
	)
	VocabularyEntry partOfSpeech
}

