package com.seettu.manager.service;

import com.seettu.manager.entity.Payment;
import com.seettu.manager.entity.PaymentEvidence;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.PaymentEvidenceRepository;
import com.seettu.manager.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentEvidenceService {

    private final PaymentEvidenceRepository paymentEvidenceRepository;
    private final PaymentRepository paymentRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public PaymentEvidence addEvidence(Long paymentId, String filePath) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
        
        String cleanPath = filePath;
        if (cleanPath != null && !cleanPath.startsWith("/") && !cleanPath.startsWith("http")) {
            cleanPath = "/uploads/payments/" + cleanPath;
        }

        PaymentEvidence evidence = PaymentEvidence.builder()
                .payment(payment)
                .filePath(cleanPath)
                .build();
        
        return paymentEvidenceRepository.save(evidence);
    }

    @Transactional
    public PaymentEvidence saveEvidenceFile(Long paymentId, MultipartFile file) throws IOException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Payment slip file cannot be empty");
        }

        Path paymentsDir = Paths.get(uploadDir, "payments");
        if (!Files.exists(paymentsDir)) {
            Files.createDirectories(paymentsDir);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        if (extension.isEmpty()) {
            extension = ".png";
        }

        String filename = "slip_" + paymentId + "_" + System.currentTimeMillis() + extension;
        Path targetPath = paymentsDir.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String webPath = "/uploads/payments/" + filename;
        PaymentEvidence evidence = PaymentEvidence.builder()
                .payment(payment)
                .filePath(webPath)
                .build();

        return paymentEvidenceRepository.save(evidence);
    }

    @Transactional(readOnly = true)
    public List<PaymentEvidence> getEvidencesByPayment(Long paymentId) {
        return paymentEvidenceRepository.findByPaymentId(paymentId);
    }
}
