package be.kuleuven.mai.cyclecare;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GmailReadServiceConfig {

    @Value("${gmail.email}")
    private String email;

    @Value("${gmail.appPassword}")
    private String appPassword;

    public String getEmail() {
        return email;
    }

    public String getAppPassword() {
        return appPassword;
    }
}
