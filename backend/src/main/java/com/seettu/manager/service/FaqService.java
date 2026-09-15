package com.seettu.manager.service;

import com.seettu.manager.entity.Faq;
import com.seettu.manager.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    public List<Faq> getAllFaqs() {
        return faqRepository.findAll();
    }
    
    public List<Faq> searchFaqs(String keyword) {
        return faqRepository.searchByKeyword(keyword);
    }
}
