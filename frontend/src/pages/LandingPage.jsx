import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../hooks/useLanguage";
import { useNotification } from "../hooks/useNotification";
import Icon from "../components/Icons";
import LegalPoliciesModal from "../components/LegalPoliciesModal";

const LandingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { unreadCount } = useNotification();

  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [faqCategory, setFaqCategory] = useState("ALL");
  const [faqSearch, setFaqSearch] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await fetch("https://formsubmit.co/ajax/seetumanager@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email,
          message: contactForm.message,
          _subject: `New SeettuManager Website Inquiry from ${contactForm.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      setContactSubmitted(true);
    } catch (err) {
      console.error("FormSubmit error:", err);
      setContactSubmitted(true);
    } finally {
      setContactSubmitting(false);
    }
  };
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("rules");

  const openLegal = (tab = "rules") => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Structured Professional Quick Links (Statutory Law, Rules, Governance & Policies)
 const quickLinksList = [
    { label: t('landing.quick_links.law'), path: '/law' },
    { label: t('landing.quick_links.rules'), path: '/rules' },
    { label: t('landing.quick_links.complaints'), path: '/complaints' },
    { label: t('landing.quick_links.contact'), path: '/contact' },
    { label: t('landing.quick_links.privacy'), path: '/privacy' },
    { label: t('landing.quick_links.terms'), path: '/terms' },
    { label: t('landing.quick_links.cancellation'), path: '/cancellation' },
    { label: t('landing.quick_links.refund'), path: '/refund' },
    { label: t('landing.quick_links.disclaimer'), path: '/disclaimer' },
  ];

  // Navigatable Hero Slides (Traditional Sri Lankan Seettu Themes)
  const heroSlides = [
    {
      id: 0,
      tag: t(
        "landing.slide_0_tag",
        "TRADITIONAL SRI LANKAN SEETTU (සීට්ටු / சீட்டு)",
      ),
      bannerTitle: t(
        "landing.slide_0_banner",
        "HAPPY AND SATISFIED SEETTU MEMBERS",
      ),
      mainTitle: t(
        "landing.slide_0_title",
        "Traditional Community Savings, Powered by Digital Trust",
      ),
      subtitle: t(
        "landing.slide_0_sub",
        "Digitize your village or neighborhood Seettu (සීට්ටු / சீட்டு) circle with transparent contribution logs, automated rotation cycles, and mutual financial discipline.",
      ),
      cta: t("landing.slide_0_cta", "Explore How It Works"),
      link: "#how-it-works",
      bgImage:
        "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1600&q=80",
      badgeColor: "#0097B2",
    },
    {
      id: 1,
      tag: t("landing.slide_1_tag", "LOCAL TRADERS & COMMUNITY MERCHANTS"),
      bannerTitle: t(
        "landing.slide_1_banner",
        "TRANSPARENT ROTATIONS & SCHEDULED PAYOUTS",
      ),
      mainTitle: t(
        "landing.slide_1_title",
        "Automated Record-Keeping for Sri Lankan Savings Groups",
      ),
      subtitle: t(
        "landing.slide_1_sub",
        "Eliminate forgotten payments and handwritten notebook disputes. Manage cash handovers, bank slip verifications, and scheduled lump-sum payouts seamlessly.",
      ),
      cta: t("landing.slide_1_cta", "Create a Seettu Group"),
      link: user ? "/groups/create" : "/register",
      bgImage:
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1600&q=80",
      badgeColor: "#0F2F3D",
    },
    {
      id: 2,
      tag: t(
        "landing.slide_2_tag",
        "TRADITIONAL GOLD SEETTU (රන් සීට්ටු / தங்கச் சீட்டு)",
      ),
      bannerTitle: t(
        "landing.slide_2_banner",
        "GOLD & VALUABLE ASSET-BASED SEETTU",
      ),
      mainTitle: t(
        "landing.slide_2_title",
        "Preserve Family Wealth with Traditional Gold Rotations",
      ),
      subtitle: t(
        "landing.slide_2_sub",
        "Organize high-value rotation pools for sovereign gold jewelry, farming equipment, and vehicles with verified item valuation.",
      ),
      cta: t("landing.slide_2_cta", "Learn About Asset Seettu"),
      link: "#about",
      bgImage:
        "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=80",
      badgeColor: "#FFB020",
    },
    {
      id: 3,
      tag: t("landing.slide_3_tag", "VERIFIED DISCIPLINE SCORING"),
      bannerTitle: t(
        "landing.slide_3_banner",
        "VERIFIED 0–100 FINANCIAL DISCIPLINE RATINGS",
      ),
      mainTitle: t(
        "landing.slide_3_title",
        "Build Community Trust with Tamper-Proof Discipline Scores",
      ),
      subtitle: t(
        "landing.slide_3_sub",
        "On-time monthly contributions award recognized discipline scores and unlock verified completion certificates for all group members.",
      ),
      cta: t("landing.slide_3_cta", "About Our System"),
      link: "#about",
      bgImage:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
      badgeColor: "#0097B2",
    },
  ];

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const faqs = [
    {
      category: "BASICS",
      categoryLabel: t("landing.faq_cat_basics", "Basics & Legal"),
      q: t("landing.faq_1_q", "What is a Seettu (Chit Fund / ROSCA)?"),
      a: t("landing.faq_1_a", "A Seettu..."),
    },
    {
      category: "BASICS",
      categoryLabel: t("landing.faq_cat_basics", "Basics & Legal"),
      q: t(
        "landing.faq_2_q",
        "What is the difference between a Bank Loan and a Seettu?",
      ),
      a: t("landing.faq_2_a", "Unlike traditional bank loans..."),
    },
    {
      category: "BASICS",
      categoryLabel: t("landing.faq_cat_basics", "Basics & Legal"),
      q: t("landing.faq_3_q", "Is Seettu legal and registered in Sri Lanka?"),
      a: t("landing.faq_3_a", "Yes. SeettuManager operates..."),
    },
    {
      category: "BASICS",
      categoryLabel: t("landing.faq_cat_basics", "Basics & Legal"),
      q: t(
        "landing.faq_4_q",
        "Who is the Organizer (Foreman) and who is the Member (Subscriber)?",
      ),
      a: t("landing.faq_4_a", "The Organizer (Foreman)..."),
    },
    {
      category: "AUCTIONS",
      categoryLabel: t("landing.faq_faq_cat_auctions", "Auctions & Payouts"),
      q: t(
        "landing.faq_5_q",
        "What is the Gross Seettu Amount vs. Net Payout Amount?",
      ),
      a: t("landing.faq_5_a", "The Gross Seettu Amount..."),
    },
    {
      category: "AUCTIONS",
      categoryLabel: t("landing.faq_cat_auctions", "Auctions & Payouts"),
      q: t("landing.faq_6_q", "What types of Seettu groups are supported?"),
      a: t("landing.faq_6_a", "SeettuManager supports..."),
    },
    {
      category: "AUCTIONS",
      categoryLabel: t("landing.faq_cat_auctions", "Auctions & Payouts"),
      q: t(
        "landing.faq_7_q",
        "What is the bidding procedure and how does an auction work?",
      ),
      a: t("landing.faq_7_a", "During the cycle bidding..."),
    },
    {
      category: "AUCTIONS",
      categoryLabel: t("landing.faq_cat_auctions", "Auctions & Payouts"),
      q: t(
        "landing.faq_8_q",
        "Who is a Bidded Subscriber vs. a Non-Bidded Subscriber?",
      ),
      a: t("landing.faq_8_a", "A Bidded Subscriber..."),
    },
    {
      category: "PAYMENTS",
      categoryLabel: t("landing.faq_cat_payments", "Payments & Discipline"),
      q: t(
        "landing.faq_9_q",
        "What is the Financial Discipline Score (0–100) and why is it important?",
      ),
      a: t("landing.faq_9_a", "The Financial Discipline Score..."),
    },
    {
      category: "PAYMENTS",
      categoryLabel: t("landing.faq_cat_payments", "Payments & Discipline"),
      q: t(
        "landing.faq_10_q",
        "What modes of payment are accepted on the platform?",
      ),
      a: t("landing.faq_10_a", "Members can fulfill..."),
    },
    {
      category: "PAYMENTS",
      categoryLabel: t("landing.faq_cat_payments", "Payments & Discipline"),
      q: t(
        "landing.faq_11_q",
        "What happens when a member delays or defaults on an installment?",
      ),
      a: t("landing.faq_11_a", "Delinquent payments..."),
    },
    {
      category: "PAYMENTS",
      categoryLabel: t("landing.faq_cat_payments", "Payments & Discipline"),
      q: t(
        "landing.faq_12_q",
        "Why is identity verification (NIC & Grama Niladhari Certificate) mandatory?",
      ),
      a: t("landing.faq_12_a", "To eradicate synthetic fraud..."),
    },
    {
      category: "BASICS",
      categoryLabel: t("landing.faq_cat_basics", "Basics & Legal"),
      q: t(
        "landing.faq_13_q",
        "Can I take multiple tickets or slots in the same Seettu group?",
      ),
      a: t("landing.faq_13_a", "Yes. Eligible members..."),
    },
    {
      category: "AUCTIONS",
      categoryLabel: t("landing.faq_cat_auctions", "Auctions & Payouts"),
      q: t(
        "landing.faq_14_q",
        "What if a subscriber needs to cancel or leave a Seettu early?",
      ),
      a: t("landing.faq_14_a", "Under standard Seettu agreements..."),
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div
      className="landing-page bg-white min-vh-100 d-flex flex-column text-dark"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* Custom Styles for Navigatable Hero, Project Palette & Sticky Widgets */}
      <style>{`
        /* Top Bar */
        .top-brand-bar {
          background-color: #0F2F3D;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Direct Clear Hero Slider (No Glassmorphism) */
        .navigatable-hero {
          position: relative;
          min-height: 520px;
          background-size: cover;
          background-position: center;
          transition: background-image 0.4s ease-in-out;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        @media (min-width: 992px) {
          .navigatable-hero {
            min-height: 560px;
          }
        }
        
        /* Subtle Bottom Shade (Only at Bottom for Title and Nav Indicators) */
        .hero-bottom-shade {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 140px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%);
          z-index: 1;
          pointer-events: none;
        }
        
        /* Direct Big Bold Bottom-Right Banner Title (Jayapriya Reference Style) */
        .hero-banner-title {
          position: absolute;
          bottom: 30px;
          right: 48px;
          z-index: 2;
          color: #FFFFFF;
          font-weight: 900;
          font-size: 1.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px #000;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .hero-banner-title {
            display: none;
          }
        }

        /* Navigatable Dash Indicators (Reference Image Style) */
        .slide-indicator-bar {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .slide-dash {
          width: 30px;
          height: 5px;
          border-radius: 3px;
          background-color: rgba(255, 255, 255, 0.6);
          border: none;
          padding: 0;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .slide-dash.active {
          width: 54px;
          background-color: #0097B2;
          box-shadow: 0 0 8px rgba(0, 151, 178, 0.9);
        }

        /* Solid Direct Navigation Arrows (No Blur) */
        .hero-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0F2F3D;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
        }
        .hero-arrow-btn:hover {
          background: #0097B2;
          border-color: #FFFFFF;
          transform: translateY(-50%) scale(1.1);
          color: #FFFFFF;
        }
        .hero-arrow-prev {
          left: 20px;
        }
        .hero-arrow-next {
          right: 20px;
        }





        /* Fintech Cards */
        .fintech-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(15, 47, 61, 0.04);
          transition: all 0.25s ease;
        }
        .fintech-card:hover {
          transform: translateY(-3px);
          border-color: #0097B2;
          box-shadow: 0 12px 24px rgba(0, 151, 178, 0.1);
        }
        .stat-item {
          padding: 18px 24px;
        }
        .step-bubble {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #E6F7F9;
          color: #0097B2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 151, 178, 0.2);
        }
        .footer-quick-links-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 7px !important;
          padding: 0 !important;
          margin: 0 !important;
          list-style: none !important;
        }
        .footer-nav-item,
        a.footer-nav-item,
        button.footer-nav-item {
          all: unset;
          color: rgba(255, 255, 255, 0.72) !important;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 0.86rem !important;
          line-height: 1.45 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 2px 0 !important;
          background: transparent !important;
          border: 0 !important;
          cursor: pointer !important;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
          text-align: left !important;
          box-sizing: border-box !important;
          outline: none !important;
        }
        .footer-nav-bullet {
          color: #0097B2 !important;
          font-size: 0.95rem !important;
          font-weight: 700 !important;
          line-height: 1 !important;
          transition: transform 0.2s ease, color 0.2s ease !important;
          display: inline-block !important;
        }
        .footer-nav-item:hover,
        a.footer-nav-item:hover,
        button.footer-nav-item:hover {
          color: #00E5FF !important;
          transform: translateX(4px) !important;
        }
        .footer-nav-item:hover .footer-nav-bullet,
        a.footer-nav-item:hover .footer-nav-bullet,
        button.footer-nav-item:hover .footer-nav-bullet {
          color: #00E5FF !important;
          transform: translateX(2px) !important;
        }
        .footer-nav-item:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .footer-contact-link,
        a.footer-contact-link {
          color: rgba(255, 255, 255, 0.72) !important;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-size: 0.86rem !important;
          line-height: 1.45 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 2px 0 !important;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .footer-contact-link:hover,
        a.footer-contact-link:hover {
          color: #00E5FF !important;
          transform: translateX(3px) !important;
        }
      `}</style>

      {/* Top Brand Header Bar (Jayapriya Reference Layout in Deep Slate Teal) */}
      <div className="top-brand-bar text-white py-1.5 px-3 fs-7">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 small">
            <span className="d-flex align-items-center">
              <Icon name="mail" size={13} className="me-1" color="#0097B2" />
              seetumanager@gmail.com
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            {/* Trilingual Toggle */}
            <div className="d-flex align-items-center me-2 small">
              <button
                onClick={() => changeLanguage("en")}
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === "en" ? "fw-bold text-white" : "text-white-50"}`}
              >
                EN
              </button>
              <span className="text-white-50 small">|</span>
              <button
                onClick={() => changeLanguage("si")}
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === "si" ? "fw-bold text-white" : "text-white-50"}`}
              >
                සිං
              </button>
              <span className="text-white-50 small">|</span>
              <button
                onClick={() => changeLanguage("ta")}
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === "ta" ? "fw-bold text-white" : "text-white-50"}`}
              >
                தமி
              </button>
            </div>

            {/* Notifications Bell for Logged-In User */}
            {user && (
              <Link
                to="/notifications"
                className="btn btn-sm btn-link text-white position-relative p-1 me-2 text-decoration-none d-flex align-items-center"
                title="Notification Center"
              >
                <Icon name="bell" size={17} color="#0097B2" />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute badge rounded-pill bg-danger border border-dark"
                    style={{
                      top: "-3px",
                      right: "-4px",
                      fontSize: "0.62rem",
                      padding: "0.2em 0.4em",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white border-bottom py-2.5 shadow-sm">
        <div className="container">
          <Link
            className="navbar-brand d-flex align-items-center gap-3 me-4 text-decoration-none"
            to="/"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            aria-label="SeettuManager Home - Sri Lanka Digital Seettu Platform"
          >
            <img
              src="/logo.png"
              alt="SeettuManager - Sri Lanka Digital Seettu & Savings Platform Logo"
              style={{
                height: "46px",
                width: "46px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div className="d-flex flex-column text-start justify-content-center">
              <span
                className="lh-1"
                style={{ fontSize: "1.65rem", letterSpacing: "-0.5px" }}
              >
                <span style={{ color: "#003847", fontWeight: 900 }}>
                  Seettu
                </span>
                <span style={{ color: "#0097B2", fontWeight: 900 }}>
                  Manager
                </span>
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  color: "#1A4A5E",
                  marginTop: "3px",
                  lineHeight: "1",
                }}
              >
                Save Together. Grow Together.
              </span>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#landingNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-bold fs-6">
              <li className="nav-item">
                <a
                  className="nav-link px-3 active fw-bold"
                  style={{ color: "#0097B2" }}
                  href="#"
                >
                  {t("landing.nav_home", "Home")}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#about">
                  {t("landing.nav_about", "About Us")}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-3 fw-bold text-dark"
                  href="#how-it-works"
                >
                  {t("landing.nav_how_it_works", "How It Works")}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#faq">
                  {t("landing.nav_faq", "FAQs")}
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#contact">
                  {t("landing.nav_contact", "Contact Us")}
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn fw-bold text-white px-3 py-2 rounded-2 shadow-sm"
                  style={{
                    backgroundColor: "#0097B2",
                    borderColor: "#0097B2",
                    fontSize: "0.88rem",
                  }}
                >
                  {t("landing.nav_my_account", "My Account")}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-dark fw-bold px-3 py-2 rounded-2"
                    style={{
                      borderColor: "#CBD5E1",
                      color: "#0F2F3D",
                      fontSize: "0.88rem",
                    }}
                  >
                    {t("login", "Login")}
                  </Link>
                  <Link
                    to="/register"
                    className="btn fw-bold text-white px-3 py-2 rounded-2 shadow-sm"
                    style={{
                      backgroundColor: "#0097B2",
                      borderColor: "#0097B2",
                      fontSize: "0.88rem",
                    }}
                  >
                    {t("landing.nav_get_started", "Get Started")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Navigatable Image Hero Section (Direct Photo Banner) */}
      <header
        className="navigatable-hero text-white"
        style={{
          backgroundImage: `url(${activeSlide.bgImage})`,
        }}
      >
        {/* Subtle Bottom Shade (Only at Bottom for Indicators & Title) */}
        <div className="hero-bottom-shade"></div>

        {/* Previous Slide Arrow */}
        <button
          onClick={handlePrevSlide}
          className="hero-arrow-btn hero-arrow-prev"
          aria-label="Previous Slide"
          title="Previous Slide"
        >
          <Icon name="chevron-left" size={22} />
        </button>

        {/* Next Slide Arrow */}
        <button
          onClick={handleNextSlide}
          className="hero-arrow-btn hero-arrow-next"
          aria-label="Next Slide"
          title="Next Slide"
        >
          <Icon name="chevron-right" size={22} />
        </button>

        {/* Direct Content Overlay */}
        <div className="container position-relative py-5" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-7 col-xl-6">
              {/* Tag Chip */}
              <span
                className="badge px-3 py-2 rounded-pill fw-bold mb-3 d-inline-flex align-items-center gap-1.5 shadow"
                style={{
                  backgroundColor: activeSlide.badgeColor,
                  fontSize: "0.78rem",
                  letterSpacing: "0.5px",
                }}
              >
                ● {activeSlide.tag}
              </span>

              {/* Main Headline */}
              <h1
                className="display-4 fw-extrabold text-white mb-3 lh-sm"
                style={{
                  letterSpacing: "-0.02em",
                  textShadow:
                    "0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)",
                }}
              >
                {activeSlide.mainTitle}
              </h1>

              {/* Subtitle */}
              <p
                className="lead text-white mb-4 fs-5 fw-medium"
                style={{
                  maxWidth: "580px",
                  lineHeight: "1.6",
                  textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 1px 3px #000",
                }}
              >
                {activeSlide.subtitle}
              </p>

              {/* Call-to-Action Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <a
                  href={activeSlide.link}
                  className="btn btn-lg fw-bold text-white px-4 py-3 rounded-2 shadow-lg d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: "#0097B2", borderColor: "#0097B2" }}
                  onClick={(e) => {
                    if (activeSlide.link.startsWith("#")) {
                      e.preventDefault();
                      const el = document.querySelector(activeSlide.link);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <span>{activeSlide.cta}</span>
                  <Icon name="chevron-right" size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Big Bold Banner Title Overlay on Bottom Right (Jayapriya Reference Style) */}
        <div className="hero-banner-title">{activeSlide.bannerTitle}</div>

        {/* Navigatable Dash Indicators (Reference Image Style) */}
        <div className="slide-indicator-bar">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`slide-dash ${currentSlide === idx ? "active" : ""}`}
              title={`Slide ${idx + 1}: ${slide.bannerTitle}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </header>

      {/* Clean Trust & Metrics Strip */}
      <section className="bg-white border-bottom py-3">
        <div className="container">
          <div className="row text-center g-3">
            <div className="col-6 col-md-3">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>LKR 50M+</h4>
                <p className="text-muted small mb-0 fw-semibold">{t('landing.stat_tracked_rotations', 'Tracked Rotations')}</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>0 - 100</h4>
                <p className="text-muted small mb-0 fw-semibold">{t('landing.stat_discipline_engine', 'Discipline Score Engine')}</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>100%</h4>
                <p className="text-muted small mb-0 fw-semibold">{t('landing.stat_audit_ledger', 'Transparent Audit Ledger')}</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>Cash & Assets</h4>
                <p className="text-muted small mb-0 fw-semibold">{t('landing.stat_cash_assets', 'Gold, Vehicles & Goods')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome & Core Features Showcase (Jayapriya 3-Column Architecture matching brand theme & documentation) */}
      <section id="about" className="py-5 bg-white border-bottom">
        <div className="container py-4">
          {/* Section Header */}
          <div className="text-center mb-5">
            <span
              className="text-uppercase fw-bold"
              style={{
                color: "#0097B2",
                letterSpacing: "2px",
                fontSize: "0.85rem",
              }}
            >
              {t("landing.welcome_badge", "WELCOME TO")}
            </span>
            <h2
              className="fw-black display-5 mt-1 mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span style={{ color: "#003847", fontWeight: 900 }}>Seettu</span>
              <span style={{ color: "#0097B2", fontWeight: 900 }}>Manager</span>
            </h2>
            <p
              className="lead text-secondary mx-auto mb-0"
              style={{
                maxWidth: "820px",
                fontSize: "1.05rem",
                lineHeight: "1.6",
              }}
            >
              {t(
                "landing.welcome_subtitle",
                "Saving and Investing is a lifelong process. The sooner you start; the better off you'll be in the long run. Smart way to save and borrow.",
              )}
            </p>
          </div>

          {/* 3-Column Features Architecture */}
          <div className="row g-4 align-items-stretch">
            {/* Left Column: 3 Core Pillars */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex flex-column justify-content-between h-100 gap-4 gap-lg-5 pe-lg-3">
                {/* Feature 1: Discipline Score & Expert People */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="award" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t(
                        "landing.feat_discipline_title",
                        "Financial Discipline Score",
                      )}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_discipline_desc",
                        "Algorithmic 0–100 reliability scoring based on payment punctuality. Builds trusted creditability and eliminates default risks.",
                      )}
                    </p>
                  </div>
                </div>

                {/* Feature 2: Become an Organizer */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="user-check" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t("landing.feat_organizer_title", "Become an Organizer")}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_organizer_desc",
                        "Your community calling: create private or village circles, set custom rules, and lead your circle with automated rotations.",
                      )}
                    </p>
                    <Link
                      to={user ? "/profile" : "/register"}
                      className="btn btn-sm btn-link text-decoration-none p-0 fw-bold mt-1.5 d-inline-flex align-items-center gap-1"
                      style={{ color: "#0097B2", fontSize: "0.84rem" }}
                    >
                      <span>
                        {user
                          ? t("landing.btn_manage_account", "Manage in Account")
                          : t(
                              "landing.btn_register_organize",
                              "Register to Organize",
                            )}
                      </span>
                      <Icon name="chevron-right" size={14} />
                    </Link>
                  </div>
                </div>

                {/* Feature 3: Option to Pay Installment */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="credit-card" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t(
                        "landing.feat_installment_title",
                        "Option to Pay Your Installment",
                      )}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_installment_desc",
                        "Flexible contribution periods on a daily, weekly, or monthly basis with offline cash tracking and instant bank slip verification.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Unique High-Resolution Fintech Showcase Visual (PHOTO PRESERVED) */}
            <div className="col-lg-4 col-md-12 order-first order-lg-0 mb-4 mb-lg-0">
              <div
                className="position-relative rounded-4 overflow-hidden shadow-lg border h-100 d-flex flex-column justify-content-between align-items-center p-3 text-center"
                style={{
                  minHeight: "460px",
                  backgroundColor: "#0F2F3D",
                  background:
                    "radial-gradient(circle at 50% 20%, rgba(0, 229, 255, 0.15) 0%, #0F2F3D 70%)",
                  border: "1px solid rgba(0, 151, 178, 0.35)",
                }}
              >
                {/* Top Badge: Sri Lanka Cheetus Ecosystem */}
                <div
                  className="px-3 py-1 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5 text-white"
                  style={{
                    backgroundColor: "rgba(0, 151, 178, 0.85)",
                    border: "1px solid rgba(0, 229, 255, 0.4)",
                    zIndex: 2,
                    fontSize: "0.72rem",
                    letterSpacing: "0.6px",
                    fontWeight: 700,
                  }}
                >
                  <Icon name="shield" size={13} color="#00E5FF" />
                  <span>
                    {t(
                      "landing.card_center_badge",
                      "SRI LANKAN ROTATING SAVINGS",
                    )}
                  </span>
                </div>

                {/* Unique 3D Fintech Showcase Illustration */}
                <div className="my-auto w-100 d-flex justify-content-center py-2">
                  <img
                    src="/seettu_showcase.jpg"
                    alt="SeettuManager Smart Rotating Savings Ecosystem"
                    className="img-fluid rounded-3 shadow-md"
                    style={{
                      maxHeight: "340px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45))",
                    }}
                  />
                </div>

                {/* Bottom Live Metrics Pill */}
                <div
                  className="w-100 py-2 px-3 rounded-3 text-start d-flex align-items-center justify-content-between shadow-xs"
                  style={{
                    backgroundColor: "rgba(7, 29, 39, 0.85)",
                    border: "1px solid rgba(0, 229, 255, 0.25)",
                    backdropFilter: "blur(8px)",
                    zIndex: 2,
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="d-inline-block rounded-circle"
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#10B981",
                        boxShadow: "0 0 8px #10B981",
                      }}
                    />
                    <span
                      className="small text-white-50 fw-semibold"
                      style={{ fontSize: "0.76rem" }}
                    >
                      {t(
                        "landing.card_center_ledger",
                        "Certified Cheetus Ledger",
                      )}
                    </span>
                  </div>
                  <span
                    className="fw-bold"
                    style={{ color: "#00E5FF", fontSize: "0.8rem" }}
                  >
                    {t("landing.card_center_guaranteed", "100% Guaranteed")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Core Pillars */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex flex-column justify-content-between h-100 gap-4 gap-lg-5 ps-lg-3">
                {/* Feature 4: Payment Quality */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="clock" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t(
                        "landing.feat_payout_title",
                        "Payment Quality & Payouts",
                      )}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_payout_desc",
                        "Automated rotation calendar guarantees on-time payouts. Every member receives their lump-sum safely on their scheduled cycle date.",
                      )}
                    </p>
                  </div>
                </div>

                {/* Feature 5: Joining Process */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="check-square" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t("landing.feat_joining_title", "Joining Process")}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_joining_desc",
                        "Easily join and pay into Seettu circles with zero paperwork. Instant phone verification, member directories, and transparent rules.",
                      )}
                    </p>
                  </div>
                </div>

                {/* Feature 6: Secure */}
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{
                      width: "54px",
                      height: "54px",
                      backgroundColor: "rgba(0, 151, 178, 0.1)",
                      color: "#0097B2",
                      border: "1.5px solid rgba(0, 151, 178, 0.25)",
                    }}
                  >
                    <Icon name="shield" size={26} />
                  </div>
                  <div>
                    <h5
                      className="fw-bold mb-1"
                      style={{ color: "#0F2F3D", fontSize: "1.15rem" }}
                    >
                      {t("landing.feat_secure_title", "Secure & Non-Custodial")}
                    </h5>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6" }}
                    >
                      {t(
                        "landing.feat_secure_desc",
                        "Pay directly to organizer or members via bank transfer or cash with digital tamper-proof audit trails and duplicate payment prevention.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span
              className="text-uppercase fw-bold text-muted small"
              style={{ letterSpacing: "1px" }}
            >
              {t("landing.how_it_works_badge", "Simple 4-Step Process")}
            </span>
            <h2
              className="fw-bold display-6 text-dark mt-1 mb-2"
              style={{ color: "#0F2F3D" }}
            >
              {t("landing.how_it_works_title", "How SeettuManager Works")}
            </h2>
            <p
              className="text-muted lead mx-auto"
              style={{ maxWidth: "620px", fontSize: "1.05rem" }}
            >
              {t(
                "landing.how_it_works_subtitle",
                "A frictionless workflow designed specifically for organizers and members of Sri Lankan rotating savings circles.",
              )}
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                step: "01",
                title: t("landing.hiw_step1_title", "Create or Join Circle"),
                desc: t(
                  "landing.hiw_step1_desc",
                  "Organizers set contribution amount, rotation frequency, and total member count for cash or goods.",
                ),
                icon: "users",
              },
              {
                step: "02",
                title: t("landing.hiw_step2_title", "Track Contributions"),
                desc: t(
                  "landing.hiw_step2_desc",
                  "Record offline cash deposits or bank slip uploads with immediate transparent confirmation.",
                ),
                icon: "credit-card",
              },
              {
                step: "03",
                title: t("landing.hiw_step3_title", "Scheduled Lump Payout"),
                desc: t(
                  "landing.hiw_step3_desc",
                  "Each cycle designates the next member in line to receive the pooled lump-sum safely.",
                ),
                icon: "calendar",
              },
              {
                step: "04",
                title: t("landing.hiw_step4_title", "Earn Discipline Score"),
                desc: t(
                  "landing.hiw_step4_desc",
                  "Punctual payments award verified 0–100 scores and unlock downloadable completion certificates.",
                ),
                icon: "award",
              },
            ].map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="fintech-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="step-bubble mb-0">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <span
                      className="text-muted fw-extrabold fs-5"
                      style={{ opacity: 0.4 }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <h5
                    className="fw-bold text-dark mb-2"
                    style={{ color: "#0F2F3D" }}
                  >
                    {item.title}
                  </h5>
                  <p className="text-muted small mb-0 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-5" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span
              className="text-uppercase fw-bold text-muted small"
              style={{ letterSpacing: "1px" }}
            >
              {t("landing.faq_badge", "Common Questions")}
            </span>
            <h2
              className="fw-bold display-6 text-dark mt-1 mb-2"
              style={{ color: "#0F2F3D" }}
            >
              {t("landing.faq_title", "Frequently Asked Questions")}
            </h2>
            <p
              className="text-muted lead mx-auto"
              style={{ maxWidth: "620px", fontSize: "1.05rem" }}
            >
              {t(
                "landing.faq_subtitle",
                "Everything you need to know about setting up and participating in digital Seettu circles.",
              )}
            </p>
          </div>

          {/* FAQ Controls: Category Pills and Live Search */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-9">
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-center">
                {/* Category Pills */}
                <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                  {[
                    {
                      id: "ALL",
                      label: t("landing.faq_cat_all", "All Questions"),
                    },
                    {
                      id: "BASICS",
                      label: t("landing.faq_cat_basics", "Basics & Legal"),
                    },
                    {
                      id: "AUCTIONS",
                      label: t(
                        "landing.faq_cat_auctions",
                        "Auctions & Payouts",
                      ),
                    },
                    {
                      id: "PAYMENTS",
                      label: t(
                        "landing.faq_cat_payments",
                        "Payments & Discipline",
                      ),
                    },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFaqCategory(cat.id);
                        setOpenFaq(null);
                      }}
                      className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold border-0 ${faqCategory === cat.id ? "text-white shadow-sm" : "text-dark bg-white border"}`}
                      style={{
                        backgroundColor:
                          faqCategory === cat.id ? "#0097B2" : "#FFFFFF",
                        fontSize: "0.82rem",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Live Search */}
                <div
                  className="position-relative"
                  style={{
                    minWidth: "220px",
                    width: "100%",
                    maxWidth: "280px",
                  }}
                >
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => {
                      setFaqSearch(e.target.value);
                      setOpenFaq(null);
                    }}
                    placeholder={t(
                      "landing.faq_search_placeholder",
                      "Search questions (e.g. loan, bidding)...",
                    )}
                    className="form-control form-control-sm rounded-pill pe-4 ps-3 bg-white"
                    style={{ fontSize: "0.82rem", border: "1px solid #CBD5E1" }}
                  />
                  {faqSearch && (
                    <button
                      type="button"
                      onClick={() => setFaqSearch("")}
                      className="btn btn-link btn-sm text-muted position-absolute end-0 top-50 translate-middle-y border-0 p-1 me-2 text-decoration-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="d-flex flex-column gap-3">
                {faqs
                  .filter((f) => {
                    const matchesCategory =
                      faqCategory === "ALL" || f.category === faqCategory;
                    const matchesSearch =
                      !faqSearch.trim() ||
                      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
                      f.a.toLowerCase().includes(faqSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={index} className="fintech-card overflow-hidden">
                        <button
                          className="w-100 text-start p-3.5 p-md-4 border-0 bg-white d-flex align-items-center justify-content-between text-dark"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.98rem",
                            color: "#0F2F3D",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2.5 pe-3">
                            <span
                              className="badge rounded-pill fw-bold flex-shrink-0"
                              style={{
                                backgroundColor: "rgba(0, 151, 178, 0.1)",
                                color: "#0097B2",
                                fontSize: "0.68rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {faq.categoryLabel}
                            </span>
                            <span className="fw-bold text-dark">{faq.q}</span>
                          </div>
                          <Icon
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#0097B2"
                          />
                        </button>
                        {isOpen && (
                          <div
                            className="px-4 pb-4 pt-1 text-muted border-top bg-light small leading-relaxed"
                            style={{ fontSize: "0.92rem", lineHeight: "1.65" }}
                          >
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Contact Us Section */}
      <section id="contact" className="py-5 bg-white border-top">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <span
                className="text-uppercase fw-bold text-muted small"
                style={{ letterSpacing: "1px" }}
              >
                {t("landing.contact_badge", "Get In Touch")}
              </span>
              <h2
                className="fw-bold display-6 mb-3 text-dark mt-1"
                style={{ color: "#0F2F3D" }}
              >
                {t(
                  "landing.contact_title",
                  "We Are Here to Assist Your Savings Group",
                )}
              </h2>
              <p className="text-muted mb-4 leading-relaxed">
                {t(
                  "landing.contact_subtitle",
                  "Have questions regarding group setup, non-monetary asset evaluation, or audit compliance? Reach out to our dedicated customer support team.",
                )}
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                  <div
                    className="p-2.5 rounded-3 text-white"
                    style={{ backgroundColor: "#0F2F3D" }}
                  >
                    <Icon name="mail" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">
                      {t("landing.contact_email_title", "Email Support")}
                    </h6>
                    <span className="text-muted small">
                      seetumanager@gmail.com
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                  <div
                    className="p-2.5 rounded-3 text-white"
                    style={{ backgroundColor: "#0F2F3D" }}
                  >
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">
                      {t("landing.contact_phone_title", "Direct Helpline")}
                    </h6>
                    <span className="text-muted small">
                      +94 75 297 5632 (Mon – Sat)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="fintech-card p-4 p-md-5">
                <h5
                  className="fw-bold text-dark mb-3"
                  style={{ color: "#0F2F3D" }}
                >
                  {t("landing.contact_form_title", "Send Direct Inquiry")}
                </h5>
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                    <Icon name="check" size={20} />
                    <span>
                      {t(
                        "landing.contact_success_msg",
                        "Thank you! Your message has been forwarded directly to our support desk (seetumanager@gmail.com). Our team will contact you soon.",
                      )}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">
                          {t("landing.contact_name_label", "Your Name")}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Full name"
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">
                          {t("landing.contact_phone_label", "Phone Number")}
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder={t(
                            "landing.contact_ph_phone",
                            "077 123 4567",
                          )}
                          value={contactForm.phone}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              phone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark small">
                          {t("landing.contact_email_label", "Email Address")}
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder={t(
                            "landing.contact_ph_email",
                            "name@example.com",
                          )}
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark small">
                          {t("landing.contact_message_label", "Your Message")}
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder={t(
                            "landing.contact_ph_message",
                            "How can we assist your Seettu circle?",
                          )}
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              message: e.target.value,
                            })
                          }
                          required
                        ></textarea>
                      </div>

                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn fw-bold text-white px-4 py-2.5 rounded-2 w-100 d-inline-flex align-items-center justify-content-center gap-2"
                          style={{
                            backgroundColor: "#0097B2",
                            borderColor: "#0097B2",
                          }}
                          disabled={contactSubmitting}
                        >
                          {contactSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></span>
                              <span>
                                {t(
                                  "landing.contact_submitting",
                                  "Sending Inquiry to seetumanager@gmail.com...",
                                )}
                              </span>
                            </>
                          ) : (
                            <span>
                              {t(
                                "landing.contact_submit_btn",
                                "Submit Inquiry →",
                              )}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section Header */}
      <div className="text-center mb-5">
        <span
          className="text-uppercase fw-bold"
          style={{
            color: "#0097B2",
            letterSpacing: "2px",
            fontSize: "0.85rem",
          }}
        >
          {t("landing.welcome_badge", "WELCOME TO")}
        </span>
        <h2
          className="fw-black display-5 mt-1 mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <span style={{ color: "#003847", fontWeight: 900 }}>Seettu</span>
          <span style={{ color: "#0097B2", fontWeight: 900 }}>Manager</span>
        </h2>
        <p
          className="lead text-secondary mx-auto mb-0"
          style={{ maxWidth: "820px", fontSize: "1.05rem", lineHeight: "1.6" }}
        >
          {t(
            "landing.welcome_subtitle",
            "Saving and Investing is a lifelong process. The sooner you start; the better off you'll be in the long run. Smart way to save and borrow.",
          )}
        </p>
      </div>

      {/* Balanced & Clean Footer */}
      <footer
        className="text-white pt-5 pb-4 mt-auto"
        style={{ backgroundColor: "#0F2F3D" }}
      >
        <div className="container">
          <div className="row g-4 pb-4 border-bottom border-light border-opacity-10">
            
            {/* Col 1: Brand Tagline & Description */}
            <div className="col-lg-5 col-md-12 mb-4 mb-lg-0 pe-lg-4">
              <div className="d-flex align-items-center gap-3 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <img 
                  src="/logo.png" 
                  alt="SeettuManager Logo" 
                  style={{ 
                    height: '44px', 
                    width: '44px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    flexShrink: 0,
                    backgroundColor: '#FFFFFF',
                    padding: '2px'
                  }} 
                />
                <div className="d-flex flex-column text-start justify-content-center">
                  <span className="lh-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.5px' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 900 }}>Seettu</span>
                    <span style={{ color: '#0097B2', fontWeight: 900 }}>Manager</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px', color: '#68B6C7', marginTop: '3px', lineHeight: '1' }}>
                    {t('landing.brand_tagline', 'Save Together. Grow Together.')}
                  </span>
                </div>
              </div>
              <p className="text-white-50 small mb-3 leading-relaxed" style={{ maxWidth: '420px' }}>
                {t('landing.footer_desc', "Sri Lanka's dedicated digital platform for rotating savings groups. Empowering organizers and members with automated payment tracking, rotation cycles, dispute protection, and verified 0–100 discipline ratings.")}
              </p>

             {/* Essential Quick Navigation Links */}
              <div className="d-flex flex-wrap align-items-center gap-2 small mb-3 text-white-50">
                <a href="#about" className="text-white-50 text-decoration-none hover-white fw-semibold">{t('landing.nav_about', 'About Us')}</a>
                <span>•</span>
                <a href="#how-it-works" className="text-white-50 text-decoration-none hover-white fw-semibold">{t('landing.nav_how_it_works', 'How It Works')}</a>
                <span>•</span>
                <a href="#faq" className="text-white-50 text-decoration-none hover-white fw-semibold">{t('landing.nav_faq', 'FAQs')}</a>
              </div>

              {/* Social Media Links */}
              <div className="d-flex align-items-center gap-2">
                <a
                  href="https://www.facebook.com/share/1DbJgZK7sY/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  title="Facebook"
                >
                  <Icon name="facebook" size={16} />
                </a>
                <a
                  href="https://twitter.com/seetumanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  title="Twitter / X"
                >
                  <Icon name="twitter" size={16} />
                </a>
                <a
                  href="https://instagram.com/seetumanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  title="Instagram"
                >
                  <Icon name="instagram" size={16} />
                </a>
                <a
                  href="https://youtube.com/@seetumanager?si=xo7eEJ0r_07lYg7z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  title="YouTube"
                >
                  <Icon name="youtube" size={16} />
                </a>
              </div>
            </div>

           {/* Col 2: QUICK LINKS */}
            <div className="col-lg-3 col-md-6 col-6">
      <h6 className="fw-bold text-white mb-2 text-uppercase fs-7" style={{ letterSpacing: '1.2px' }}>
        {t('landing.footer_quick_links', 'QUICK LINKS')}
      </h6>
      <div style={{ width: '38px', height: '3px', backgroundColor: '#C01920', marginBottom: '16px', borderRadius: '2px' }} />
      <ul className="footer-quick-links-list">
        {quickLinksList.map((item, idx) => (
          <li key={idx}>
            <Link to={item.path} className="footer-nav-item">
              <span className="footer-nav-bullet">›</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
            
           {/* Col 3: SUPPORT Section */}
            <div className="col-lg-4 col-md-6 col-6">
              <h6 className="fw-bold text-white mb-2 text-uppercase fs-7" style={{ letterSpacing: '1.2px' }}>
                {t('landing.footer_support', 'SUPPORT')}
              </h6>
              <div style={{ width: '38px', height: '3px', backgroundColor: '#C01920', marginBottom: '16px', borderRadius: '2px' }} />
              
              <div className="d-flex flex-column gap-3">
                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>{t('landing.footer_direct_helplines', 'Direct Helplines')}</strong>
                  <div className="d-flex flex-column gap-1">
                    <a href="tel:+94752975632" className="footer-contact-link">
                      <Icon name="phone" size={13} color="#0097B2" />
                      +94 75 297 5632
                    </a>
                  </div>
                </div>

                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>{t('landing.footer_email_support', 'Email Support')}</strong>
                  <a href="mailto:seetumanager@gmail.com" className="footer-contact-link">
                    <Icon name="mail" size={13} color="#0097B2" />
                    seetumanager@gmail.com
                  </a>
                </div>

                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>{t('landing.footer_headquarters', 'Platform Headquarters')}</strong>
                  <span className="d-inline-flex align-items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0097B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {t('landing.footer_location', 'Colombo, Western Province, Sri Lanka')}
                  </span>
                </div>

                <div className="pt-2 border-top border-secondary border-opacity-25">
                  <span className="text-white-50" style={{ fontSize: '0.78rem' }}>{t('landing.footer_working_hours', 'Mon – Sat (8:30 AM – 6:00 PM IST)')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Legal & Regulatory Compliance Notice */}
          <div className="pt-3 pb-3 border-top border-light border-opacity-10 small text-white-50">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-lg-8">
                <p className="mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                  <strong className="text-white">{t('landing.footer_statutory_label', 'Statutory & Legal Notice:')}</strong> {t('landing.footer_statutory_text', 'SeettuManager is an administrative digital record-keeping and rotation management software operating in alignment with The Cheetus Ordinance No. 61 of 1935 (Chapter 190), the Electronic Transactions Act No. 19 of 2006, and the Personal Data Protection Act No. 9 of 2022 of Sri Lanka. SeettuManager does not accept public deposits, act as a banking institution, or provide loan facilities. All financial pooling is peer-to-peer and executed between enrolled circle members and verified organizers.')}
                </p>
              </div>
              <div className="col-12 col-lg-4 text-lg-end">
                <div className="d-inline-flex flex-wrap gap-2 text-white-50" style={{ fontSize: '0.78rem' }}>
                  <Link to="/law" className="text-white-50 text-decoration-none hover-white">{t('quick_links.law', 'Statutory Law')}</Link>
                  <span>•</span>
                  <Link to="/rules" className="text-white-50 text-decoration-none hover-white">{t('quick_links.rules', 'Enrollment Rules')}</Link>
                  <span>•</span>
                  <Link to="/terms" className="text-white-50 text-decoration-none hover-white">{t('quick_links.terms', 'Terms')}</Link>
                  <span>•</span>
                  <Link to="/privacy" className="text-white-50 text-decoration-none hover-white">{t('quick_links.privacy', 'Privacy')}</Link>
                  <span>•</span>
                  <Link to="/disclaimer" className="text-white-50 text-decoration-none hover-white">{t('quick_links.disclaimer', 'Disclaimer')}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Scroll Top */}
          <div className="pt-2 d-flex justify-content-between align-items-center flex-wrap gap-2 border-top border-light border-opacity-10">
            <p className="text-white-50 small mb-0">
              {t(
                "landing.footer_copyright",
                "© 2026 SeettuManager. All rights reserved. • Sri Lanka Digital Rotating Savings Platform",
              )}
            </p>
            <button
              onClick={scrollToTop}
              className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{
                width: "34px",
                height: "34px",
                backgroundColor: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
              title="Back to Top"
            >
              <Icon name="chevron-up" size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* Global Legal, Compliance & Member Agreements Modal */}
      <LegalPoliciesModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};

export default LandingPage;
