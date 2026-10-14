package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.dto.ScoreResponse;
import com.seettu.manager.entity.User;
import com.seettu.manager.service.DisciplineScoreService;
import com.seettu.manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final DisciplineScoreService disciplineScoreService;
    private final UserService userService;

    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberScore(@PathVariable Long memberId) {
        ScoreResponse response = disciplineScoreService.calculateScore(memberId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyScore(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User unauthenticated"));
        }
        User user = userService.getUserByEmail(userDetails.getUsername());
        ScoreResponse response = disciplineScoreService.calculateScore(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
