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
        request.setStatus(EmergencyRequest.EmergencyStatus.valueOf(status));
        
        if (resolutionNotes != null) {
            request.setResolutionNotes(resolutionNotes);
        }
        
        request.setResolvedBy(resolvedBy);
        requestRepository.save(request);

        notificationService.sendNotification(request.getRaisedBy().getId(), 
                "Your emergency request has been " + status.toLowerCase(), "EMERGENCY");

        return request;
    }
}
