package be.kuleuven.mai.cyclecare.repository;

import be.kuleuven.mai.cyclecare.domain.Person;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person, String> {
}
