package com.seettu.manager.service;

import com.seettu.manager.entity.PaymentCycle;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.repository.PaymentCycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentCycleService {

    private final PaymentCycleRepository cycleRepository;

    public List<PaymentCycle> getCyclesByGroup(Long groupId) {
        return cycleRepository.findByGroupIdOrderByCycleNumberAsc(groupId);
    }

    public PaymentCycle getCycleById(Long id) {
        return cycleRepository.findById(id)
                .orElseThrow(() -> new com.seettu.manager.exception.ResourceNotFoundException("PaymentCycle", "id", id));
    }

    @Transactional
    public List<PaymentCycle> generateCycles(SeettuGroup group) {
        List<PaymentCycle> cycles = new ArrayList<>();
        LocalDate startDate = LocalDate.now();

        for (int i = 1; i <= group.getMemberCount(); i++) {
            LocalDate endDate;
            switch (group.getCycleFrequency()) {
                case WEEKLY:
                    endDate = startDate.plusWeeks(1).minusDays(1);
                    break;
                case BI_WEEKLY:
                    endDate = startDate.plusWeeks(2).minusDays(1);
                    break;
                case MONTHLY:
                default:
                    endDate = startDate.plusMonths(1).minusDays(1);
                    break;
            }

            PaymentCycle cycle = PaymentCycle.builder()
                    .group(group)
                    .cycleNumber(i)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status(i == 1 ? PaymentCycle.CycleStatus.ACTIVE : PaymentCycle.CycleStatus.PENDING)
                    .build();

            cycles.add(cycleRepository.save(cycle));
            startDate = endDate.plusDays(1);
        }

        return cycles;
    }

    @Transactional
    public PaymentCycle updateCycleStatus(Long cycleId, String status) {
        PaymentCycle cycle = getCycleById(cycleId);
        cycle.setStatus(PaymentCycle.CycleStatus.valueOf(status));
        return cycleRepository.save(cycle);
    }

    @Transactional
    public PaymentCycle assignPayoutMember(Long cycleId, com.seettu.manager.entity.User member) {
        PaymentCycle cycle = getCycleById(cycleId);
        cycle.setPayoutMember(member);
        return cycleRepository.save(cycle);
    }

    public List<PaymentCycle> getActiveCycles() {
        return cycleRepository.findByStatus(PaymentCycle.CycleStatus.ACTIVE);
    }

    public List<PaymentCycle> getOverdueCycles(LocalDate date) {
        return cycleRepository.findByEndDateBeforeAndStatus(date, PaymentCycle.CycleStatus.ACTIVE);
    }
}
