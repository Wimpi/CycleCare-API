package be.kuleuven.mai.cyclecare.repository;

import be.kuleuven.mai.cyclecare.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
}
