package be.kuleuven.mai.cyclecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity(name="reminder")
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long reminderId;

    private String description;

    private String title;

    private OffsetDateTime creationDate;

    private UUID scheduleId;

    private String username;

    public void setReminderId(Long reminderId) {
        this.reminderId = reminderId;
    }

    public Long getReminderId() {
        return reminderId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public OffsetDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(OffsetDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public UUID getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(UUID scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        Reminder reminder = (Reminder) object;
        return Objects.equals(getReminderId(), reminder.getReminderId()) && Objects.equals(getDescription(), reminder.getDescription()) && Objects.equals(getTitle(), reminder.getTitle()) && Objects.equals(getCreationDate(), reminder.getCreationDate()) && Objects.equals(getScheduleId(), reminder.getScheduleId()) && Objects.equals(getUsername(), reminder.getUsername());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getReminderId(), getDescription(), getTitle(), getCreationDate(), getScheduleId(), getUsername());
    }
}
