package be.kuleuven.mai.cyclecare.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import java.util.Objects;

import static jakarta.persistence.CascadeType.ALL;

@Entity(name="menstrualCycle")
public class MenstrualCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int mestrualCycleId; // TODO: correct spelling

    @Column(insertable=false, updatable=false)
    private String username;

    private boolean isRegular;

    private int aproxCycleDuration;

    private int aproxPeriodDuration;

    @OneToOne(cascade = ALL)
    @JoinColumn(name = "username", referencedColumnName = "username")
    private User user;

    public int getMestrualCycleId() {
        return mestrualCycleId;
    }

    public void setMestrualCycleId(int mestrualCycleId) {
        this.mestrualCycleId = mestrualCycleId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isRegular() {
        return isRegular;
    }

    public void setRegular(boolean regular) {
        isRegular = regular;
    }

    public int getAproxCycleDuration() {
        return aproxCycleDuration;
    }

    public void setAproxCycleDuration(int aproxCycleDuration) {
        this.aproxCycleDuration = aproxCycleDuration;
    }

    public int getAproxPeriodDuration() {
        return aproxPeriodDuration;
    }

    public void setAproxPeriodDuration(int aproxPeriodDuration) {
        this.aproxPeriodDuration = aproxPeriodDuration;
    }

    @Override
    public String toString() {
        return "MenstrualCycle{" +
            "mestrualCycleId=" + mestrualCycleId +
            ", username='" + username + '\'' +
            ", isRegular=" + isRegular +
            ", aproxCycleDuration=" + aproxCycleDuration +
            ", aproxPeriodDuration=" + aproxPeriodDuration +
            '}';
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        MenstrualCycle that = (MenstrualCycle) object;
        return isRegular() == that.isRegular() && getAproxCycleDuration() == that.getAproxCycleDuration() && getAproxPeriodDuration() == that.getAproxPeriodDuration() && Objects.equals(getUsername(), that.getUsername());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUsername(), isRegular(), getAproxCycleDuration(), getAproxPeriodDuration());
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
