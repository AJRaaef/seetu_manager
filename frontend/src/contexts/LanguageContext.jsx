import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

// Core phrase dictionary for direct DOM translations across non-i18n elements
const PHRASES = {
  // Navigation & Menus
  "Dashboard": { si: "ප්‍රධාන පුවරුව", ta: "முகப்புப் பலகை" },
  "My Groups": { si: "මගේ කණ්ඩායම්", ta: "எனது குழுக்கள்" },
  "Members": { si: "සාමාජිකයන්", ta: "உறுப்பினர்கள்" },
  "Payments": { si: "ගෙවීම්", ta: "கொடுப்பனவுகள்" },
  "Advance": { si: "අත්තිකාරම්", ta: "முன்பணம்" },
  "Advance Payments": { si: "අත්තිකාරම් ගෙවීම්", ta: "முன்பணக் கொடுப்பனவுகள்" },
  "Audit Trail": { si: "විගණන සටහන්", ta: "தணிக்கைப் பதிவு" },
  "Emergency": { si: "හදිසි ඉල්ලීම්", ta: "அவசரம்" },
  "Reports": { si: "වාර්තා", ta: "அறிக்கைகள்" },
  "Disputes": { si: "ආරවුල්", ta: "சர்ச்சைகள்" },
  "Certificates": { si: "සහතික", ta: "சான்றிதழ்கள்" },
  "Notifications": { si: "දැනුම්දීම්", ta: "அறிவிப்புகள்" },
  "Settings": { si: "සැකසුම්", ta: "அமைப்புகள்" },
  "Help Center": { si: "උපකාරක මධ්‍යස්ථානය", ta: "உதவி மையம்" },
  "Logout": { si: "නික්මෙන්න", ta: "வெளியேறு" },
  "My Profile": { si: "මගේ පැතිකඩ", ta: "எனது சுயவிவரம்" },
  "Search": { si: "සොයන්න", ta: "தேடுக" },
  "Save Together. Grow Together.": { si: "එකට ඉතිරි කරමු. එකට දියුණු වෙමු.", ta: "ஒன்றாக சேமிப்போம். ஒன்றாக வளர்வோம்." },

  // Portal Titles
  "ADMIN PORTAL": { si: "පරිපාලක ද්වාරය", ta: "நிர்வாகி தளம்" },
  "ORGANIZER PORTAL": { si: "සංවිධායක ද්වාරය", ta: "அமைப்பாளர் தளம்" },
  "MEMBER PORTAL": { si: "සාමාජික ද්වාරය", ta: "உறுப்பினர் தளம்" },
  "Manage your Seettu": { si: "ඔබේ සීට්ටු කළමනාකරණය කරන්න", ta: "உங்கள் சீட்டை நிர்வகிக்கவும்" },

  // Landing Page
  "Home": { si: "මුල් පිටුව", ta: "முகப்பு" },
  "About Us": { si: "අප ගැන", ta: "எங்களை பற்றி" },
  "How It Works": { si: "ක්‍රියා කරන ආකාරය", ta: "செயற்படும் விதம்" },
  "FAQs": { si: "ප්‍රශ්නෝත්තර", ta: "கேள்வி-பதில்" },
  "Contact Us": { si: "අප අමතන්න", ta: "தொடர்புக்கு" },
  "Create Circle": { si: "කණ්ඩායමක් සාදන්න", ta: "குழுவை உருவாக்குக" },
  "Get Started": { si: "ආරම්භ කරන්න", ta: "தொடங்குங்கள்" },
  "My Account": { si: "මගේ ගිණුම", ta: "எனது கணக்கு" },
  "Login": { si: "පිවිසෙන්න", ta: "உள்நுழைக" },
  "Register": { si: "ලියාපදිංචි වන්න", ta: "பதிவு செய்க" },
  "Member Sign In": { si: "සාමාජික පිවිසුම", ta: "உறுப்பினர் உள்நுழைவு" },

  // Dashboard & Metrics
  "Active Groups": { si: "සක්‍රීය කණ්ඩායම්", ta: "செயலில் உள்ள குழுக்கள்" },
  "Total Groups": { si: "මුළු කණ්ඩායම්", ta: "மொத்தக் குழுக்கள்" },
  "Total Members": { si: "මුළු සාමාජිකයන්", ta: "மொத்த உறுப்பினர்கள்" },
  "Group Members": { si: "කණ්ඩායම් සාමාජිකයන්", ta: "குழு உறுப்பினர்கள்" },
  "Completion Rate": { si: "සම්පූර්ණ කිරීමේ අනුපාතය", ta: "நிறைவு விகிதம்" },
  "Discipline Score": { si: "විනය ලකුණු", ta: "ஒழுங்கு மதிப்பீடு" },
  "Advance Contributions": { si: "අත්තිකාරම් දායක මුදල්", ta: "முன்பணப் பங்களிப்புகள்" },
  "Recent Payment": { si: "මෑත ගෙවීම්", ta: "சமீபத்திய கொடுப்பனவுகள்" },
  "Recent Transactions": { si: "මෑත ගනුදෙනු", ta: "சமீபத்திய பரிவர்த்தனைகள்" },
  "Live Records": { si: "සජීවී වාර්තා", ta: "நேரடி பதிவுகள்" },
  "Upcoming Payout": { si: "ඉදිරි ගෙවීම", ta: "வரவிருக்கும் கொடுப்பனவு" },
  "Review Payout": { si: "ගෙවීම සමාලෝචනය කරන්න", ta: "கொடுப்பனவை மதிப்பாய்வு செய்க" },
  "Quick Actions": { si: "ක්ෂණික ක්‍රියා", ta: "விரைவு நடவடிக்கைகள்" },
  "Create Seettu Group": { si: "සීට්ටු කණ්ඩායමක් සාදන්න", ta: "சீட்டுக் குழுவை உருவாக்க" },
  "Record Payment": { si: "ගෙවීමක් සටහන් කරන්න", ta: "கொடுப்பனவைப் பதிவு செய்ய" },
  "View All Payments": { si: "සියලු ගෙවීම් බලන්න", ta: "அனைத்து கொடுப்பனவுகளையும் பார்க்க" },

  // Table Headers
  "Member": { si: "සාමාජිකයා", ta: "உறுப்பினர்" },
  "Amount": { si: "මුදල", ta: "தொகை" },
  "Status": { si: "තත්ත්වය", ta: "நிலை" },
  "Date": { si: "දිනය", ta: "திகதி" },
  "Actions": { si: "ක්‍රියා", ta: "நடவடிக்கைகள்" },
  "Group": { si: "කණ්ඩායම", ta: "குழு" },
  "Cycle": { si: "වටය", ta: "சுழற்சி" },

  // Payment Statuses
  "Paid": { si: "ගෙවා ඇත", ta: "செலுத்தப்பட்டது" },
  "Pending": { si: "පොරොත්තුවේ", ta: "நிலுவையில்" },
  "Overdue": { si: "කල් ඉකුත් වූ", ta: "தாமதமானது" },
  "Late": { si: "ප්‍රමාදයි", ta: "தாமதம்" },
  "Missed": { si: "මඟ හැරුණු", ta: "தவறியது" },

  // Buttons & Controls
  "Submit": { si: "ඉදිරිපත් කරන්න", ta: "சமர்ப்பிக்க" },
  "Cancel": { si: "අවලංගු කරන්න", ta: "ரத்து செய்க" },
  "Close": { si: "වසන්න", ta: "மூடுக" },
  "Save": { si: "සුරකින්න", ta: "சேமிக்க" },
  "Save Changes": { si: "වෙනස්කම් සුරකින්න", ta: "மாற்றங்களைச் சேமிக்கவும்" },
  "Download PDF": { si: "PDF බාගන්න", ta: "PDF பதிவிறக்குக" },
  "View": { si: "බලන්න", ta: "பார்க்க" },
  "Edit": { si: "සංස්කරණය", ta: "திருத்துக" },
  "Delete": { si: "මකන්න", ta: "நீக்குக" },

  // Frequencies
  "Daily": { si: "දිනපතා", ta: "தினசரி" },
  "Weekly": { si: "සතිපතා", ta: "வாராந்திர" },
  "Bi-Weekly": { si: "සති දෙකකට වරක්", ta: "இருவாரத்திற்கு ஒருமுறை" },
  "Monthly": { si: "මාසික", ta: "மாதாந்திர" },
  "per month": { si: "මසකට", ta: "மாதத்திற்கு" },
  "per week": { si: "සතියකට", ta: "வாரத்திற்கு" },
  "per day": { si: "දිනකට", ta: "நாளுக்கு" },
  "per 2 weeks": { si: "සති 2කට", ta: "2 வாரங்களுக்கு" }
};

export const LanguageProvider = ({ children }) => {
  const { t: i18nT, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const observerRef = useRef(null);

  // Custom translate helper that checks both i18n keys and direct phrases
  const t = useCallback((keyOrText, fallback) => {
    if (!keyOrText) return '';
    const cleanLang = (language || 'en').toLowerCase();
    if (cleanLang === 'en') {
      return fallback || keyOrText;
    }
    // Check direct phrase map
    if (PHRASES[keyOrText] && PHRASES[keyOrText][cleanLang]) {
      return PHRASES[keyOrText][cleanLang];
    }
    // Check fallback phrase
    if (fallback && PHRASES[fallback] && PHRASES[fallback][cleanLang]) {
      return PHRASES[fallback][cleanLang];
    }
    // Check standard i18next translation
    const val = i18nT(keyOrText, { defaultValue: '' });
    if (val && val !== keyOrText) {
      return val;
    }
    return fallback || keyOrText;
  }, [language, i18nT]);

  // Translate a single DOM text node
  const translateNode = useCallback((node, targetLang) => {
    if (!node || node.nodeType !== 3) return;
    if (targetLang === 'en') {
      if (node._origText !== undefined) {
        node.nodeValue = node._origText;
      }
      return;
    }
    const raw = node._origText !== undefined ? node._origText : node.nodeValue;
    if (!raw || typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (PHRASES[trimmed] && PHRASES[trimmed][targetLang]) {
      if (node._origText === undefined) {
        node._origText = raw;
      }
      node.nodeValue = node._origText.replace(trimmed, PHRASES[trimmed][targetLang]);
    }
  }, []);

  // Scan and translate DOM nodes
  const scanDOM = useCallback((rootElem, targetLang) => {
    if (!rootElem || typeof document === 'undefined') return;
    try {
      const walker = document.createTreeWalker(
        rootElem,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            const tag = p.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let n = walker.nextNode();
      while (n) {
        translateNode(n, targetLang);
        n = walker.nextNode();
      }

      // Also translate placeholder attributes
      const inputs = rootElem.querySelectorAll ? rootElem.querySelectorAll('input[placeholder], textarea[placeholder]') : [];
      inputs.forEach((inp) => {
        const ph = inp.getAttribute('placeholder');
        if (!ph) return;
        if (targetLang === 'en') {
          const orig = inp.getAttribute('data-orig-ph');
          if (orig) inp.setAttribute('placeholder', orig);
        } else {
          const orig = inp.getAttribute('data-orig-ph') || ph;
          const trimmed = orig.trim();
          if (PHRASES[trimmed] && PHRASES[trimmed][targetLang]) {
            if (!inp.hasAttribute('data-orig-ph')) inp.setAttribute('data-orig-ph', ph);
            inp.setAttribute('placeholder', PHRASES[trimmed][targetLang]);
          }
        }
      });
    } catch (e) {
      // safe fallback
    }
  }, [translateNode]);

  // Main change language callback
  const changeLanguage = useCallback((lang) => {
    if (!lang) return;
    const cleanLang = lang.toLowerCase();
    setLanguage(cleanLang);
    localStorage.setItem('language', cleanLang);
    i18n.changeLanguage(cleanLang);
    document.documentElement.lang = cleanLang;

    // Trigger DOM sweep for any static text
    requestAnimationFrame(() => {
      scanDOM(document.body, cleanLang);
    });
  }, [i18n, scanDOM]);

  // Effect to handle language init and live DOM changes
  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    if (i18n.language !== saved) {
      i18n.changeLanguage(saved);
    }
    document.documentElement.lang = saved;

    // Run sweep on mount / language change
    const tId = setTimeout(() => {
      scanDOM(document.body, saved);
    }, 60);

    // MutationObserver to translate dynamically rendered elements (like modals and table rows)
    if (typeof window !== 'undefined' && window.MutationObserver) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      observerRef.current = new MutationObserver((mutations) => {
        if (language === 'en') return;
        for (const m of mutations) {
          if (m.type === 'childList') {
            m.addedNodes.forEach((nd) => {
              if (nd.nodeType === 1) scanDOM(nd, language);
              else if (nd.nodeType === 3) translateNode(nd, language);
            });
          }
        }
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      clearTimeout(tId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [language, i18n, scanDOM, translateNode]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};
