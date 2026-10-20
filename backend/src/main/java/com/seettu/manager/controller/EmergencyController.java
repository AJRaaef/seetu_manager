package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.EmergencyRequestDto;
import com.seettu.manager.entity.EmergencyRequest;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.EmergencyRequestService;
import com.seettu.manager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyRequestService requestService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyRequest>> createRequest(@Valid @RequestBody EmergencyRequestDto dto, 
                                                                       @RequestParam Long raisedById) {
        User raisedBy = userService.getUserById(raisedById);
        return ResponseEntity.ok(ApiResponse.success("Emergency request submitted", requestService.createRequest(dto, raisedBy)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<List<EmergencyRequest>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success(requestService.getAllRequests()));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<List<EmergencyRequest>>> getRequestsByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getRequestsByGroup(groupId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<EmergencyRequest>>> getRequestsByRaisedBy(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(requestService.getRequestsByRaisedBy(userId)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<EmergencyRequest>> updateStatus(@PathVariable Long id, 
                                                                      @RequestParam String status,
                                                                      @RequestParam(required = false) String resolutionNotes,
                                                                      @RequestParam Long resolvedById) {
        User resolvedBy = userService.getUserById(resolvedById);
        return ResponseEntity.ok(ApiResponse.success("Emergency request status updated", 
                requestService.updateStatus(id, status, resolutionNotes, resolvedBy)));
    }
}
