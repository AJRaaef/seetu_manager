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
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public Dispute createDispute(DisputeRequest request, User raisedBy) {
        SeettuGroup group = groupService.getGroupById(request.getGroupId());

        Dispute dispute = Dispute.builder()
                .group(group)
                .raisedBy(raisedBy)
                .type(request.getType())
                .description(request.getDescription())
                .status(Dispute.DisputeStatus.OPEN)
                .build();
        dispute = disputeRepository.save(dispute);

        auditLogService.log(raisedBy, "DISPUTE_RAISED", "disputes", dispute.getId(),
                "Dispute raised for group: " + group.getName());
        
        notificationService.sendNotification(group.getCreatedBy().getId(), 
                "New dispute raised in group: " + group.getName(), "DISPUTE");

        return dispute;
    }

    public List<Dispute> getDisputesByGroup(Long groupId) {
        return disputeRepository.findByGroupId(groupId);
    }

    public List<Dispute> getDisputesByRaisedBy(Long userId) {
        return disputeRepository.findByRaisedById(userId);
    }

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
            notificationService.sendNotification(dispute.getRaisedBy().getId(), 
                    "Your dispute has been " + status.toLowerCase(), "DISPUTE");
        }
        
        return disputeRepository.save(dispute);
    }
}
