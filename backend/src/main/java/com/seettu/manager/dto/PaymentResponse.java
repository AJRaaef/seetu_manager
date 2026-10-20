package com.seettu.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long cycleId;
    private Integer cycleNumber;
    private Long memberId;
    private String memberName;
    private BigDecimal amount;
    private String status;
    private LocalDate paymentDate;
    private String recordedByName;
    private String notes;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private String groupName;
    private String memberPhone;
    private String memberEmail;
}
