package be.kuleuven.mai.cyclecare.repository;

import be.kuleuven.mai.cyclecare.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}
