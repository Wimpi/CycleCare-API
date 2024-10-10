package be.kuleuven.mai.cyclecare;

import be.kuleuven.mai.cyclecare.api.UsersApi;
import be.kuleuven.mai.cyclecare.domain.MenstrualCycle;
import be.kuleuven.mai.cyclecare.domain.Person;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.model.NewUserDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPost200ResponseDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPostRequestDTO;
import be.kuleuven.mai.cyclecare.repository.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.impl.JWTParser;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserIT {

    public static final String JANE_DOE_2 = "jane.doe2";
    @Autowired
    UsersApi usersApi;

    @Autowired
    UserRepository userRepository;

    JWTParser jwtParser = new JWTParser();


//    @BeforeEach
    @AfterEach
    void tearDown() {
        userRepository.deleteById(JANE_DOE_2);
    }

    @Test
    void createUserTest() {
        createUser();

        Optional<User> userById = userRepository.findById(JANE_DOE_2);
        final User expectedUser = new User();
        expectedUser.setUsername(JANE_DOE_2);
        expectedUser.setRole(User.Role.USER);
        expectedUser.setPassword("password");
        Person person = new Person();
        person.setEmail("jane.doe@test.com");
        person.setName("Jane");
        person.setFirstLastName("Doe");
        person.setSecondLastname("Two");
        expectedUser.setPerson(person);
        MenstrualCycle menstrualCycle = new MenstrualCycle();
        menstrualCycle.setUsername(JANE_DOE_2);
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
            .username(JANE_DOE_2)
            .password("password")
            ;
        final UsersLoginPost200ResponseDTO token = usersApi.usersLoginPost(usersLoginPostRequestDTO);
        assertThat(token)
            .hasFieldOrPropertyWithValue("email", "jane.doe@test.com")
            .hasFieldOrPropertyWithValue("role", "USER")
            .hasFieldOrPropertyWithValue("name", "Jane")
            .hasFieldOrPropertyWithValue("firstLastName", "Doe")
            .hasFieldOrPropertyWithValue("secondLastName", "Two")
            .extracting(UsersLoginPost200ResponseDTO::getToken)
            .isNotNull()
            .extracting(this::getUsernameClaim)
            .extracting(Claim::asString)
            .isEqualTo(JANE_DOE_2)
        ;
    }

    Claim getUsernameClaim(String token) {
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
            .email("jane.doe@test.com")
            .aproxCycleDuration(28)
            .aproxPeriodDuration(5)
            .isRegular(true)
            .password("password")
            .username(JANE_DOE_2)
            .role("USER") // USER or MEDIC
            ;

        usersApi.usersRegisterUserPost(newUserDTO);
    }
}
