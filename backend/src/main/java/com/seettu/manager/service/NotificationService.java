package com.seettu.manager.service;

import com.seettu.manager.entity.Notification;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.NotificationRepository;
import com.seettu.manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public Notification sendNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Directly dispatch background email to member's email address
        try {
            if (user.getEmail() != null && user.getEmail().contains("@")) {
                String subject = formatEmailSubject(type);
                emailService.sendNotificationEmail(
                        user.getEmail(),
                        user.getFullName(),
                        subject,
                        message,
                        type
                );
            }
        } catch (Exception ignored) {}

        return saved;
    }

    private String formatEmailSubject(String type) {
        if (type == null) return "Seettu Notice";
        switch (type.toUpperCase()) {
            case "PAYMENT_REMINDER": return "Monthly Contribution Reminder";
            case "PAYMENT_LATE":
            case "PAYMENT_OVERDUE": return "Overdue Contribution Notice";
            case "LEGAL_NOTICE": return "Formal Notice Under The Cheetus Ordinance";
            case "PAYMENT_RECEIVED": return "Contribution Payment Receipt";
            case "PAYOUT_APPROVED": return "Seettu Circle Lump-Sum Payout Approved";
            case "CYCLE_COMPLETED": return "Seettu Cycle Completion & Payout Notification";
            case "UPCOMING_PAYOUT": return "Upcoming Seettu Rotational Payout Notice";
            case "KULUKKAL_DRAW": return "Kulukkal Lot Drawing Announcement";
            case "GROUP": return "Seettu Circle Membership Update";
            case "KYC_VERIFIED": return "KYC Verification Approved";
            case "KYC_REJECTED": return "KYC Verification Status";
            case "VERIFICATION_PENDING": return "Identity Verification Under Review";
            case "VERIFICATION_APPROVED": return "Identity Verification Approved";
            case "VERIFICATION_REJECTED": return "Identity Verification Update";
            default: return "Seettu Notification: " + type.replace('_', ' ');
        }
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
