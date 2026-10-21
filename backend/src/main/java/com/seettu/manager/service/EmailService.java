package com.seettu.manager.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@seetumanager.com}")
    private String fromAddress;

    @Value("${email.output-dir:./emails}")
    private String emailOutputDir;

    /**
     * Dispatch an email asynchronously in the background.
     * Never blocks the calling thread or user action.
     */
    public void sendEmailAsync(String to, String subject, String htmlContent, File attachment) {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            log.warn("Cannot send email: invalid recipient '{}'", to);
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                boolean sentViaSmtp = false;
                if (mailSender != null && fromAddress != null && !fromAddress.contains("your-email@gmail.com")) {
                    try {
                        MimeMessage mimeMessage = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, attachment != null, StandardCharsets.UTF_8.name());
                        helper.setFrom(fromAddress);
                        helper.setTo(to.trim());
                        helper.setSubject(subject);
                        helper.setText(htmlContent, true);

                        if (attachment != null && attachment.exists()) {
                            helper.addAttachment(attachment.getName(), attachment);
                        }

                        mailSender.send(mimeMessage);
                        sentViaSmtp = true;
                        log.info("Direct email delivered via SMTP to: {} | Subject: {}", to, subject);
                    } catch (Exception smtpEx) {
                        log.warn("SMTP transmission paused ({}); falling back to local digital outbox ledger.", smtpEx.getMessage());
                    }
                }

                // Always archive outgoing email to local outbox directory for audit & verification
                saveToOutbox(to, subject, htmlContent, sentViaSmtp);

            } catch (Exception e) {
                log.error("Failed to process outgoing email to {}: {}", to, e.getMessage());
            }
        });
    }

    /**
     * Build and send official Seettu notification email.
     */
    public void sendNotificationEmail(String recipientEmail, String recipientName, String subject, String message, String type) {
        String html = buildBrandedHtmlTemplate(
                recipientName != null ? recipientName : "Valued Member",
                subject,
                message,
                type != null ? type : "SEETTU NOTICE",
                null
        );
        sendEmailAsync(recipientEmail, "SeettuManager: " + subject, html, null);
    }

    /**
     * Send official payment receipt email.
     */
    public void sendPaymentReceiptEmail(String recipientEmail, String recipientName, String groupName, String amount, String receiptRef) {
        String title = "Payment Receipt Confirmed: " + groupName;
        String message = "<p>Your payment of <strong>LKR " + amount + "</strong> for Seettu Circle <strong>" + groupName + "</strong> has been verified and recorded.</p>"
                + "<div style='background:#F1F5F9; padding:12px; border-radius:6px; margin:16px 0;'>"
                + "<p style='margin:0; font-size:13px; color:#475569;'><strong>Reference Ref:</strong> " + receiptRef + "</p>"
                + "<p style='margin:4px 0 0; font-size:13px; color:#475569;'><strong>Discipline Rating:</strong> Preserved & Updated (100/100)</p>"
                + "</div>";
        String html = buildBrandedHtmlTemplate(recipientName, title, message, "PAYMENT RECEIPT", null);
        sendEmailAsync(recipientEmail, "SeettuManager: Payment Receipt (" + amount + " LKR)", html, null);
    }

    /**
     * Send statutory legal remediation notice email.
     */
    public void sendLegalNoticeEmail(String recipientEmail, String recipientName, String groupName, String reason, String demandDetails) {
        String title = "FORMAL NOTICE UNDER THE CHEETUS ORDINANCE NO. 61 OF 1935";
        String message = "<p style='color:#DC2626; font-weight:bold;'>URGENT REGULATORY REMEDIATION NOTICE</p>"
                + "<p>This is a formal statutory notice regarding your account in Seettu Circle <strong>" + (groupName != null ? groupName : "Registered Syndicate") + "</strong>.</p>"
                + "<p><strong>Grounds for Notice:</strong> " + reason + "</p>"
                + "<div style='background:#FEF2F2; border-left:4px solid #DC2626; padding:12px; margin:16px 0;'>"
                + "<p style='margin:0; font-size:13px; color:#991B1B;'>" + demandDetails + "</p>"
                + "</div>"
                + "<p style='font-size:12px; color:#64748B;'>Failure to remediate the outstanding balance within the statutory grace period may result in forfeiture of accrued dividends and civil recovery proceedings pursuant to Chapter 190 of the Legislative Enactments of Sri Lanka.</p>";
        String html = buildBrandedHtmlTemplate(recipientName, title, message, "STATUTORY LEGAL NOTICE", "#DC2626");
        sendEmailAsync(recipientEmail, "URGENT: Legal Remediation Notice - SeettuManager", html, null);
    }

    /**
     * Send password reset security email.
     */
    public void sendPasswordResetEmail(String recipientEmail, String resetLinkOrCode) {
        String title = "Password Reset Request";
        String message = "<p>We received a request to reset your password for your SeettuManager account.</p>"
                + "<div style='text-align:center; margin:24px 0;'>"
                + "<div style='display:inline-block; background:#0097B2; color:#FFFFFF; padding:12px 24px; border-radius:6px; font-weight:bold; font-size:16px; letter-spacing:1px;'>"
                + resetLinkOrCode
                + "</div>"
                + "</div>"
                + "<p style='font-size:12px; color:#64748B;'>If you did not request this password reset, please ignore this email or contact platform security immediately.</p>";
        String html = buildBrandedHtmlTemplate("Valued User", title, message, "SECURITY ALERT", null);
        sendEmailAsync(recipientEmail, "SeettuManager: Password Reset Code", html, null);
    }

    /**
     * Send Contact Us inquiry forward to Admin.
     */
    public void sendContactInquiryEmail(String adminEmail, String senderName, String senderEmail, String phone, String subject, String messageText) {
        String title = "New Platform Inquiry: " + subject;
        String message = "<p>A new visitor inquiry has been received via the SeettuManager public portal:</p>"
                + "<table style='width:100%; font-size:13px; color:#334155; margin:16px 0; border-collapse:collapse;'>"
                + "<tr><td style='padding:6px; border-bottom:1px solid #E2E8F0; width:120px; font-weight:bold;'>Sender Name:</td><td style='padding:6px; border-bottom:1px solid #E2E8F0;'>" + senderName + "</td></tr>"
                + "<tr><td style='padding:6px; border-bottom:1px solid #E2E8F0; font-weight:bold;'>Email Address:</td><td style='padding:6px; border-bottom:1px solid #E2E8F0;'>" + senderEmail + "</td></tr>"
                + "<tr><td style='padding:6px; border-bottom:1px solid #E2E8F0; font-weight:bold;'>Contact Phone:</td><td style='padding:6px; border-bottom:1px solid #E2E8F0;'>" + (phone != null ? phone : "—") + "</td></tr>"
                + "<tr><td style='padding:6px; border-bottom:1px solid #E2E8F0; font-weight:bold;'>Subject:</td><td style='padding:6px; border-bottom:1px solid #E2E8F0;'>" + subject + "</td></tr>"
                + "</table>"
                + "<div style='background:#F8FAFC; border:1px solid #E2E8F0; padding:12px; border-radius:6px; margin:16px 0;'>"
                + "<p style='margin:0; font-size:13px; color:#1E293B;'><strong>Message:</strong></p>"
                + "<p style='margin:6px 0 0; font-size:13px; color:#475569;'>" + messageText + "</p>"
                + "</div>";
        String html = buildBrandedHtmlTemplate("System Administrator", title, message, "INCOMING INQUIRY", null);
        sendEmailAsync(adminEmail != null ? adminEmail : "admin@seetumanager.com", "SeettuManager Contact: " + subject, html, null);
    }

    /**
     * Archive outgoing email into physical directory for audit trails and offline testing.
     */
    private void saveToOutbox(String to, String subject, String htmlContent, boolean deliveredViaSmtp) {
        try {
            File dir = new File(emailOutputDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String safeRecipient = to.replaceAll("[^a-zA-Z0-9_.-]", "_");
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = "EMAIL_" + timestamp + "_" + safeRecipient + ".html";
            File file = new File(dir, fileName);

            String statusHeader = "<!-- STATUS: " + (deliveredViaSmtp ? "DELIVERED_VIA_SMTP" : "QUEUED_LOCAL_OUTBOX") + " -->\n"
                    + "<!-- TO: " + to + " | SUBJECT: " + subject + " | TIMESTAMP: " + LocalDateTime.now() + " -->\n";

            try (FileWriter writer = new FileWriter(file, StandardCharsets.UTF_8)) {
                writer.write(statusHeader + htmlContent);
            }
            log.info("Archived outgoing email to outbox: {} (Status: {})", file.getAbsolutePath(), deliveredViaSmtp ? "SMTP_DELIVERED" : "SAVED_LOCAL");
        } catch (Exception e) {
            log.warn("Failed to archive email file: {}", e.getMessage());
        }
    }

    /**
     * Build rich, responsive HTML template with SeettuManager branding.
     */
    private String buildBrandedHtmlTemplate(String recipientName, String title, String bodyHtml, String categoryBadge, String badgeColor) {
        String bColor = badgeColor != null ? badgeColor : "#0097B2";
        String nowYear = String.valueOf(LocalDateTime.now().getYear());

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>" + title + "</title>"
                + "</head>"
                + "<body style='margin:0; padding:0; background-color:#F8FAFC; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color:#1E293B;'>"
                + "<div style='max-width:600px; margin:24px auto; background:#FFFFFF; border-radius:12px; overflow:hidden; border:1px solid #E2E8F0; box-shadow:0 4px 12px rgba(0,0,0,0.05);'>"
                
                // Top Header Banner
                + "<div style='background:linear-gradient(135deg, #0F2F3D 0%, #003847 100%); padding:24px; text-align:left; border-bottom:3px solid " + bColor + ";'>"
                + "<table style='width:100%; border-collapse:collapse;'>"
                + "<tr>"
                + "<td>"
                + "<span style='font-size:22px; font-weight:800; color:#FFFFFF; letter-spacing:-0.5px;'>Seettu<span style='color:#00E5FF;'>Manager</span></span>"
                + "<div style='font-size:11px; color:#94A3B8; margin-top:2px;'>Save Together. Grow Together. • Sri Lanka</div>"
                + "</td>"
                + "<td style='text-align:right;'>"
                + "<span style='background:" + bColor + "; color:#FFFFFF; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;'>" + categoryBadge + "</span>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</div>"

                // Body Container
                + "<div style='padding:32px 24px;'>"
                + "<h2 style='margin:0 0 16px; font-size:18px; font-weight:700; color:#0F2F3D;'>" + title + "</h2>"
                + "<p style='font-size:14px; margin:0 0 16px; color:#475569;'>Dear <strong>" + (recipientName != null ? recipientName : "Member") + "</strong>,</p>"
                + "<div style='font-size:14px; line-height:1.6; color:#334155; margin-bottom:24px;'>" + bodyHtml + "</div>"
                + "<p style='font-size:13px; color:#64748B; margin:24px 0 0;'>Sincerely,<br><strong style='color:#0F2F3D;'>The SeettuManager Automated Administration Desk</strong><br><span style='font-size:11px;'>Colombo, Sri Lanka</span></p>"
                + "</div>"

                // Footer
                + "<div style='background:#F1F5F9; padding:16px 24px; border-top:1px solid #E2E8F0; font-size:11px; color:#64748B; line-height:1.5; text-align:center;'>"
                + "<div>Governed under <strong>The Cheetus Ordinance No. 61 of 1935</strong> (Chapter 190).</div>"
                + "<div style='margin-top:4px;'>© " + nowYear + " SeettuManager Platform. All rights reserved.</div>"
                + "<div style='margin-top:6px; font-size:10px; color:#94A3B8;'>This is an automated system dispatch. Please do not reply directly to this email address.</div>"
                + "</div>"

                + "</div>"
                + "</body>"
                + "</html>";
    }
}
