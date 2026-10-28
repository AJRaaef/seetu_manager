package com.seettu.manager.service;

import com.seettu.manager.dto.DisputeRequest;
import com.seettu.manager.entity.Dispute;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final SeettuGroupService groupService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final com.seettu.manager.repository.UserRepository userRepository;

    @Transactional
    public Dispute createDispute(DisputeRequest request, User raisedBy) {
        if (raisedBy != null && raisedBy.getRole() == User.Role.ADMIN) {
            throw new IllegalArgumentException("System Admins cannot submit disputes as they serve as platform arbitrators.");
        }

        SeettuGroup group = (request.getGroupId() != null && request.getGroupId() > 0)
                ? groupService.getGroupById(request.getGroupId())
                : null;

        Dispute dispute = Dispute.builder()
                .group(group)
                .raisedBy(raisedBy)
                .type(request.getType())
                .description(request.getDescription())
                .status(Dispute.DisputeStatus.OPEN)
                .build();
        dispute = disputeRepository.save(dispute);

        String grpLabel = group != null ? "group: " + group.getName() : "General Platform Grievance";
        auditLogService.log(raisedBy, "DISPUTE_RAISED", "disputes", dispute.getId(),
                "Dispute raised for " + grpLabel + " by " + (raisedBy != null ? raisedBy.getFullName() : "User"));
        
        // If an Organizer raises a dispute, escalate directly to System Admins for platform arbitration
        if (raisedBy != null && raisedBy.getRole() == User.Role.ORGANIZER) {
            String noticeMsg = "Organizer Dispute Escalation: Organizer " + raisedBy.getFullName() 
                    + " escalated a dispute for " + grpLabel + " (" + request.getType() + ")";
            userRepository.findByRole(User.Role.ADMIN).forEach(admin -> 
                notificationService.sendNotification(admin.getId(), noticeMsg, "DISPUTE")
            );
        } else if (group != null && group.getCreatedBy() != null) {
            // If a member raises a dispute, notify the circle organizer
            notificationService.sendNotification(group.getCreatedBy().getId(), 
                    "New dispute raised in group: " + group.getName() + " by " + (raisedBy != null ? raisedBy.getFullName() : "Member"), "DISPUTE");
        } else {
            // General issue: notify admins
            userRepository.findByRole(User.Role.ADMIN).forEach(admin -> 
                notificationService.sendNotification(admin.getId(), "New platform grievance filed: " + request.getType(), "DISPUTE")
            );
        }

        return dispute;
    }

    @Transactional(readOnly = true)
    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByGroup(Long groupId) {
        return disputeRepository.findByGroupIdWithDetails(groupId);
    }

    @Transactional(readOnly = true)
    public List<Dispute> getDisputesByRaisedBy(Long userId) {
        return disputeRepository.findByRaisedByIdWithDetails(userId);
    }

    @Transactional(readOnly = true)
    public Dispute getDisputeById(Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", "id", id));
    }

    @Transactional
    public Dispute updateDisputeStatus(Long id, String status, String resolutionNotes, User resolvedBy) {
        Dispute dispute = getDisputeById(id);
        dispute.setStatus(Dispute.DisputeStatus.valueOf(status));
        
        if (resolutionNotes != null) {
            dispute.setResolutionNotes(resolutionNotes);
        }
        
        if (status.equals("RESOLVED") || status.equals("REJECTED")) {
            dispute.setResolvedBy(resolvedBy);
            if (dispute.getRaisedBy() != null) {
                notificationService.sendNotification(dispute.getRaisedBy().getId(), 
                        "Your dispute has been " + status.toLowerCase(), "DISPUTE");
            }
        }
        
        Dispute saved = disputeRepository.save(dispute);
        String groupName = saved.getGroup() != null ? saved.getGroup().getName() : "General Platform";
        auditLogService.log(resolvedBy, "DISPUTE_" + status, "disputes", saved.getId(),
                "Dispute #" + saved.getId() + " marked as " + status + " for " + groupName);

        return saved;
    }
}
