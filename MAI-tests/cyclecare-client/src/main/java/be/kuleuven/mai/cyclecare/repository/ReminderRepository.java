package be.kuleuven.mai.cyclecare.repository;

import be.kuleuven.mai.cyclecare.domain.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findAllByUsername(String username);
}
