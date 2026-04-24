package com.srats;

import com.srats.entity.User;
import com.srats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Demo admin
        if (!userRepository.findByEmail("admin@srats.edu").isPresent()) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@srats.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .department("Administration")
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Demo admin created: admin@srats.edu / admin123");
        }

        // Demo teacher — always present so JWT is valid after restart
        if (!userRepository.findByEmail("teacher@srats.edu").isPresent()) {
            User teacher = User.builder()
                    .name("Demo Teacher")
                    .email("teacher@srats.edu")
                    .password(passwordEncoder.encode("teacher123"))
                    .role(User.Role.TEACHER)
                    .department("Computer Science")
                    .employeeId("EMP001")
                    .designation("Lecturer")
                    .subject("Data Structures")
                    .phone("9999999999")
                    .active(true)
                    .build();
            userRepository.save(teacher);
            System.out.println(">>> Demo teacher created: teacher@srats.edu / teacher123");
        }

        // Demo student
        if (!userRepository.findByEmail("student@srats.edu").isPresent()) {
            User student = User.builder()
                    .name("Demo Student")
                    .email("student@srats.edu")
                    .password(passwordEncoder.encode("student123"))
                    .role(User.Role.STUDENT)
                    .department("Computer Science")
                    .rollNo("CS001")
                    .year(2)
                    .active(true)
                    .build();
            userRepository.save(student);
            System.out.println(">>> Demo student created: student@srats.edu / student123");
        }
    }
}
