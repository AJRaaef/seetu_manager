package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.Report;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.ReportService;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Report>> generateReport(@RequestParam String title,
                                                              @RequestParam String type,
                                                              @RequestParam Long generatedById,
                                                              @RequestBody String content) {
        try {
            User generatedBy = userService.getUserById(generatedById);
            Report report = reportService.generateReport(title, type, generatedBy, content);
            return ResponseEntity.ok(ApiResponse.success("Report generated successfully", report));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to generate report: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Report>>> getReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportsByUser(userId)));
    }
}
