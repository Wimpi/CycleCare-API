package be.kuleuven.mai.cyclecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.Objects;

@Entity(name="person")
public class Person {

    @Id
    private String email;

    private String name;

    private String firstLastName;

    private String secondLastname;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFirstLastName() {
        return firstLastName;
    }

    public void setFirstLastName(String firstLastName) {
        this.firstLastName = firstLastName;
    }

    public String getSecondLastname() {
        return secondLastname;
    }

    public void setSecondLastname(String lastLastname) {
        this.secondLastname = lastLastname;
    }

    @Override
    public String toString() {
        return "Person{" +
            "email='" + email + '\'' +
            ", name='" + name + '\'' +
            ", firstLastName='" + firstLastName + '\'' +
            ", secondLastname='" + secondLastname + '\'' +
            '}';
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        Person person = (Person) object;
        return Objects.equals(getEmail(), person.getEmail()) && Objects.equals(getName(), person.getName()) && Objects.equals(getFirstLastName(), person.getFirstLastName()) && Objects.equals(getSecondLastname(), person.getSecondLastname());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getEmail(), getName(), getFirstLastName(), getSecondLastname());
    }
}
