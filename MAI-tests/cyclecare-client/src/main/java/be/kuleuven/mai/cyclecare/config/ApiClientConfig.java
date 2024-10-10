package be.kuleuven.mai.cyclecare.config;

import be.kuleuven.mai.cyclecare.ApiClient;
import be.kuleuven.mai.cyclecare.api.CycleLogApi;
import be.kuleuven.mai.cyclecare.api.RemindersApi;
import be.kuleuven.mai.cyclecare.api.UsersApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApiClientConfig {

    @Value("${mai.tests.cyclecare.basePath:http://localhost:8085/apicyclecare}")
    private String basePath;

    @Bean
    public ApiClient apiClient() {
        return new ApiClient()
            .setBasePath(basePath);
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
