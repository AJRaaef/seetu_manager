package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.GroupCreateRequest;
import com.seettu.manager.dto.GroupResponse;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.SeettuGroupService;
import com.seettu.manager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final SeettuGroupService groupService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getAllGroups() {
        List<GroupResponse> responses = groupService.getAllGroups().stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroupById(@PathVariable Long id) {
        SeettuGroup group = groupService.getGroupById(id);
        return ResponseEntity.ok(ApiResponse.success(groupService.toGroupResponse(group)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getGroupsByUser(@PathVariable Long userId) {
        List<GroupResponse> responses = groupService.getGroupsByUser(userId).stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getGroupsByOrganizer(@PathVariable Long organizerId) {
        List<GroupResponse> responses = groupService.getGroupsByCreator(organizerId).stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getGroupsByMember(@PathVariable Long memberId) {
        List<GroupResponse> responses = groupService.getJoinedGroupsByMember(memberId).stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(@Valid @RequestBody GroupCreateRequest request,
                                                                  @RequestParam Long creatorId) {
        User creator = userService.getUserById(creatorId);
        SeettuGroup group = groupService.createGroup(request, creator);
        return ResponseEntity.ok(ApiResponse.success("Group created successfully", groupService.toGroupResponse(group)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<GroupResponse>> updateGroup(@PathVariable Long id, @RequestBody GroupCreateRequest request) {
        SeettuGroup group = groupService.updateGroup(id, request);
        return ResponseEntity.ok(ApiResponse.success("Group updated successfully", groupService.toGroupResponse(group)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Group deleted successfully", null));
    }

    @PostMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> addMember(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.addMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member added successfully", null));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long groupId, @PathVariable Long userId) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully", null));
    }
}
