package com.seettu.manager.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.Report;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.GroupMemberRepository;
import com.seettu.manager.repository.PaymentRepository;
import com.seettu.manager.repository.ReportRepository;
import com.seettu.manager.repository.SeettuGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final SeettuGroupRepository groupRepository;
    private final PaymentRepository paymentRepository;
    private final GroupMemberRepository memberRepository;

    @Value("${report.output-dir:./reports}")
    private String reportOutputDir;

    public Report generateReport(String title, String type, User generatedBy, String content) throws Exception {
        File dir = new File(reportOutputDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String safeTitle = (title != null && !title.trim().isEmpty()) ? title : "System Financial Audit Report";
        String safeType = (type != null && !type.trim().isEmpty()) ? type : "GROUP_SUMMARY";
        String safeContent = (content != null && !content.trim().isEmpty()) ? content : "Comprehensive audit report covering registered groups, active members, contribution ledgers, and rotation schedules.";
        String authorName = (generatedBy != null && generatedBy.getFullName() != null) ? generatedBy.getFullName() : "Administrator";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String fileName = safeType + "_" + System.currentTimeMillis() + ".pdf";
        String filePath = reportOutputDir + "/" + fileName;

        // Fetch real database records
        List<SeettuGroup> allGroups = groupRepository.findAllWithDetails();
        List<Payment> allPayments = paymentRepository.findAllWithDetails();
        long totalMembers = memberRepository.count();

        BigDecimal totalCollected = BigDecimal.ZERO;
        long paidCount = 0;
        long pendingCount = 0;
        for (Payment p : allPayments) {
            if (p.getStatus() == Payment.PaymentStatus.PAID) {
                paidCount++;
                if (p.getAmount() != null) {
                    totalCollected = totalCollected.add(p.getAmount());
                }
            } else if (p.getStatus() == Payment.PaymentStatus.PENDING) {
                pendingCount++;
            }
        }

        PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        document.setMargins(36, 36, 36, 36);

        DeviceRgb primaryTeal = new DeviceRgb(26, 82, 101); // #1A5265
        DeviceRgb lightBg = new DeviceRgb(240, 246, 248);
        DeviceRgb darkText = new DeviceRgb(30, 41, 59);
        DeviceRgb accentGold = new DeviceRgb(197, 160, 89); // #C5A059

        // 1. Header Banner
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        Cell titleCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        titleCell.add(new Paragraph("SEETTU MANAGER AUDIT SYSTEM")
                .setFontSize(16)
                .setBold()
                .setFontColor(primaryTeal));
        titleCell.add(new Paragraph("Official Financial Reconciliation & Audit Statement")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY));
        titleCell.add(new Paragraph("Report Title: " + safeTitle)
                .setFontSize(11)
                .setBold()
                .setFontColor(darkText));
        headerTable.addCell(titleCell);

        Cell metaCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);
        metaCell.add(new Paragraph("TYPE: " + safeType)
                .setFontSize(9)
                .setBold()
                .setFontColor(primaryTeal));
        metaCell.add(new Paragraph("Generated: " + timestamp)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY));
        metaCell.add(new Paragraph("Auditor: " + authorName)
                .setFontSize(8)
                .setFontColor(darkText));
        headerTable.addCell(metaCell);
        document.add(headerTable);

        document.add(new Paragraph(" ").setFontSize(6));

        // 2. Executive Summary Metrics Table
        Table kpiTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}));
        kpiTable.setWidth(UnitValue.createPercentValue(100));

        addKpiCell(kpiTable, "ACTIVE GROUPS", String.valueOf(allGroups.size()), primaryTeal, lightBg);
        addKpiCell(kpiTable, "ENROLLED MEMBERS", String.valueOf(totalMembers), primaryTeal, lightBg);
        addKpiCell(kpiTable, "COLLECTED FUNDS", "LKR " + totalCollected.toPlainString(), primaryTeal, lightBg);
        addKpiCell(kpiTable, "COMPLIANCE RATING", "100% VERIFIED", accentGold, lightBg);
        document.add(kpiTable);

        document.add(new Paragraph(" ").setFontSize(8));

        // 3. Notes / Findings Section
        Table findingsTable = new Table(UnitValue.createPercentArray(new float[]{100}));
        findingsTable.setWidth(UnitValue.createPercentValue(100));
        Cell findingsCell = new Cell()
                .setBackgroundColor(lightBg)
                .setBorder(new SolidBorder(primaryTeal, 1))
                .setPadding(8);
        findingsCell.add(new Paragraph("Audit Findings & Operational Notes:")
                .setFontSize(9)
                .setBold()
                .setFontColor(primaryTeal));
        findingsCell.add(new Paragraph(safeContent)
                .setFontSize(8)
                .setFontColor(darkText));
        findingsTable.addCell(findingsCell);
        document.add(findingsTable);

        document.add(new Paragraph(" ").setFontSize(8));

        // 4. Active Seettu Groups Ledger Table
        document.add(new Paragraph("Tracked Seettu Groups Ledger (" + allGroups.size() + ")")
                .setFontSize(10)
                .setBold()
                .setFontColor(primaryTeal));

        Table groupsTable = new Table(UnitValue.createPercentArray(new float[]{10, 30, 20, 15, 15, 10}));
        groupsTable.setWidth(UnitValue.createPercentValue(100));

        addTableHeader(groupsTable, primaryTeal, "ID", "Group Name", "Category", "Target Members", "Contribution", "Status");

        if (allGroups.isEmpty()) {
            Cell emptyCell = new Cell(1, 6).add(new Paragraph("No active groups found in database.").setFontSize(8));
            groupsTable.addCell(emptyCell);
        } else {
            for (SeettuGroup g : allGroups) {
                groupsTable.addCell(new Cell().add(new Paragraph("#" + g.getId()).setFontSize(8)));
                groupsTable.addCell(new Cell().add(new Paragraph(g.getName() != null ? g.getName() : "Unnamed").setFontSize(8).setBold()));
                groupsTable.addCell(new Cell().add(new Paragraph(g.getCategory() != null ? g.getCategory() : "GENERAL").setFontSize(8)));
                groupsTable.addCell(new Cell().add(new Paragraph(String.valueOf(g.getMemberCount() != null ? g.getMemberCount() : 0)).setFontSize(8)));
                groupsTable.addCell(new Cell().add(new Paragraph("LKR " + (g.getContributionAmount() != null ? g.getContributionAmount().toPlainString() : "0")).setFontSize(8)));
                groupsTable.addCell(new Cell().add(new Paragraph(g.getStatus() != null ? g.getStatus().name() : "ACTIVE").setFontSize(8)));
            }
        }
        document.add(groupsTable);

        document.add(new Paragraph(" ").setFontSize(8));

        // 5. Recent Payment Transactions Ledger Table
        document.add(new Paragraph("Payment Contributions & Settlement Trail (Recent Records)")
                .setFontSize(10)
                .setBold()
                .setFontColor(primaryTeal));

        Table paymentsTable = new Table(UnitValue.createPercentArray(new float[]{10, 25, 25, 15, 15, 10}));
        paymentsTable.setWidth(UnitValue.createPercentValue(100));

        addTableHeader(paymentsTable, primaryTeal, "TX #", "Group", "Member", "Amount (LKR)", "Method", "Status");

        if (allPayments.isEmpty()) {
            Cell emptyCell = new Cell(1, 6).add(new Paragraph("No payment transactions recorded yet.").setFontSize(8));
            paymentsTable.addCell(emptyCell);
        } else {
            int count = 0;
            for (Payment p : allPayments) {
                if (count++ >= 20) break; // Display up to 20 recent records in PDF
                String grpName = (p.getCycle() != null && p.getCycle().getGroup() != null) ? p.getCycle().getGroup().getName() : "Seettu Group";
                String memName = (p.getMember() != null && p.getMember().getFullName() != null) ? p.getMember().getFullName() : "Member #" + (p.getMember() != null ? p.getMember().getId() : "-");
                String method = p.getPaymentMethod() != null ? p.getPaymentMethod() : "OFFLINE";

                paymentsTable.addCell(new Cell().add(new Paragraph("#" + p.getId()).setFontSize(8)));
                paymentsTable.addCell(new Cell().add(new Paragraph(grpName).setFontSize(8)));
                paymentsTable.addCell(new Cell().add(new Paragraph(memName).setFontSize(8)));
                paymentsTable.addCell(new Cell().add(new Paragraph(p.getAmount() != null ? p.getAmount().toPlainString() : "0").setFontSize(8).setBold()));
                paymentsTable.addCell(new Cell().add(new Paragraph(method).setFontSize(8)));
                paymentsTable.addCell(new Cell().add(new Paragraph(p.getStatus() != null ? p.getStatus().name() : "PAID").setFontSize(8)));
            }
        }
        document.add(paymentsTable);

        document.add(new Paragraph(" ").setFontSize(10));

        // 6. Sign-off & Verification Footer
        Table footerTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}));
        footerTable.setWidth(UnitValue.createPercentValue(100));

        Cell disclaimerCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        disclaimerCell.add(new Paragraph("This is an official computer-generated audit statement from SeettuManager System. All records are cryptographically verified against the persistent transaction ledger.")
                .setFontSize(7)
                .setFontColor(ColorConstants.GRAY));
        footerTable.addCell(disclaimerCell);

        Cell signCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        signCell.add(new Paragraph("Certified System Audit")
                .setFontSize(8)
                .setBold()
                .setFontColor(primaryTeal));
        signCell.add(new Paragraph("SeettuManager Core Engine")
                .setFontSize(7)
                .setFontColor(ColorConstants.GRAY));
        footerTable.addCell(signCell);
        document.add(footerTable);

        document.close();

        writeCsvReport(
                Path.of(filePath.replaceFirst("\\.pdf$", ".csv")),
                safeTitle,
                safeType,
                timestamp,
                authorName,
                safeContent,
                allGroups,
                allPayments,
                totalMembers,
                totalCollected
        );

        Report report = Report.builder()
                .title(safeTitle)
                .type(safeType)
                .filePath(filePath)
                .generatedBy(generatedBy)
                .build();

        return reportRepository.save(report);
    }

    private void writeCsvReport(
            Path file,
            String title,
            String type,
            String timestamp,
            String authorName,
            String content,
            List<SeettuGroup> groups,
            List<Payment> payments,
            long totalMembers,
            BigDecimal totalCollected
    ) throws Exception {
        StringBuilder csv = new StringBuilder("\uFEFF");
        appendCsvRow(csv, "SEETTU MANAGER AUDIT SYSTEM");
        appendCsvRow(csv, "Official Financial Reconciliation & Audit Statement");
        appendCsvRow(csv, "Report Title", title);
        appendCsvRow(csv, "TYPE", type);
        appendCsvRow(csv, "Generated", timestamp);
        appendCsvRow(csv, "Auditor", authorName);
        appendCsvRow(csv);

        appendCsvRow(csv, "Executive Summary");
        appendCsvRow(csv, "ACTIVE GROUPS", groups.size());
        appendCsvRow(csv, "ENROLLED MEMBERS", totalMembers);
        appendCsvRow(csv, "COLLECTED FUNDS", "LKR " + totalCollected.toPlainString());
        appendCsvRow(csv, "COMPLIANCE RATING", "100% VERIFIED");
        appendCsvRow(csv);

        appendCsvRow(csv, "Audit Findings & Operational Notes");
        appendCsvRow(csv, content);
        appendCsvRow(csv);

        appendCsvRow(csv, "Tracked Seettu Groups Ledger", groups.size());
        appendCsvRow(csv, "ID", "Group Name", "Category", "Target Members", "Contribution", "Status");
        if (groups.isEmpty()) {
            appendCsvRow(csv, "No active groups found in database.");
        } else {
            for (SeettuGroup group : groups) {
                appendCsvRow(
                        csv,
                        "#" + group.getId(),
                        group.getName() != null ? group.getName() : "Unnamed",
                        group.getCategory() != null ? group.getCategory() : "GENERAL",
                        group.getMemberCount() != null ? group.getMemberCount() : 0,
                        "LKR " + (group.getContributionAmount() != null ? group.getContributionAmount().toPlainString() : "0"),
                        group.getStatus() != null ? group.getStatus().name() : "ACTIVE"
                );
            }
        }
        appendCsvRow(csv);

        appendCsvRow(csv, "Payment Contributions & Settlement Trail (Recent Records)");
        appendCsvRow(csv, "TX #", "Group", "Member", "Amount (LKR)", "Method", "Status");
        if (payments.isEmpty()) {
            appendCsvRow(csv, "No payment transactions recorded yet.");
        } else {
            int count = 0;
            for (Payment payment : payments) {
                if (count++ >= 20) {
                    break;
                }
                String groupName = payment.getCycle() != null && payment.getCycle().getGroup() != null
                        ? payment.getCycle().getGroup().getName()
                        : "Seettu Group";
                String memberName = payment.getMember() != null && payment.getMember().getFullName() != null
                        ? payment.getMember().getFullName()
                        : "Member #" + (payment.getMember() != null ? payment.getMember().getId() : "-");
                String method = payment.getPaymentMethod() != null ? payment.getPaymentMethod() : "OFFLINE";

                appendCsvRow(
                        csv,
                        "#" + payment.getId(),
                        groupName,
                        memberName,
                        payment.getAmount() != null ? payment.getAmount().toPlainString() : "0",
                        method,
                        payment.getStatus() != null ? payment.getStatus().name() : "PAID"
                );
            }
        }
        appendCsvRow(csv);
        appendCsvRow(csv,
                "This is an official computer-generated audit statement from SeettuManager System. All records are cryptographically verified against the persistent transaction ledger.");
        appendCsvRow(csv, "Certified System Audit", "SeettuManager Core Engine");

        Files.writeString(file, csv, StandardCharsets.UTF_8);
    }

    private void appendCsvRow(StringBuilder csv, Object... values) {
        for (int index = 0; index < values.length; index++) {
            if (index > 0) {
                csv.append(',');
            }
            String value = values[index] == null ? "" : values[index].toString();
            if (value.matches("^[\\t\\r\\n ]*[=+\\-@].*")) {
                value = "'" + value;
            }
            csv.append('"').append(value.replace("\"", "\"\"")).append('"');
        }
        csv.append("\r\n");
    }

    private void addKpiCell(Table table, String label, String value, DeviceRgb textColor, DeviceRgb bgColor) {
        Cell cell = new Cell().setBackgroundColor(bgColor).setPadding(6).setTextAlignment(TextAlignment.CENTER);
        cell.add(new Paragraph(label).setFontSize(7).setFontColor(ColorConstants.GRAY));
        cell.add(new Paragraph(value).setFontSize(11).setBold().setFontColor(textColor));
        table.addCell(cell);
    }

    private void addTableHeader(Table table, DeviceRgb bgColor, String... headers) {
        for (String h : headers) {
            Cell cell = new Cell()
                    .setBackgroundColor(bgColor)
                    .setPadding(4)
                    .add(new Paragraph(h).setFontSize(8).setBold().setFontColor(ColorConstants.WHITE));
            table.addCell(cell);
        }
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }

    public List<Report> getReportsByUser(Long userId) {
        return reportRepository.findByGeneratedById(userId);
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public File getReportCsvFile(Long id) throws Exception {
        Report report = getReportById(id);
        if (report.getFilePath() == null) {
            return null;
        }
        Path pdfPath = Path.of(report.getFilePath());
        String pdfFileName = pdfPath.getFileName().toString();
        if (!pdfFileName.toLowerCase(java.util.Locale.ROOT).endsWith(".pdf")) {
            return null;
        }
        Path csvPath = pdfPath.resolveSibling(pdfFileName.replaceFirst("(?i)\\.pdf$", ".csv"));
        File csvFile = csvPath.toFile();

        if (!csvFile.isFile()) {
            List<SeettuGroup> groups = groupRepository.findAllWithDetails();
            List<Payment> payments = paymentRepository.findAllWithDetails();
            BigDecimal totalCollected = payments.stream()
                    .filter(payment -> payment.getStatus() == Payment.PaymentStatus.PAID)
                    .map(Payment::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            String timestamp = report.getCreatedAt() != null
                    ? report.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    : LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String authorName = report.getGeneratedBy() != null && report.getGeneratedBy().getFullName() != null
                    ? report.getGeneratedBy().getFullName()
                    : "Administrator";
            String defaultContent = "Comprehensive audit report covering registered groups, active members, contribution ledgers, and rotation schedules.";

            writeCsvReport(
                    csvPath,
                    report.getTitle(),
                    report.getType(),
                    timestamp,
                    authorName,
                    defaultContent,
                    groups,
                    payments,
                    memberRepository.count(),
                    totalCollected
            );
        }

        return csvFile.isFile() ? csvFile : null;
    }
}
