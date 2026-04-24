package com.srats.repository;

import com.srats.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRollNo(String rollNo);
    Optional<User> findByEmployeeId(String employeeId);
    List<User> findByRole(User.Role role);
    long countByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(u.rollNo) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(u.department) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<User> searchStudents(@Param("q") String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = 'TEACHER' AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(u.department) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<User> searchTeachers(@Param("q") String query, Pageable pageable);

    List<User> findByRoleAndDepartment(User.Role role, String department);
}
