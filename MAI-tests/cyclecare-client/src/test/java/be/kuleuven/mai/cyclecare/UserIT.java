package be.kuleuven.mai.cyclecare;

import be.kuleuven.mai.cyclecare.api.UsersApi;
import be.kuleuven.mai.cyclecare.domain.MenstrualCycle;
import be.kuleuven.mai.cyclecare.domain.Person;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.model.NewUserDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPost200ResponseDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPostRequestDTO;
import be.kuleuven.mai.cyclecare.model.UsersResetPasswordEmailPostRequestDTO;
import be.kuleuven.mai.cyclecare.repository.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest
class UserIT {

    public static final String USER_ID_PATTERN = "jane.doe2.%s";

    public String userId;
    public String userEmail;

    @Autowired
    UsersApi usersApi;

    @Autowired
    UserRepository userRepository;

    @Autowired
    GmailReadServiceConfig gmailReadServiceConfig;

    @Autowired
    GmailReadService gmailReadService;

    @BeforeEach
    void setup() {
        final String randomSuffix = new Random().ints('a', 'z')
            .limit(10)
            .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
            .toString()
            ;
        // we use the gmail address as the user email, but we replace the @ with a + and add a random suffix.
        // this allows us to create multiple users with the same email address and easily filter the relevant emails.
        final String userEmailPattern = gmailReadServiceConfig.getEmail().replace("@", "+%s@");
        userEmail = userEmailPattern.formatted(randomSuffix);
        userId = USER_ID_PATTERN.formatted(randomSuffix);
    }

//    @BeforeEach
    @AfterEach
    void tearDown() {
        userRepository.deleteById(userId);
    }

    @Test
    void createUserTest() {
        createUser();

        Optional<User> userById = userRepository.findById(userId);
        final User expectedUser = new User();
        expectedUser.setUsername(userId);
        expectedUser.setRole(User.Role.USER);
        expectedUser.setPassword("password");
        Person person = new Person();
        person.setEmail(userEmail);
        person.setName("Jane");
        person.setFirstLastName("Doe");
        person.setSecondLastname("Two");
        expectedUser.setPerson(person);
        MenstrualCycle menstrualCycle = new MenstrualCycle();
        menstrualCycle.setUsername(userId);
        menstrualCycle.setRegular(true);
        menstrualCycle.setAproxCycleDuration(28);
        menstrualCycle.setAproxPeriodDuration(5);
        expectedUser.setMenstrualCycle(menstrualCycle);
        assertThat(userById)
            .isPresent()
            .contains(expectedUser)
        ;

        userRepository.delete(expectedUser);
    }

    @Test
    void loginTest() {
        createUser();
        UsersLoginPostRequestDTO usersLoginPostRequestDTO = new UsersLoginPostRequestDTO()
            .username(userId)
            .password("password")
            ;
        final UsersLoginPost200ResponseDTO token = usersApi.usersLoginPost(usersLoginPostRequestDTO);
        assertThat(token)
            .hasFieldOrPropertyWithValue("email", userEmail)
            .hasFieldOrPropertyWithValue("role", "USER")
            .hasFieldOrPropertyWithValue("name", "Jane")
            .hasFieldOrPropertyWithValue("firstLastName", "Doe")
            .hasFieldOrPropertyWithValue("secondLastName", "Two")
            .extracting(UsersLoginPost200ResponseDTO::getToken)
            .isNotNull()
            .extracting(this::getUsernameClaim)
            .extracting(Claim::asString)
            .isEqualTo(userId)
        ;
    }

    @Test
    void resetTest() {
        createUser();
        Optional<User> userById = userRepository.findById(userId);
        assertThat(userById)
            .isPresent()
            .get()
            .extracting(User::getPassword)
            .isEqualTo("password");

        // interactive
        usersApi.usersRequestResetEmailPost(userEmail);

        String[] resetTokensForUser = gmailReadService.readResetcodesFromGmail(userEmail);
        assertThat(resetTokensForUser).hasSizeGreaterThan(0);
        // take the last token; we get them from old to new.
        String resetToken = resetTokensForUser[resetTokensForUser.length - 1];
        UsersResetPasswordEmailPostRequestDTO usersResetPasswordEmailPostRequestDTO = new UsersResetPasswordEmailPostRequestDTO()
            .token(resetToken)
            .newPassword("newpassword")
            .confirmPassword("newpassword")
            ;
        usersApi.usersResetPasswordEmailPost(userEmail, usersResetPasswordEmailPostRequestDTO);

        Optional<User> userAfterPasswordReset = userRepository.findById(userId);
        assertThat(userAfterPasswordReset)
            .isPresent()
            .get()
            .extracting(User::getPassword)
            .isEqualTo("newpassword");
    }

    /**
     * This method is used to retrieve the username claim from the token, regardless of the algorithm used to sign the token.
     *
     * @param token
     * @return
     */
    Claim getUsernameClaim(String token) {
        return JWT.decode(token).getClaim("username");
    }

    /**
     * This method is used to demonstrate that the token can be verified with a known secret key.
     * However, anyone with the secret key also create their own valid tokens.
     *
     * @param token
     * @return
     */
    Claim getUsernameClaimWithKnownSecretKey(String token) {
        JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256("myprivatekey"))
            .build();
        DecodedJWT decodedJWT = jwtVerifier.verify(token);
        return decodedJWT.getClaim("username");
    }

    private void createUser() {
        final NewUserDTO newUserDTO = new NewUserDTO()
            .name("Jane")
            .firstLastName("Doe")
            .secondLastName("Two")
            .email(userEmail)
            .aproxCycleDuration(28)
            .aproxPeriodDuration(5)
            .isRegular(true)
            .password("password")
            .username(userId)
            .role(NewUserDTO.RoleEnum.USER) // USER or MEDIC
            ;

        usersApi.usersRegisterUserPost(newUserDTO);
    }
}
