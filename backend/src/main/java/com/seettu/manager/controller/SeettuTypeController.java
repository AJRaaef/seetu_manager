package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.SeettuType;
import com.seettu.manager.service.SeettuTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seettu-types")
@RequiredArgsConstructor
public class SeettuTypeController {

    private final SeettuTypeService seettuTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeettuType>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(seettuTypeService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeettuType>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(seettuTypeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeettuType>> create(@RequestParam String name, @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("Created successfully", seettuTypeService.create(name, description)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeettuType>> update(@PathVariable Long id, @RequestParam(required = false) String name, @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("Updated successfully", seettuTypeService.update(id, name, description)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        seettuTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted successfully", null));
    }
}
