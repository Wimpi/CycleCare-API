package be.kuleuven.mai.cyclecare;

import be.kuleuven.mai.cyclecare.domain.Reminder;
import be.kuleuven.mai.cyclecare.domain.User;
import be.kuleuven.mai.cyclecare.repository.ReminderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class RemindersTestResource {

    public static final String TITLE = "title";
    public static final String DESCRIPTION = "description";
    private final ReminderRepository reminderRepository;

    public RemindersTestResource(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    @Transactional
    public Reminder createReminder() {
        return createReminder(UsersTestResource.USER_ID);
    }

    @Transactional
    public Reminder createReminder(User user) {
        return createReminder(user.getUsername());
    }

    @Transactional
    public Reminder createReminder(String userId) {
        final OffsetDateTime creationDate = OffsetDateTime.now().withOffsetSameInstant(ZoneOffset.UTC)
            // in the DB, creationDate is truncated to seconds
            .truncatedTo(ChronoUnit.SECONDS);
        final Reminder reminder = new Reminder();
        reminder.setUsername(userId);
        reminder.setCreationDate(creationDate);
        reminder.setTitle(TITLE);
        reminder.setDescription(DESCRIPTION);
        reminder.setScheduleId(UUID.randomUUID());
        return reminderRepository.saveAndFlush(reminder);
    }
}
