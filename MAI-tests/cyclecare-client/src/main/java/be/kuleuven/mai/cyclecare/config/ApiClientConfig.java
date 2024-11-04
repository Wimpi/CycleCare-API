package be.kuleuven.mai.cyclecare.config;

import be.kuleuven.mai.cyclecare.ApiClient;
import be.kuleuven.mai.cyclecare.api.CycleLogApi;
import be.kuleuven.mai.cyclecare.api.RemindersApi;
import be.kuleuven.mai.cyclecare.api.UsersApi;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.stream.IntStream;

@Configuration
public class ApiClientConfig {

    @Value("${mai.tests.cyclecare.basePath:http://localhost:8085/apicyclecare}")
    private String basePath;

    @Bean
    public ApiClient apiClient() {
        // Create a custom ObjectMapper with a custom module for OffsetDateTime
        final ObjectMapper objectMapper = new ObjectMapper();
        final SimpleModule offsetDateTimeModule = new SimpleModule();
        offsetDateTimeModule.addSerializer(OffsetDateTime.class, new OffsetDateTimeSerializer());
        offsetDateTimeModule.addDeserializer(OffsetDateTime.class, new OffsetDateTimeDeserializer());
        objectMapper.registerModule(offsetDateTimeModule);

        // Create a custom RestClient with a custom MappingJackson2HttpMessageConverter
        final RestClient restClient = RestClient.builder()
            .messageConverters(messageConverters ->
                // find the location of the current MappingJackson2HttpMessageConverter
                IntStream.range(0, messageConverters.size())
                    .filter(index -> messageConverters.get(index) instanceof MappingJackson2HttpMessageConverter)
                    .findFirst()
                    .ifPresentOrElse(
                        // replace with custom MappingJackson2HttpMessageConverter
                        index -> messageConverters.set(index, new MappingJackson2HttpMessageConverter(objectMapper)),
                        // add custom MappingJackson2HttpMessageConverter
                        () -> messageConverters.add(new MappingJackson2HttpMessageConverter(objectMapper))
                    )
            )
            .build();

        // Create a custom ApiClient with the custom RestClient
        return new ApiClient(restClient)
            .setBasePath(basePath)
            ;
    }

    @Bean
    public UsersApi usersApi(ApiClient apiClient) {
        return new UsersApi(apiClient);
    }

    @Bean
    public CycleLogApi cycleLogApi(ApiClient apiClient) {
        return new CycleLogApi(apiClient);
    }

    @Bean
    public RemindersApi remindersApi(ApiClient apiClient) {
        return new RemindersApi(apiClient);
    }
}
