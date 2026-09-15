package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.DashboardResponse;
import com.seettu.manager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponse>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboardStats()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DashboardResponse>> getUserDashboard(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUserDashboardStats(userId)));
    }
}
