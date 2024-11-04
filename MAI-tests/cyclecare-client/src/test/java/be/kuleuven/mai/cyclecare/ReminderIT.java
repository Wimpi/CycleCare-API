package be.kuleuven.mai.cyclecare;

import be.kuleuven.mai.cyclecare.api.RemindersApi;
import be.kuleuven.mai.cyclecare.domain.Reminder;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.model.ReminderDTO;
import be.kuleuven.mai.cyclecare.model.RemindersDTO;
import be.kuleuven.mai.cyclecare.model.UpdateReminderDTO;
import be.kuleuven.mai.cyclecare.repository.ReminderRepository;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@ActiveProfiles("test")
@SpringBootTest
class ReminderIT {

    @Autowired
    RemindersApi remindersApi;

    @Autowired
    RemindersTestResource remindersTestResource;

    @Autowired
    ReminderRepository reminderRepository;

    @Autowired
    UsersTestResource usersTestResource;

    User user;
    String token;

    @BeforeEach
    void init() {
        user = usersTestResource.createUser();
        token = usersTestResource.getToken();
        reminderRepository.deleteAll();
    }

    @Test
    void testCreateReminder() {
        final OffsetDateTime creationDate = OffsetDateTime.now();
        final OffsetDateTime expectedCreationDate = creationDate
            // in the DB, creationDate is at UTC
            .withOffsetSameInstant(ZoneOffset.UTC)
            // in the DB, creationDate is truncated to seconds
            .truncatedTo(ChronoUnit.SECONDS);
        final ReminderDTO reminderDTO = new ReminderDTO()
            .creationDate(creationDate)
            .title("title")
            .description("description")
            ;
        remindersApi.remindersCreateReminderPost(token, reminderDTO);

        final List<Reminder> allByUsername = reminderRepository.findAllByUsername(UsersTestResource.USER_ID);
        assertThat(allByUsername)
            .hasSize(1)
            .first()
            .hasFieldOrPropertyWithValue("creationDate", expectedCreationDate)
            .hasFieldOrPropertyWithValue("title", "title")
            .hasFieldOrPropertyWithValue("description", "description")
            .hasFieldOrPropertyWithValue("username", UsersTestResource.USER_ID)
            .hasNoNullFieldsOrProperties()
        ;
    }

    @Test
    void getReminders() {
        final Reminder reminder = remindersTestResource.createReminder();
        RemindersDTO reminders = remindersApi.remindersUserRemindersGet(token);
        assertThat(reminders)
            .extracting(RemindersDTO::getReminders)
            .asInstanceOf(InstanceOfAssertFactories.list(ReminderDTO.class))
            .hasSize(1)
            .first()
            .hasFieldOrPropertyWithValue("reminderId", reminder.getReminderId().toString())
            .hasFieldOrPropertyWithValue("creationDate", reminder.getCreationDate())
            .hasFieldOrPropertyWithValue("title", reminder.getTitle())
            .hasFieldOrPropertyWithValue("description", reminder.getDescription())
            .hasFieldOrPropertyWithValue("username", reminder.getUsername())
            .hasNoNullFieldsOrProperties()
        ;
    }

    @Test
    void updateReminders() {
        final Reminder reminder = remindersTestResource.createReminder();
        final OffsetDateTime newCreationDate = OffsetDateTime.now();
        final OffsetDateTime expectedCreationDate = newCreationDate
            // in the DB, creationDate is at UTC
            .withOffsetSameInstant(ZoneOffset.UTC)
            // in the DB, creationDate is truncated to seconds
            .truncatedTo(ChronoUnit.SECONDS);
        final UpdateReminderDTO description = new UpdateReminderDTO()
            .creationDate(newCreationDate)
            .title("new title")
            .description("new description");
        remindersApi.remindersUpdateReminderReminderIdPost(reminder.getReminderId().toString(), token, description);
        final List<Reminder> allByUsername = reminderRepository.findAllByUsername(UsersTestResource.USER_ID);
        assertThat(allByUsername)
            .hasSize(1)
            .first()
            .hasFieldOrPropertyWithValue("creationDate", expectedCreationDate)
            .hasFieldOrPropertyWithValue("title", "new title")
            .hasFieldOrPropertyWithValue("description", "new description")
            .hasFieldOrPropertyWithValue("username", UsersTestResource.USER_ID)
            .hasNoNullFieldsOrProperties();
    }

    @Test
    void testDeleteReminder() {
        final Reminder reminder = remindersTestResource.createReminder();
        remindersApi.remindersReminderReminderIdDelete(reminder.getReminderId().toString(), token);
        Optional<Reminder> byId = reminderRepository.findById(reminder.getReminderId());
        assertThat(byId).isEmpty();
    }
}
