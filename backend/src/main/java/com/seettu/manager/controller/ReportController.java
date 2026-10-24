package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.ReportRequest;
import com.seettu.manager.entity.Report;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.ReportService;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER') or hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Report>> generateReport(
            @RequestBody(required = false) ReportRequest requestBody,
            @RequestParam(name = "title", required = false, defaultValue = "System Report") String title,
            @RequestParam(name = "type", required = false, defaultValue = "GENERAL") String type,
            @RequestParam(name = "generatedById", required = false) Long generatedById,
            @RequestParam(name = "content", required = false) String content,
            @AuthenticationPrincipal User authUser) {
        try {
            String finalTitle = (requestBody != null && requestBody.getTitle() != null && !requestBody.getTitle().trim().isEmpty())
                    ? requestBody.getTitle() : title;
            String finalType = (requestBody != null && requestBody.getType() != null && !requestBody.getType().trim().isEmpty())
                    ? requestBody.getType() : type;
            Long finalUserById = (requestBody != null && requestBody.getGeneratedById() != null)
                    ? requestBody.getGeneratedById() : (generatedById != null ? generatedById : (authUser != null ? authUser.getId() : 1L));
            String finalContent = (requestBody != null && requestBody.getContent() != null && !requestBody.getContent().trim().isEmpty())
                    ? requestBody.getContent() : (requestBody != null && requestBody.getNotes() != null ? requestBody.getNotes() : (content != null ? content : "System generated audit report."));

            if (finalTitle == null || finalTitle.trim().isEmpty()) {
                finalTitle = "System Audit Report";
            }
            if (finalType == null || finalType.trim().isEmpty()) {
                finalType = "GENERAL";
            }
            if (finalUserById == null) {
                finalUserById = 1L;
            }

            User generatedBy = null;
            try {
                generatedBy = userService.getUserById(finalUserById);
            } catch (Exception ex) {
                if (authUser != null) {
                    generatedBy = authUser;
                } else {
                    List<User> allUsers = userService.getAllUsers();
                    if (!allUsers.isEmpty()) {
                        generatedBy = allUsers.get(0);
                    }
                }
            }

            if (generatedBy == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid user required to generate report."));
            }

            Report report = reportService.generateReport(finalTitle, finalType, generatedBy, finalContent);
            return ResponseEntity.ok(ApiResponse.success("Report generated successfully", report));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to generate report: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAllReports()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Report>>> getReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportsByUser(userId)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadReportPdf(@PathVariable Long id) {
        Report report = reportService.getReportById(id);
        if (report.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        java.io.File file = new java.io.File(report.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping("/{id}/csv")
    public ResponseEntity<org.springframework.core.io.Resource> downloadReportCsv(@PathVariable Long id) throws Exception {
        java.io.File file = reportService.getReportCsvFile(id);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);
        String fileName = "Report_" + id + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(new org.springframework.http.MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
                .body(resource);
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<org.springframework.core.io.Resource> viewReportPdf(@PathVariable Long id) {
        Report report = reportService.getReportById(id);
        if (report.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        java.io.File file = new java.io.File(report.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
