package be.kuleuven.mai.cyclecare.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class OffsetDateTimeSerializer extends JsonSerializer<OffsetDateTime> {

    @Override
    public void serialize(OffsetDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        if (value == null) {
            gen.writeNull();
        } else {
            final String formatted = DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(
                value
                    .truncatedTo(ChronoUnit.SECONDS)
                    .withOffsetSameInstant(ZoneOffset.UTC)
            );
            gen.writeString(formatted);
        }
    }
}
