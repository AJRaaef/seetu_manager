package com.seettu.manager.service;

import com.seettu.manager.dto.EmergencyRequestDto;
import com.seettu.manager.entity.EmergencyRequest;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.EmergencyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyRequestService {

    private final EmergencyRequestRepository requestRepository;
    private final SeettuGroupService groupService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public EmergencyRequest createRequest(EmergencyRequestDto dto, User raisedBy) {
        if (raisedBy != null && raisedBy.getRole() == User.Role.ADMIN) {
            throw new IllegalArgumentException("System Admins cannot submit emergency payout requests");
        }

        SeettuGroup group = groupService.getGroupById(dto.getGroupId());

        EmergencyRequest request = EmergencyRequest.builder()
                .group(group)
                .raisedBy(raisedBy)
                .requestedAmount(dto.getRequestedAmount())
                .reason(dto.getReason())
                .status(EmergencyRequest.EmergencyStatus.PENDING)
                .build();
        request = requestRepository.save(request);

        auditLogService.log(raisedBy, "EMERGENCY_REQUESTED", "emergency_requests", request.getId(),
                "Emergency request for amount: " + dto.getRequestedAmount());

        notificationService.sendNotification(group.getCreatedBy().getId(), 
                "New emergency request from " + raisedBy.getFullName(), "EMERGENCY");

        return request;
    }

    public List<EmergencyRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    public List<EmergencyRequest> getRequestsByGroup(Long groupId) {
        return requestRepository.findByGroupId(groupId);
    }

    public List<EmergencyRequest> getRequestsByRaisedBy(Long userId) {
        return requestRepository.findByRaisedById(userId);
    }

    public EmergencyRequest getRequestById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmergencyRequest", "id", id));
    }

    @Transactional
    public EmergencyRequest updateStatus(Long id, String status, String resolutionNotes, User resolvedBy) {
        EmergencyRequest request = getRequestById(id);

        if (resolvedBy != null && resolvedBy.getRole() == User.Role.MEMBER) {
            throw new IllegalArgumentException("Only Circle Organizers or System Admins can review emergency requests.");
        }

        request.setStatus(EmergencyRequest.EmergencyStatus.valueOf(status));
        
        if (resolutionNotes != null) {
            request.setResolutionNotes(resolutionNotes);
        }
        
        request.setResolvedBy(resolvedBy);
        EmergencyRequest saved = requestRepository.save(request);

        auditLogService.log(resolvedBy, "EMERGENCY_" + status, "emergency_requests", saved.getId(),
                "Emergency request #" + saved.getId() + " marked as " + status + " for amount: " + saved.getRequestedAmount());

        notificationService.sendNotification(request.getRaisedBy().getId(), 
                "Your emergency request has been " + status.toLowerCase(), "EMERGENCY");

        return saved;
    }
}
