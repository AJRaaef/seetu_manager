package com.seettu.manager.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
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
            return certificateRepository.findByUserIdAndGroupId(user.getId(), group.getId()).get();
        }

        File dir = new File(certificateOutputDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String uuid = UUID.randomUUID().toString();
        String fileName = "CERT_" + uuid + ".pdf";
        String filePath = certificateOutputDir + "/" + fileName;

        PdfWriter writer = new PdfWriter(new FileOutputStream(filePath));
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        document.add(new Paragraph("CERTIFICATE OF COMPLETION"));
        document.add(new Paragraph("This is to certify that"));
        document.add(new Paragraph(user.getFullName()));
        document.add(new Paragraph("has successfully completed the Seettu Group: " + group.getName()));
        document.add(new Paragraph("Certificate ID: " + uuid));
        
        document.close();

        Certificate certificate = Certificate.builder()
                .user(user)
                .group(group)
                .certificateUuid(uuid)
                .build();

        return certificateRepository.save(certificate);
    }

    public List<Certificate> getCertificatesByUser(Long userId) {
        return certificateRepository.findByUserId(userId);
    }
}
