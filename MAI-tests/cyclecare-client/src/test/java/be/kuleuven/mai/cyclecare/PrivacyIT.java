package be.kuleuven.mai.cyclecare;


import be.kuleuven.mai.cyclecare.api.RemindersApi;
import be.kuleuven.mai.cyclecare.api.UsersApi;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.model.NewUserDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPost200ResponseDTO;
import be.kuleuven.mai.cyclecare.repository.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest
class PrivacyIT {

    @Autowired
    UsersApi usersApi;

    @Autowired
    UsersTestResource usersTestResource;

    @Autowired
    RemindersTestResource remindersTestResource;

    @Autowired
    RemindersApi remindersApi;

    @Autowired
    UserRepository userRepository;

    @BeforeEach
    @AfterEach
    void tearDown() {
        userRepository.deleteById(UsersTestResource.USER_ID);
    }

    /**
     * This is more a security test than a privacy test.
     * But it is important to check that the password is hashed in the database; otherwise, it is stored in plain text.
     * This is a security risk and by extension a privacy risk when data is leaked.
     */
    @Test
    void testPasswordIsHashedInDatabase() {
        // given
        final String password = "password";
        final NewUserDTO newUserDTO = usersTestResource.newUserDto("user@email.test", UsersTestResource.USER_ID)
            .password(password)
            ;
        // when
        usersApi.usersRegisterUserPost(newUserDTO);
        // then
        final Optional<User> userFromDb = userRepository.findById(UsersTestResource.USER_ID);
        assertThat(userFromDb)
            .isPresent()
            .get()
            .extracting(User::getPassword)
            .isNotEqualTo(password)
        ;
    }

    /**
     * The email does not need to be included in the login; the user should know it.
     * Not compliant with data minimization principle.
     */
    @Test
    void testLoginDoesNotContainEmail() {
        // given
        final User user = usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getEmail)
            .isNotEqualTo(user.getPerson().getEmail());
    }

    /**
     * The first name does not need to be included in the login; the user should know it.
     * Not compliant with data minimization principle.
     */
    @Test
    void testLoginDoesNotContainName() {
        // given
        final User user = usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getName)
            .isNotEqualTo(user.getPerson().getName());
    }

    /**
     * The first last name does not need to be included in the login; the user should know it.
     * Not compliant with data minimization principle.
     */
    @Test
    void testLoginDoesNotContainFirstLastName() {
        // given
        final User user = usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getFirstLastName)
            .isNotEqualTo(user.getPerson().getFirstLastName());
    }

    /**
     * The second last name does not need to be included in the login; the user should know it.
     * Not compliant with data minimization principle.
     */
    @Test
    void testLoginDoesNotContainSecondLastName() {
        // given
        final User user = usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getSecondLastName)
            .isNotEqualTo(user.getPerson().getSecondLastname());
    }

    /**
     * We check whether the token is signed by an asymmetric algorithm (i.e. RSA or EC).
     * We do not want to use symmetric algorithms (i.e. HS).
     */
    @Test
    void testTokenIsNotSymmetric() {
        // given
        usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getToken)
            .extracting(this::decodedJWT)
            .extracting(DecodedJWT::getAlgorithm)
            .asString()
            .doesNotStartWith("HS");
        // we accept ECxxx or RSxxx algorithms
    }

    /**
     * We check whether the token contains the username claim, and this claim is differeent from the userId of the user.
     * We expect opaque user id's, not the actual username.
     */
    @Test
    void testTokenDoesNotContainUserName() {
        // given
        final User user = usersTestResource.createUser();
        // when
        final UsersLoginPost200ResponseDTO usersLoginPost200ResponseDTO = usersTestResource.getUsersLoginPost200ResponseDTO();
        // then
        assertThat(usersLoginPost200ResponseDTO)
            .extracting(UsersLoginPost200ResponseDTO::getToken)
            .extracting(this::decodedJWT)
            .extracting(decodedJWT -> decodedJWT.getClaim("username"))
            .extracting(Claim::asString)
            .isNotEqualTo(user.getUsername());
        // we accept other id's as username
    }

    private DecodedJWT decodedJWT(String token) {
        return JWT.decode(token);
    }
}
