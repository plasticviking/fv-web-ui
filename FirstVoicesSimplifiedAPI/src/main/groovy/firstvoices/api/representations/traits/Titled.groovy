package firstvoices.api.representations.traits

import io.swagger.v3.oas.annotations.media.Schema

trait Titled {

    @Schema(
        description = "The display title of this object",
        example = "Sencoten",
        nullable = false
    )
    String title

}

