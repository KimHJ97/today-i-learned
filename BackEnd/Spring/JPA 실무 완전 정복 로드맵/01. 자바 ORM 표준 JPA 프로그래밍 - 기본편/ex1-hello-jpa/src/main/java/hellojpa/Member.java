package hellojpa;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Column;

@Getter
@Setter
@Entity
@Table(name = "Member")
public class Member {

    @Id
    private Long id;

    @Column(name = "name")
    private String name;
}