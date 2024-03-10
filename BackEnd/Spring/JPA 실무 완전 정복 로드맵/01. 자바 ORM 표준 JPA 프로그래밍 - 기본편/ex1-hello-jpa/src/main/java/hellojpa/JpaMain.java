package hellojpa;

import javax.persistence.Persistence;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;

public class JpaMain {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("hello");
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();

        // 트랜잭션 시작
        tx.begin()

        try {
            Member member = new Member();
            member.setId(1L);
            member.setName("HelloA");

            em.persist(member);

            // 트랜잭션 종료
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
        } finally { 
            em.close();
        }
        
        emf.close()
    }
}