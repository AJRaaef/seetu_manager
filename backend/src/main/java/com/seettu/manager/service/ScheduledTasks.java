package com.seettu.manager.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final PaymentService paymentService;

    // Run at midnight every day
    @Scheduled(cron = "0 0 0 * * ?")
    public void markOverduePayments() {
        paymentService.markOverduePayments();
        System.out.println("Scheduled Task: Marked overdue payments at " + LocalDate.now());
    }

    // Run at 9 AM every day
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendPaymentReminders() {
        int count = paymentService.sendPaymentReminders();
        System.out.println("Scheduled Task: Sent " + count + " payment reminders at " + LocalDate.now());
    }
}
