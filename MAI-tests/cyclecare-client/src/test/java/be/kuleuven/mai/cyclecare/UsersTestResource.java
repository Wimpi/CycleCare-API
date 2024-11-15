package be.kuleuven.mai.cyclecare;

import be.kuleuven.mai.cyclecare.api.UsersApi;
import be.kuleuven.mai.cyclecare.domain.MenstrualCycle;
import be.kuleuven.mai.cyclecare.domain.Person;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.model.NewUserDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPost200ResponseDTO;
import be.kuleuven.mai.cyclecare.model.UsersLoginPostRequestDTO;
import be.kuleuven.mai.cyclecare.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class UsersTestResource {

    public static final String USER_EMAIL = "user@gmail.com";
    public static final String USER_ID = "user.id";
    public static final User.Role ROLE = User.Role.USER;
    public static final String PASSWORD = "password";
    public static final String NAME = "Jane";
    public static final String FIRST_LAST_NAME = "Doe";
    public static final String SECOND_LASTNAME = "Two";
    public static final boolean REGULAR = true;
    public static final int APROX_CYCLE_DURATION = 28;
    public static final int APROX_PERIOD_DURATION = 5;

    private final UserRepository userRepository;

    private final UsersApi usersApi;

    public UsersTestResource(UserRepository userRepository, UsersApi usersApi) {
        this.userRepository = userRepository;
        this.usersApi = usersApi;
    }

    @Transactional
    public User createUser() {
        return createUser(USER_EMAIL, USER_ID);
    }

    /**
     * Creates a user directly in de DB, bypassing the API.
     *
     * @param userEmail
     * @param userId
     * @return
     */
    @Transactional
    public User createUser(String userEmail, String userId) {
        final User user = user(userEmail, userId);
        return userRepository.saveAndFlush(user);
    }

    /**
     * @return Returns the token by logging in through the API.
     */
    public String getToken() {
        return getToken(USER_ID, PASSWORD);
    }

    /**
     * @return Returns the token by logging in through the API.
     */
    public UsersLoginPost200ResponseDTO getUsersLoginPost200ResponseDTO() {
        return getUsersLoginPost200ResponseDTO(USER_ID, PASSWORD);
    }

    /**
     * Returns the token by logging in through the API with a specific userId and password.
     *
     * @param userId
     * @param password
     * @return
     */
    public String getToken(String userId, String password) {
        final UsersLoginPost200ResponseDTO usersLoginResponse = getUsersLoginPost200ResponseDTO(userId, password);
        return usersLoginResponse.getToken();
    }

    /**
     * Returns the {@link UsersLoginPost200ResponseDTO} by logging in through the API with a specific userId and password.
     *
     * @param userId
     * @param password
     * @return
     */
    public UsersLoginPost200ResponseDTO getUsersLoginPost200ResponseDTO(String userId, String password) {
        UsersLoginPostRequestDTO usersLoginPostRequestDTO = new UsersLoginPostRequestDTO()
            .username(userId)
            .password(password)
            ;
        return usersApi.usersLoginPost(usersLoginPostRequestDTO);
    }

    /**
     * Create a new {@link User} entity for storing in the DB or comparing with results from the DB.
     *
     * @param userEmail
     * @param userId
     * @return
     */
    public User user(String userEmail, String userId) {
        final User user = new User();
        user.setUsername(userId);
        user.setRole(ROLE);
        user.setPassword(PASSWORD);
        Person person = new Person();
        person.setEmail(userEmail);
        person.setName(NAME);
        person.setFirstLastName(FIRST_LAST_NAME);
        person.setSecondLastname(SECOND_LASTNAME);
        user.setPerson(person);
        MenstrualCycle menstrualCycle = new MenstrualCycle();
        menstrualCycle.setUsername(userId);
        menstrualCycle.setRegular(REGULAR);
        menstrualCycle.setAproxCycleDuration(APROX_CYCLE_DURATION);
        menstrualCycle.setAproxPeriodDuration(APROX_PERIOD_DURATION);
        user.setMenstrualCycle(menstrualCycle);
        return user;
    }

    /**
     * Creates a {@link NewUserDTO} to use for creating a user by means of the API.
     *
     * @param userEmail
     * @param userId
     * @return
     */
    public NewUserDTO newUserDto(String userEmail, String userId) {
        return new NewUserDTO()
            .name(NAME)
            .firstLastName(FIRST_LAST_NAME)
            .secondLastName(SECOND_LASTNAME)
            .email(userEmail)
            .aproxCycleDuration(APROX_CYCLE_DURATION)
            .aproxPeriodDuration(APROX_PERIOD_DURATION)
            .isRegular(REGULAR)
            .password(PASSWORD)
            .username(userId)
            // USER or MEDIC
            .role(NewUserDTO.RoleEnum.USER);
    }
}
