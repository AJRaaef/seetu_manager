package com.seettu.manager.service;

import com.seettu.manager.entity.Faq;
import com.seettu.manager.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final FaqRepository faqRepository;

    public String getAnswerForQuery(String query) {
        List<Faq> faqs = faqRepository.searchByKeyword(query);
        if (faqs.isEmpty()) {
            return "I'm sorry, I don't understand your question. Please try asking about payments, scores, groups, or certificates.";
        }
        return faqs.get(0).getAnswer();
    }
}
