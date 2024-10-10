package be.kuleuven.mai.cyclecare.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import java.util.Objects;

import static jakarta.persistence.CascadeType.ALL;

@Entity(name="user")
public class User {

    @Id
    private String username;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String password;

    @OneToOne(cascade = ALL)
    @JoinColumn(name = "email", referencedColumnName = "email")
    private Person person;

    @OneToOne(mappedBy = "user", cascade = ALL)
    private MenstrualCycle menstrualCycle;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public MenstrualCycle getMenstrualCycle() {
        return menstrualCycle;
    }

    public void setMenstrualCycle(MenstrualCycle menstrualCycle) {
        this.menstrualCycle = menstrualCycle;
    }

    @Override
    public String toString() {
        return "User{" +
            "username='" + username + '\'' +
            ", role=" + role +
            ", password='" + password + '\'' +
            ", person=" + person +
            ", menstrualCycle=" + menstrualCycle +
            '}';
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        User user = (User) object;
        return Objects.equals(getUsername(), user.getUsername()) && getRole() == user.getRole() && Objects.equals(getPassword(), user.getPassword()) && Objects.equals(getPerson(), user.getPerson()) && Objects.equals(getMenstrualCycle(), user.getMenstrualCycle());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUsername(), getRole(), getPassword(), getPerson(), getMenstrualCycle());
    }

    public enum Role {
        USER,
        MEDIC,
    }
}
