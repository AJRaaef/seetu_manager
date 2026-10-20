package com.seettu.manager.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.seettu.manager.entity.Certificate;
import com.seettu.manager.entity.SeettuGroup;
import com.seettu.manager.entity.User;
import com.seettu.manager.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    @Value("${certificate.output-dir:./certificates}")
    private String certificateOutputDir;

    public Certificate generateCertificate(User user, SeettuGroup group) throws Exception {
        if (certificateRepository.existsByUserIdAndGroupId(user.getId(), group.getId())) {
            Certificate existing = certificateRepository.findByUserIdAndGroupId(user.getId(), group.getId()).get();
            File file = new File(certificateOutputDir + "/CERT_" + existing.getCertificateUuid() + ".pdf");
            if (!file.exists()) {
                buildPdfFile(existing.getCertificateUuid(), user, group);
            }
            return existing;
        }

        String uuid = UUID.randomUUID().toString();
        buildPdfFile(uuid, user, group);

        Certificate certificate = Certificate.builder()
                .user(user)
                .group(group)
                .certificateUuid(uuid)
                .build();

        return certificateRepository.save(certificate);
    }

    public void buildPdfFile(String uuid, User user, SeettuGroup group) throws Exception {
        File dir = new File(certificateOutputDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filePath = certificateOutputDir + "/CERT_" + uuid + ".pdf";

        PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate());
        Document document = new Document(pdf);
        document.setMargins(30, 30, 30, 30);

        DeviceRgb navyTeal = new DeviceRgb(15, 47, 61);
        DeviceRgb goldAccent = new DeviceRgb(197, 160, 89);
        DeviceRgb lightBg = new DeviceRgb(248, 250, 252);
        DeviceRgb slateGray = new DeviceRgb(100, 116, 139);

        Table outerBox = new Table(UnitValue.createPercentArray(new float[]{100}));
        outerBox.setWidth(UnitValue.createPercentValue(100));
        Cell innerCell = new Cell()
                .setBorder(new SolidBorder(navyTeal, 3))
                .setBackgroundColor(lightBg)
                .setPadding(24)
                .setTextAlignment(TextAlignment.CENTER);

        innerCell.add(new Paragraph("SEETTU MANAGER PLATFORM • SRI LANKA")
                .setFontSize(11)
                .setBold()
                .setFontColor(goldAccent));

        innerCell.add(new Paragraph("CERTIFICATE OF COMPLETION")
                .setFontSize(24)
                .setBold()
                .setFontColor(navyTeal)
                .setMarginTop(6));

        innerCell.add(new Paragraph("STATUTORY ROTATING SAVINGS & CREDIT SCHEME")
                .setFontSize(9)
                .setFontColor(slateGray));

        innerCell.add(new Paragraph("This is to solemnly certify that")
                .setFontSize(10)
                .setFontColor(slateGray)
                .setMarginTop(12));

        innerCell.add(new Paragraph(user.getFullName() != null ? user.getFullName() : "Valued Member")
                .setFontSize(20)
                .setBold()
                .setFontColor(navyTeal)
                .setMarginTop(4)
                .setMarginBottom(4));

        String groupName = group.getName() != null ? group.getName() : "Seettu Circle";
        String amountStr = group.getContributionAmount() != null ? group.getContributionAmount().toPlainString() : "0";

        innerCell.add(new Paragraph("has successfully satisfied all contributions and completed participation in:")
                .setFontSize(10)
                .setFontColor(slateGray));

        innerCell.add(new Paragraph("“" + groupName + "” • (Contribution: LKR " + amountStr + ")")
                .setFontSize(13)
                .setBold()
                .setFontColor(goldAccent)
                .setMarginTop(4)
                .setMarginBottom(12));

        Table bottomTable = new Table(UnitValue.createPercentArray(new float[]{33, 34, 33}));
        bottomTable.setWidth(UnitValue.createPercentValue(100));
        bottomTable.setMarginTop(12);

        Cell certIdCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setTextAlignment(TextAlignment.LEFT);
        certIdCell.add(new Paragraph("CERTIFICATE REF:").setFontSize(7).setBold().setFontColor(slateGray));
        certIdCell.add(new Paragraph(uuid).setFontSize(8).setBold().setFontColor(navyTeal));
        certIdCell.add(new Paragraph("The Cheetus Ordinance No. 61 of 1935").setFontSize(7).setFontColor(slateGray));
        bottomTable.addCell(certIdCell);

        Cell sealCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
        sealCell.add(new Paragraph("★ OFFICIAL DIGITAL SEAL ★").setFontSize(9).setBold().setFontColor(goldAccent));
        sealCell.add(new Paragraph("FINANCIAL DISCIPLINE RATING: 100/100").setFontSize(8).setBold().setFontColor(navyTeal));
        bottomTable.addCell(sealCell);

        Cell signCell = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT);
        signCell.add(new Paragraph("AUTHORIZED VERIFICATION").setFontSize(8).setBold().setFontColor(navyTeal));
        signCell.add(new Paragraph("SeettuManager Core Engine").setFontSize(7).setFontColor(slateGray));
        signCell.add(new Paragraph("Issued: " + java.time.LocalDate.now().toString()).setFontSize(7).setFontColor(slateGray));
        bottomTable.addCell(signCell);

        innerCell.add(bottomTable);
        outerBox.addCell(innerCell);
        document.add(outerBox);

        document.close();
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public List<Certificate> getCertificatesByUser(Long userId) {
        return certificateRepository.findByUserId(userId);
    }

    public Certificate getCertificateById(Long id) {
        return certificateRepository.findById(id).orElseThrow();
    }
}
