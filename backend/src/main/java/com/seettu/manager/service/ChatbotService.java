package com.seettu.manager.service;

import com.seettu.manager.entity.Faq;
import com.seettu.manager.repository.FaqRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final FaqRepository faqRepository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "an", "and", "are", "as", "at", "be", "by", "can", "could", "did", "do", "does",
            "for", "from", "had", "has", "have", "he", "her", "here", "him", "his", "how", "i", "if", "in",
            "into", "is", "it", "its", "me", "more", "my", "no", "not", "of", "on", "or", "our", "please",
            "say", "she", "should", "so", "some", "tell", "than", "that", "the", "their", "them", "then",
            "there", "these", "they", "this", "to", "us", "was", "we", "were", "what", "when", "where",
            "which", "who", "whom", "why", "will", "with", "would", "you", "your", "know", "want", "like"
    ));

    private static final Pattern CLEAN_PATTERN = Pattern.compile("[^a-z0-9\\s]");

    @PostConstruct
    public void initDefaultFaqs() {
        try {
            if (faqRepository.count() == 0) {
                log.info("Seeding default Seettu FAQs into database...");
                List<Faq> defaultFaqs = Arrays.asList(
                        Faq.builder()
                                .question("How do I make a payment or upload a deposit slip?")
                                .answer("To pay your installment:\n1. Navigate to the 'Payments' tab in your left sidebar.\n2. Select your active Seettu group and current cycle.\n3. Click 'Record Payment' or 'Upload Slip'.\n4. Attach your bank slip (JPG/PNG/PDF) or enter transaction reference.\n5. The organizer will verify and confirm your payment within 24 hours.")
                                .category("Payments")
                                .build(),

                        Faq.builder()
                                .question("How is the Financial Discipline Score calculated?")
                                .answer("Your Financial Discipline Score starts at 100 and uses the formula:\nScore = 100 - [(Late Payments × 5) + (Missed Cycles × 10) + (Avg Delay Days × 0.5)]\n\n• 90-100: Excellent (Eligible for priority payout & lowest guarantor requirements)\n• 75-89: Good (Standard eligibility)\n• 50-74: Average (Guarantor required)\n• Below 50: At Risk (Subject to review)")
                                .category("Score")
                                .build(),

                        Faq.builder()
                                .question("When and how are monthly payouts disbursed?")
                                .answer("Payouts follow the registered rotational schedule agreed at group formation:\n1. Each cycle, one member is assigned the lump-sum pot.\n2. Turn allocation depends on initial lot draw, auction bid, or discipline score.\n3. The organizer transfers the collected pot via bank transfer.\n4. You can view your scheduled cycle and payout date under the 'Payouts' section.")
                                .category("Payouts")
                                .build(),

                        Faq.builder()
                                .question("Is Seettu legal under Sri Lankan law?")
                                .answer("Yes. SeettuManager operates under The Cheetus Ordinance No. 61 of 1935 (Chapter 190) and the Cheetus (Amendment) Act No. 55 of 1980 of Sri Lanka.\nAll groups adhere to statutory rules, transparent bookkeeping, and mandatory member agreements.")
                                .category("Legal")
                                .build(),

                        Faq.builder()
                                .question("What happens if a member wants to cancel or leave early?")
                                .answer("Under Cheetus Ordinance Sections 18–22:\n• Non-Prizewinners (not received pot yet): Can withdraw with 14 days' written notice. Accumulated contributions are returned at group completion minus a 5% statutory administration fee.\n• Prizewinners (already received pot): Cannot withdraw without settling all future installments or providing an acceptable bank guarantee.")
                                .category("Rules")
                                .build(),

                        Faq.builder()
                                .question("How does the refund process work?")
                                .answer("Refunds for exiting non-prizewinner members are disbursed within 30 days after the Seettu group successfully concludes its final cycle.\nAny accidental duplicate or excess payment is refunded within 3-5 business days following organizer verification.")
                                .category("Refund")
                                .build(),

                        Faq.builder()
                                .question("How do I file a dispute or complaint against an organizer or member?")
                                .answer("If you experience any dispute or default:\n1. Open the 'Complaints' page from the footer quick links or your profile.\n2. Submit an official dispute ticket with cycle number and transfer evidence.\n3. If internal mediation fails, disputes are handled via statutory arbitration under Section 28 of the Cheetus Ordinance.")
                                .category("Complaints")
                                .build(),

                        Faq.builder()
                                .question("How do I contact SeettuManager customer support?")
                                .answer("You can reach our Colombo support desk:\n• Phone: +94 11 234 5678 / +94 77 123 4567\n• WhatsApp: +94 77 987 6543\n• Email: support@seettumanager.com / chits@seettumanager.com\n• Head Office: Level 4, Colombo Commercial Hub, Galle Road, Colombo 03, Sri Lanka\n• Hours: Monday – Saturday, 8:30 AM – 5:30 PM.")
                                .category("Support")
                                .build(),

                        Faq.builder()
                                .question("How do I download my Seettu completion certificate?")
                                .answer("Once all cycles in your Seettu group are completed and all installments are cleared, go to your completed group dashboard and click 'Download Certificate'. This provides a verifiable PDF proof of your clean credit track record.")
                                .category("Certificates")
                                .build()
                );
                faqRepository.saveAll(defaultFaqs);
                log.info("Successfully seeded {} default FAQs.", defaultFaqs.size());
            }
        } catch (Exception e) {
            log.warn("Could not seed default FAQs (possibly read-only or table not ready): {}", e.getMessage());
        }
    }

    public String getAnswerForQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            return getGreetingResponse();
        }

        String normalized = rawQuery.toLowerCase();
        normalized = CLEAN_PATTERN.matcher(normalized).replaceAll(" ").trim();

        String[] words = normalized.split("\\s+");
        Set<String> queryTokens = new HashSet<>();
        for (String w : words) {
            if (!w.isEmpty() && !STOP_WORDS.contains(w) && w.length() > 1) {
                queryTokens.add(w);
            }
        }

        // 1. Check quick greetings
        if (isGreeting(normalized, queryTokens)) {
            return getGreetingResponse();
        }

        // 2. Search database FAQs with token scoring
        try {
            List<Faq> allFaqs = faqRepository.findAll();
            if (!allFaqs.isEmpty() && !queryTokens.isEmpty()) {
                Faq bestMatch = null;
                int highestScore = 0;

                for (Faq faq : allFaqs) {
                    int score = calculateFaqMatchScore(faq, queryTokens, normalized);
                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = faq;
                    }
                }

                // If match score is high enough (at least 3 points, equivalent to matching question token)
                if (bestMatch != null && highestScore >= 3) {
                    return bestMatch.getAnswer();
                }
            }
        } catch (Exception e) {
            log.warn("Error querying FAQ database, falling back to rule engine: {}", e.getMessage());
        }

        // 3. Fallback Topic Intent Matching
        return resolveIntentFallback(normalized, queryTokens);
    }

    private int calculateFaqMatchScore(Faq faq, Set<String> queryTokens, String normalizedQuery) {
        int score = 0;
        String q = faq.getQuestion() != null ? faq.getQuestion().toLowerCase() : "";
        String a = faq.getAnswer() != null ? faq.getAnswer().toLowerCase() : "";
        String cat = faq.getCategory() != null ? faq.getCategory().toLowerCase() : "";

        // Direct phrase match bonus
        if (q.contains(normalizedQuery) || normalizedQuery.contains(q)) {
            score += 15;
        }

        for (String token : queryTokens) {
            if (q.contains(token)) {
                score += 5; // Strong weight for token in question
            }
            if (cat.contains(token)) {
                score += 3; // Medium weight for category
            }
            if (a.contains(token)) {
                score += 1; // Light weight for token in answer
            }
        }

        return score;
    }

    private boolean isGreeting(String normalized, Set<String> tokens) {
        if (tokens.contains("hi") || tokens.contains("hello") || tokens.contains("hey")
                || tokens.contains("ayubowan") || tokens.contains("vanakkam") || tokens.contains("greetings")
                || normalized.equals("hi") || normalized.equals("hello") || normalized.equals("help")) {
            return true;
        }
        return false;
    }

    private String getGreetingResponse() {
        return "Hello! Welcome to the SeettuManager Assistant 👋\n\n" +
                "I can help you with:\n" +
                "• 💳 How to pay installments & upload bank receipts\n" +
                "• 📊 How the Financial Discipline Score is calculated\n" +
                "• 🔄 Rotational payout cycles & turns\n" +
                "• 📜 Cheetus Ordinance (Sri Lankan legal compliance)\n" +
                "• ❌ Cancellation, exit rules & refund settlement\n" +
                "• ⚖️ Filing disputes & member complaints\n" +
                "• 📞 Support contact & branch details\n\n" +
                "Feel free to type your question or click any topic chip below!";
    }

    private String resolveIntentFallback(String normalized, Set<String> tokens) {
        // Score intent
        if (containsAny(tokens, "score", "discipline", "formula", "rating", "penalty", "points", "tier", "lakunu", "pulli")) {
            return "Your Financial Discipline Score starts at 100 points:\n\n" +
                    "Formula: 100 - [(Late Payments × 5) + (Missed Cycles × 10) + (Avg Delay Days × 0.5)]\n\n" +
                    "• 90-100 (Platinum / Excellent): First priority for coveted payout rounds & lowest guarantor demands.\n" +
                    "• 75-89 (Gold / Good): Standard eligibility for all cycles.\n" +
                    "• 50-74 (Silver / Average): Guarantor mandatory.\n" +
                    "• Below 50: High risk, subject to group organizer restrictions.";
        }

        // Payment intent
        if (containsAny(tokens, "pay", "payment", "installment", "deposit", "slip", "transfer", "bank", "upload", "receipt", "salli", "panam", "kaasu")) {
            return "To record or pay your installment in SeettuManager:\n\n" +
                    "1. Click 'Payments' on the left navigation menu.\n" +
                    "2. Select your active Seettu Group and relevant Cycle number.\n" +
                    "3. Click 'Record Payment' or 'Upload Slip'.\n" +
                    "4. Upload your bank deposit slip or transaction reference.\n" +
                    "5. Your organizer will verify and mark it as 'Paid' within 24 hours.";
        }

        // Payout intent
        if (containsAny(tokens, "payout", "cycle", "turn", "rotation", "prize", "pot", "draw", "auction", "lump", "receive", "collect")) {
            return "Payout details & rotational cycles:\n\n" +
                    "• In every cycle (usually monthly), one designated member collects the pooled pot.\n" +
                    "• The recipient turn is determined by initial draw, auction bidding, or member discipline score.\n" +
                    "• Organizers process direct bank payouts and post receipt evidence on your group page.\n" +
                    "• Check the 'Payouts' section on your dashboard to see your scheduled turn date!";
        }

        // Law & Legal intent
        if (containsAny(tokens, "law", "ordinance", "cheetus", "legal", "act", "chapter", "190", "court", "gazette", "drc", "nithiya", "sattam")) {
            return "SeettuManager operates in full alignment with Sri Lankan Chit law:\n\n" +
                    "• Governed by The Cheetus Ordinance No. 61 of 1935 (Chapter 190).\n" +
                    "• Amended under Cheetus (Amendment) Act No. 55 of 1980.\n" +
                    "• Complies with Sri Lanka Personal Data Protection Act No. 9 of 2022 (PDPA).\n" +
                    "• Mandates transparent accounts, verified member registers, and legal dispute channels.";
        }

        // Dispute & Complaints intent
        if (containsAny(tokens, "dispute", "complaint", "issue", "cheat", "fraud", "default", "delay", "arbitration", "ticket", "arawula", "pirachchanai")) {
            return "Resolving disputes or reporting issues:\n\n" +
                    "1. Visit the 'Complaints' page via the footer quick links.\n" +
                    "2. Submit your grievance with the Seettu Group ID and transfer proof.\n" +
                    "3. If unresolved within 7 business days, matters escalate to statutory arbitration under Section 28 of the Cheetus Ordinance or the local District Court.\n" +
                    "4. Contact mediation directly at: disputes@seettumanager.com";
        }

        // Cancellation intent
        if (containsAny(tokens, "cancel", "cancellation", "exit", "leave", "quit", "withdraw", "stop", "drop")) {
            return "Cancellation & Exit Rules:\n\n" +
                    "• Non-Prizewinners (not received pot yet): You may withdraw by providing 14 days' written notice to the organizer. Contributions will be refunded at group maturity minus a 5% statutory administrative fee.\n" +
                    "• Prizewinners (already received pot): You cannot exit midway without full settlement of remaining installments or executing an enforceable bank guarantee.";
        }

        // Refund intent
        if (containsAny(tokens, "refund", "money back", "return", "excess", "overpayment", "settle", "settlement")) {
            return "Refund Settlement Policy:\n\n" +
                    "• Exited non-prizewinner balances are disbursed within 30 days following final group cycle completion.\n" +
                    "• Erroneous or duplicate transfers are refunded within 3-5 working days upon bank confirmation.\n" +
                    "• Disputed funds are maintained in safe custody until formal resolution.";
        }

        // Contact & Support intent
        if (containsAny(tokens, "contact", "phone", "helpline", "call", "email", "office", "address", "support", "hotline", "colombo")) {
            return "Contact SeettuManager Support:\n\n" +
                    "• Hotline: +94 11 234 5678 / +94 77 123 4567\n" +
                    "• WhatsApp Support: +94 77 987 6543\n" +
                    "• Email: support@seettumanager.com / chits@seettumanager.com\n" +
                    "• Head Office: Level 4, Colombo Commercial Hub, Galle Road, Colombo 03, Sri Lanka\n" +
                    "• Working Hours: Monday – Saturday, 8:30 AM – 5:30 PM";
        }

        // Certificate intent
        if (containsAny(tokens, "certificate", "cert", "download", "clearance", "pdf", "proof")) {
            return "Seettu Completion Certificate:\n\n" +
                    "Upon successful completion of all cycles with no outstanding arrears, open your completed group page and click 'Download Certificate'. This official document proves your financial reliability and creditworthiness.";
        }

        // Default friendly fallback with suggested topics
        return "I couldn't find an exact answer for that query, but here is what I can help you with:\n\n" +
                "• 💳 How to make payments & upload bank slips\n" +
                "• 📊 How the Financial Discipline Score is calculated\n" +
                "• 🔄 Rotational payout cycles & receiving your turn\n" +
                "• 📜 The Cheetus Ordinance (Sri Lankan legal rules)\n" +
                "• ❌ Member cancellation & exit rules\n" +
                "• 💰 Refund & overpayment policies\n" +
                "• ⚖️ Filing disputes or reporting defaults\n" +
                "• 📞 Support hotlines & office contacts\n\n" +
                "Please click any quick topic button below or rephrase your question!";
    }

    private boolean containsAny(Set<String> tokens, String... candidates) {
        for (String c : candidates) {
            if (tokens.contains(c)) {
                return true;
            }
        }
        return false;
    }
}
