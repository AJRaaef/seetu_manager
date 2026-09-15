package com.seettu.manager.service;

import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public User updateUser(Long id, String fullName, String phone, String preferredLanguage) {
        User user = getUserById(id);
        if (fullName != null) user.setFullName(fullName);
        if (phone != null) user.setPhone(phone);
        if (preferredLanguage != null) user.setPreferredLanguage(User.Language.valueOf(preferredLanguage));
        return userRepository.save(user);
    }

    @Transactional
    public void lockUser(Long id) {
        User user = getUserById(id);
        user.setIsLocked(true);
        userRepository.save(user);
    }

    @Transactional
    public void unlockUser(Long id) {
        User user = getUserById(id);
        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }
}
