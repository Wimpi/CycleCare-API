package be.kuleuven.mai.cyclecare.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class LocalDateDeserializer extends JsonDeserializer<LocalDate> {

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateAsString = p.getText();
        if (dateAsString == null) {
            return null;
        } else {
            return LocalDate.parse(dateAsString, DateTimeFormatter.ISO_LOCAL_DATE);
        }
    }
}
