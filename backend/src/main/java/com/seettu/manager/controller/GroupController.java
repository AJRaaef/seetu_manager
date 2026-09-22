package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.GroupCreateRequest;
import com.seettu.manager.dto.GroupResponse;
import com.seettu.manager.entity.GroupMember;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.SeettuGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class GroupController {

    private final SeettuGroupService groupService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> createGroup(@Valid @RequestBody GroupCreateRequest request,
                                          @AuthenticationPrincipal User user) {
        SeettuGroup group = groupService.createGroup(request, user);
        return ResponseEntity.ok(ApiResponse.success("Group created successfully",
                groupService.toGroupResponse(group)));
    }

    @GetMapping
    public ResponseEntity<?> getAllGroups() {
        List<GroupResponse> groups = groupService.getAllGroups()
                .stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable Long id) {
        SeettuGroup group = groupService.getGroupById(id);
        return ResponseEntity.ok(ApiResponse.success(groupService.toGroupResponse(group)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getGroupsByUser(@PathVariable Long userId) {
        List<GroupResponse> groups = groupService.getGroupsByUser(userId)
                .stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getGroupsByOrganizer(@PathVariable Long organizerId) {
        List<GroupResponse> groups = groupService.getGroupsByCreator(organizerId)
                .stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/joined/{userId}")
    public ResponseEntity<?> getJoinedGroups(@PathVariable Long userId) {
        List<GroupResponse> groups = groupService.getJoinedGroupsByMember(userId)
                .stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchGroups(@RequestParam String keyword) {
        List<GroupResponse> groups = groupService.searchGroups(keyword)
                .stream()
                .map(groupService::toGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> updateGroup(@PathVariable Long id,
                                          @RequestBody GroupCreateRequest request) {
        SeettuGroup group = groupService.updateGroup(id, request);
        return ResponseEntity.ok(ApiResponse.success("Group updated",
                groupService.toGroupResponse(group)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Group deleted", null));
    }

    @PostMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> addMember(@PathVariable Long groupId,
                                        @PathVariable Long userId) {
        GroupMember member = groupService.addMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member added", member));
    }

    @PostMapping("/{groupId}/members/invite")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> inviteMember(@PathVariable Long groupId,
                                          @RequestBody java.util.Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String phone = request.get("phone");
        GroupMember member = groupService.inviteOrAddMember(groupId, fullName, email, phone);
        return ResponseEntity.ok(ApiResponse.success("Member added to group successfully", member));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> removeMember(@PathVariable Long groupId,
                                           @PathVariable Long userId) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(@PathVariable Long groupId) {
        List<GroupMember> members = groupService.getGroupMembers(groupId);
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @GetMapping("/members")
    public ResponseEntity<?> getAllMembers() {
        List<GroupMember> members = groupService.getAllActiveMembers();
        return ResponseEntity.ok(ApiResponse.success(members));
    }
}