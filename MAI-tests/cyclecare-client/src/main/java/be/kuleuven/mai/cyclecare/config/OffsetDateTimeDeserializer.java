package be.kuleuven.mai.cyclecare.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public class OffsetDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {

    @Override
    public OffsetDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateAsString = p.getText();
        if (dateAsString == null) {
            return null;
        } else {
            return OffsetDateTime.parse(dateAsString, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        }
    }
}
