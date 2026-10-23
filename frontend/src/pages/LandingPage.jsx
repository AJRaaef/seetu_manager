import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { useNotification } from '../hooks/useNotification';
import Icon from '../components/Icons';
import LegalPoliciesModal from '../components/LegalPoliciesModal';
import BecomeOrganizerModal from '../components/BecomeOrganizerModal';

const LandingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { unreadCount } = useNotification();

  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [faqCategory, setFaqCategory] = useState('ALL');
  const [faqSearch, setFaqSearch] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('rules');
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);

  const openLegal = (tab = 'rules') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Structured Professional Quick Links (Statutory Law, Rules, Governance & Policies)
  const quickLinksList = [
    { label: 'Chit Law & Governance', path: '/law' },
    { label: 'Member Enrollment Rules', path: '/rules' },
    { label: 'Complaints & Disputes', path: '/complaints' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy & Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Cancellation Policy', path: '/cancellation' },
    { label: 'Refund Policy', path: '/refund' },
    { label: 'Disclaimer', path: '/disclaimer' },
  ];

  // Navigatable Hero Slides (Traditional Sri Lankan Seettu Themes)
  const heroSlides = [
    {
      id: 0,
      tag: t('landing.slide_0_tag', 'TRADITIONAL SRI LANKAN SEETTU (සීට්ටු / சீட்டு)'),
      bannerTitle: t('landing.slide_0_banner', 'HAPPY AND SATISFIED SEETTU MEMBERS'),
      mainTitle: t('landing.slide_0_title', 'Traditional Community Savings, Powered by Digital Trust'),
      subtitle: t('landing.slide_0_sub', 'Digitize your village or neighborhood Seettu (සීට්ටු / சீட்டு) circle with transparent contribution logs, automated rotation cycles, and mutual financial discipline.'),
      cta: t('landing.slide_0_cta', 'Explore How It Works'),
      link: '#how-it-works',
      bgImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#0097B2'
    },
    {
      id: 1,
      tag: t('landing.slide_1_tag', 'LOCAL TRADERS & COMMUNITY MERCHANTS'),
      bannerTitle: t('landing.slide_1_banner', 'TRANSPARENT ROTATIONS & SCHEDULED PAYOUTS'),
      mainTitle: t('landing.slide_1_title', 'Automated Record-Keeping for Sri Lankan Savings Groups'),
      subtitle: t('landing.slide_1_sub', 'Eliminate forgotten payments and handwritten notebook disputes. Manage cash handovers, bank slip verifications, and scheduled lump-sum payouts seamlessly.'),
      cta: t('landing.slide_1_cta', 'Create a Seettu Group'),
      link: user ? '/groups/create' : '/register',
      bgImage: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#0F2F3D'
    },
    {
      id: 2,
      tag: t('landing.slide_2_tag', 'TRADITIONAL GOLD SEETTU (රන් සීට්ටු / தங்கச் சீட்டு)'),
      bannerTitle: t('landing.slide_2_banner', 'GOLD & VALUABLE ASSET-BASED SEETTU'),
      mainTitle: t('landing.slide_2_title', 'Preserve Family Wealth with Traditional Gold Rotations'),
      subtitle: t('landing.slide_2_sub', 'Organize high-value rotation pools for sovereign gold jewelry, farming equipment, and vehicles with verified item valuation.'),
      cta: t('landing.slide_2_cta', 'Learn About Asset Seettu'),
      link: '#about',
      bgImage: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#FFB020'
    },
    {
      id: 3,
      tag: t('landing.slide_3_tag', 'VERIFIED DISCIPLINE SCORING'),
      bannerTitle: t('landing.slide_3_banner', 'VERIFIED 0–100 FINANCIAL DISCIPLINE RATINGS'),
      mainTitle: t('landing.slide_3_title', 'Build Community Trust with Tamper-Proof Discipline Scores'),
      subtitle: t('landing.slide_3_sub', 'On-time monthly contributions award recognized discipline scores and unlock verified completion certificates for all group members.'),
      cta: t('landing.slide_3_cta', 'About Our System'),
      link: '#about',
      bgImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#0097B2'
    }
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
      category: 'BASICS',
      categoryLabel: 'Basics & Legal',
      q: 'What is a Seettu (Chit Fund / ROSCA)?',
      a: 'A Seettu (internationally termed a Chit Fund or Rotating Savings and Credit Association — ROSCA) is a traditional community savings mechanism where members pool fixed contributions at regular intervals (daily, weekly, or monthly). In each cycle, the pooled sum is awarded to one member via fixed rotation, auction bidding, or fair lottery, continuing until every participant receives their complete payout.'
    },
    {
      category: 'BASICS',
      categoryLabel: 'Basics & Legal',
      q: 'What is the difference between a Bank Loan and a Seettu?',
      a: 'Unlike traditional bank loans that charge high compounding interest, require mortgaged collateral, and involve rigid banking bureaucracy, a Seettu is a community-funded financial circle. Non-bidded members use Seettu as a high-yield savings tool earning monthly dividend deductions, while bidded members access rapid lump-sum capital without exploitative interest rates.'
    },
    {
      category: 'BASICS',
      categoryLabel: 'Basics & Legal',
      q: 'Is Seettu legal and registered in Sri Lanka?',
      a: 'Yes. SeettuManager operates in strict compliance with The Cheetus Ordinance No. 61 of 1935 (the statutory law governing rotating savings in Sri Lanka). Every group maintains a digital Seettu Agreement with verified terms, administrative organizer vetting, deduplicated Sri Lankan NICs, and full transaction audit trails.'
    },
    {
      category: 'BASICS',
      categoryLabel: 'Basics & Legal',
      q: 'Who is the Organizer (Foreman) and who is the Member (Subscriber)?',
      a: 'The Organizer (Foreman) is the certified group leader responsible for creating the circle, scheduling cycles, verifying bank deposit slips, and executing on-time payouts. The Member (Subscriber) commits to timely installment payments and participates in rotation or auctions to receive the pooled lump-sum.'
    },
    {
      category: 'AUCTIONS',
      categoryLabel: 'Auctions & Payouts',
      q: 'What is the Gross Seettu Amount vs. Net Payout Amount?',
      a: 'The Gross Seettu Amount is the total capital collected in a single cycle (e.g., 10 members × LKR 50,000 = LKR 500,000). In an auction Seettu, the Net Payout Amount is the lump-sum given to the winning bidder after deducting their bid discount. The discount amount is redistributed back to all other members as a dividend, reducing their next installment.'
    },
    {
      category: 'AUCTIONS',
      categoryLabel: 'Auctions & Payouts',
      q: 'What types of Seettu groups are supported?',
      a: 'SeettuManager supports 4 distinct models: (1) Fixed Rotational Seettu (predetermined schedule), (2) Auction & Bidding Seettu (competitive discount bidding for early liquidity), (3) Random Draw / Lottery (fair algorithmic turn selection), and (4) Non-Monetary Asset Seettu (for physical items like gold jewelry, consumer electronics, and machinery with certified market valuation).'
    },
    {
      category: 'AUCTIONS',
      categoryLabel: 'Auctions & Payouts',
      q: 'What is the bidding procedure and how does an auction work?',
      a: 'During the cycle bidding window, members who need funds submit a discount bid representing the amount they are willing to forego to receive the payout early. The member who places the highest discount bid wins the cycle pool. The discounted surplus is shared equally among all non-bidded subscribers as a monthly dividend.'
    },
    {
      category: 'AUCTIONS',
      categoryLabel: 'Auctions & Payouts',
      q: 'Who is a Bidded Subscriber vs. a Non-Bidded Subscriber?',
      a: 'A Bidded Subscriber is a member who has already won an auction and received their pooled payout in a previous cycle; they are legally bound to continue paying full installments on time until the group closes. A Non-Bidded Subscriber has not yet taken a payout and enjoys monthly dividend deductions that lower their out-of-pocket contributions.'
    },
    {
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Discipline',
      q: 'What is the Financial Discipline Score (0–100) and why is it important?',
      a: 'The Financial Discipline Score is an automated algorithmic credit metric (Score ∈ [0, 100]) engineered in SeettuManager as per SRS REQ-SCR-01. Prompt payments maintain a 100 score. Delays or missed contributions trigger algorithmic penalties: max(0, 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)]). High scores qualify members for larger capital circles and verified financial certificates.'
    },
    {
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Discipline',
      q: 'What modes of payment are accepted on the platform?',
      a: 'Members can fulfill installments through three methods: (1) Bank Deposit Slip Upload (uploading a clear receipt photo for organizer review), (2) Direct Online Bank Transfer with transaction reference, or (3) Verified Offline Cash Handover with immediate digital receipt generation in the audit ledger.'
    },
    {
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Discipline',
      q: 'What happens when a member delays or defaults on an installment?',
      a: 'Delinquent payments trigger an immediate drop in the member\'s Discipline Score and automated SMS/email alerts. To ensure the winning member receives their payout on time, the circle\'s Emergency Relief Reserve covers the shortfall. Habitual defaulters face circle disqualification, administrative lockouts, and legal recovery under The Cheetus Ordinance.'
    },
    {
      category: 'PAYMENTS',
      categoryLabel: 'Payments & Discipline',
      q: 'Why is identity verification (NIC & Grama Niladhari Certificate) mandatory?',
      a: 'To eradicate synthetic fraud, duplicate memberships, and default flight risk, SeettuManager enforces mandatory Sri Lankan National Identity Card (NIC) validation (9-digit with V/X or 12-digit format) and Grama Niladhari residency character certificates before large-value payouts can be disbursed.'
    },
    {
      category: 'BASICS',
      categoryLabel: 'Basics & Legal',
      q: 'Can I take multiple tickets or slots in the same Seettu group?',
      a: 'Yes. Eligible members with an established Financial Discipline Score can subscribe to multiple tickets/slots in the same group (e.g., 2 slots in a 12-member group). Each ticket is treated independently with separate contribution obligations and two distinct rotation payout opportunities.'
    },
    {
      category: 'AUCTIONS',
      categoryLabel: 'Auctions & Payouts',
      q: 'What if a subscriber needs to cancel or leave a Seettu early?',
      a: 'Under standard Seettu agreements, if an un-bidded subscriber encounters genuine hardship, the Organizer facilitates a "Vacant Chit Transfer" to an approved replacement member from the waitlist, refunding the original member\'s contributions according to group bylaws.'
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="landing-page bg-white min-vh-100 d-flex flex-column text-dark" style={{ backgroundColor: '#F8FAFC' }}>
      
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

        /* Vertical Right Sticky Tab (Jayapriya Reference in Project Theme) */
        .vertical-organizer-tab {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1040;
          background: #0097B2;
          color: #FFFFFF;
          padding: 14px 10px;
          font-weight: 800;
          font-size: 0.78rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          border-radius: 8px 0 0 8px;
          box-shadow: -4px 6px 16px rgba(0, 0, 0, 0.25);
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .vertical-organizer-tab:hover {
          background-color: #0F2F3D;
          color: #FFFFFF;
          padding-right: 14px;
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

      {/* Vertical Sticky Right Tab: BECOME AN ORGANIZER */}
      <button 
        type="button" 
        onClick={() => setShowOrganizerModal(true)} 
        className="vertical-organizer-tab border-0" 
        title="Become a Seettu Organizer Application"
      >
        BECOME AN ORGANIZER
      </button>



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
                onClick={() => changeLanguage('en')} 
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === 'en' ? 'fw-bold text-white' : 'text-white-50'}`}
              >
                EN
              </button>
              <span className="text-white-50 small">|</span>
              <button 
                onClick={() => changeLanguage('si')} 
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === 'si' ? 'fw-bold text-white' : 'text-white-50'}`}
              >
                සිං
              </button>
              <span className="text-white-50 small">|</span>
              <button 
                onClick={() => changeLanguage('ta')} 
                className={`btn btn-link btn-sm text-decoration-none py-0 px-1 ${language === 'ta' ? 'fw-bold text-white' : 'text-white-50'}`}
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
                    style={{ top: '-3px', right: '-4px', fontSize: '0.62rem', padding: '0.2em 0.4em' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Direct Login Button */}
            {user ? (
              <Link to="/dashboard" className="btn btn-sm fw-bold px-3 text-white rounded-1" style={{ backgroundColor: '#0097B2', fontSize: '0.8rem' }}>
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-sm fw-bold px-3 text-white rounded-1" style={{ backgroundColor: '#0097B2', fontSize: '0.8rem' }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white border-bottom py-2.5 shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-3 me-4 text-decoration-none" to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} aria-label="SeettuManager Home - Sri Lanka Digital Seettu Platform">
            <img 
              src="/logo.png" 
              alt="SeettuManager - Sri Lanka Digital Seettu & Savings Platform Logo" 
              style={{ 
                height: '46px', 
                width: '46px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                flexShrink: 0 
              }} 
            />
            <div className="d-flex flex-column text-start justify-content-center">
              <span className="lh-1" style={{ fontSize: '1.65rem', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#003847', fontWeight: 900 }}>Seettu</span>
                <span style={{ color: '#0097B2', fontWeight: 900 }}>Manager</span>
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px', color: '#1A4A5E', marginTop: '3px', lineHeight: '1' }}>
                Save Together. Grow Together.
              </span>
            </div>
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#landingNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-bold fs-6">
              <li className="nav-item">
                <a className="nav-link px-3 active fw-bold" style={{ color: '#0097B2' }} href="#">{t('landing.nav_home', 'Home')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#about">{t('landing.nav_about', 'About Us')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#how-it-works">{t('landing.nav_how_it_works', 'How It Works')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#faq">{t('landing.nav_faq', 'FAQs')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 fw-bold text-dark" href="#contact">{t('landing.nav_contact', 'Contact Us')}</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <Link to={user ? '/groups/create' : '/register'} className="btn btn-outline-dark fw-bold px-3 py-2 rounded-2" style={{ borderColor: '#CBD5E1', color: '#0F2F3D', fontSize: '0.88rem' }}>
                Create Circle
              </Link>
              <Link to={user ? '/dashboard' : '/register'} className="btn fw-bold text-white px-3 py-2 rounded-2 shadow-sm" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2', fontSize: '0.88rem' }}>
                {user ? t('landing.nav_my_account', 'My Account') : t('landing.nav_get_started', 'Get Started')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigatable Image Hero Section (Direct Photo Banner) */}
      <header 
        className="navigatable-hero text-white"
        style={{
          backgroundImage: `url(${activeSlide.bgImage})`
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
                style={{ backgroundColor: activeSlide.badgeColor, fontSize: '0.78rem', letterSpacing: '0.5px' }}
              >
                ● {activeSlide.tag}
              </span>

              {/* Main Headline */}
              <h1 className="display-4 fw-extrabold text-white mb-3 lh-sm" style={{ letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.9)' }}>
                {activeSlide.mainTitle}
              </h1>

              {/* Subtitle */}
              <p className="lead text-white mb-4 fs-5 fw-medium" style={{ maxWidth: '580px', lineHeight: '1.6', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 3px #000' }}>
                {activeSlide.subtitle}
              </p>

              {/* Call-to-Action Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <a 
                  href={activeSlide.link}
                  className="btn btn-lg fw-bold text-white px-4 py-3 rounded-2 shadow-lg d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                  onClick={(e) => {
                    if (activeSlide.link.startsWith('#')) {
                      e.preventDefault();
                      const el = document.querySelector(activeSlide.link);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span>{activeSlide.cta}</span>
                  <Icon name="chevron-right" size={18} />
                </a>

                {!user && (
                  <Link 
                    to="/login" 
                    className="btn btn-lg fw-bold text-white px-4 py-3 rounded-2 shadow-lg"
                    style={{ backgroundColor: '#0F2F3D', borderColor: '#0F2F3D' }}
                  >
                    Member Sign In
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Big Bold Banner Title Overlay on Bottom Right (Jayapriya Reference Style) */}
        <div className="hero-banner-title">
          {activeSlide.bannerTitle}
        </div>

        {/* Navigatable Dash Indicators (Reference Image Style) */}
        <div className="slide-indicator-bar">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`slide-dash ${currentSlide === idx ? 'active' : ''}`}
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
                <p className="text-muted small mb-0 fw-semibold">Tracked Rotations</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>0 - 100</h4>
                <p className="text-muted small mb-0 fw-semibold">Discipline Score Engine</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>100%</h4>
                <p className="text-muted small mb-0 fw-semibold">Transparent Audit Ledger</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="stat-item">
                <h4 className="fw-extrabold mb-1" style={{ color: '#0F2F3D' }}>Cash & Assets</h4>
                <p className="text-muted small mb-0 fw-semibold">Gold, Vehicles & Goods</p>
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
            <span className="text-uppercase fw-bold" style={{ color: '#0097B2', letterSpacing: '2px', fontSize: '0.85rem' }}>
              WELCOME TO
            </span>
            <h2 className="fw-black display-5 mt-1 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span style={{ color: '#003847', fontWeight: 900 }}>Seettu</span>
              <span style={{ color: '#0097B2', fontWeight: 900 }}>Manager</span>
            </h2>
            <p className="lead text-secondary mx-auto mb-0" style={{ maxWidth: '820px', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Saving and Investing is a lifelong process. The sooner you start; the better off you'll be in the long run. Smart way to save and borrow.
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
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="award" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Financial Discipline Score
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Algorithmic 0–100 reliability scoring based on payment punctuality. Builds trusted creditability and eliminates default risks.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Become an Organizer */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="user-check" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Become an Organizer
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Your community calling: create private or village circles, set custom rules, and lead your circle with automated rotations.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowOrganizerModal(true)}
                      className="btn btn-sm btn-link text-decoration-none p-0 fw-bold mt-1.5 d-inline-flex align-items-center gap-1"
                      style={{ color: '#0097B2', fontSize: '0.84rem' }}
                    >
                      <span>Apply Online as an Organizer</span>
                      <Icon name="chevron-right" size={14} />
                    </button>
                  </div>
                </div>

                {/* Feature 3: Option to Pay Installment */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="credit-card" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Option to Pay Your Installment
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Flexible contribution periods on a daily, weekly, or monthly basis with offline cash tracking and instant bank slip verification.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Center Column: Unique High-Resolution Fintech Showcase Visual */}
            <div className="col-lg-4 col-md-12 order-first order-lg-0 mb-4 mb-lg-0">
              <div 
                className="position-relative rounded-4 overflow-hidden shadow-lg border h-100 d-flex flex-column justify-content-between align-items-center p-3 text-center"
                style={{ 
                  minHeight: '460px', 
                  backgroundColor: '#0F2F3D',
                  background: 'radial-gradient(circle at 50% 20%, rgba(0, 229, 255, 0.15) 0%, #0F2F3D 70%)',
                  border: '1px solid rgba(0, 151, 178, 0.35)'
                }}
              >
                {/* Top Badge: Sri Lanka Cheetus Ecosystem */}
                <div 
                  className="px-3 py-1 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5 text-white" 
                  style={{ 
                    backgroundColor: 'rgba(0, 151, 178, 0.85)', 
                    border: '1px solid rgba(0, 229, 255, 0.4)', 
                    zIndex: 2,
                    fontSize: '0.72rem',
                    letterSpacing: '0.6px',
                    fontWeight: 700
                  }}
                >
                  <Icon name="shield" size={13} color="#00E5FF" />
                  <span>SRI LANKAN ROTATING SAVINGS</span>
                </div>

                {/* Unique 3D Fintech Showcase Illustration */}
                <div className="my-auto w-100 d-flex justify-content-center py-2">
                  <img 
                    src="/seettu_showcase.jpg" 
                    alt="SeettuManager Smart Rotating Savings Ecosystem" 
                    className="img-fluid rounded-3 shadow-md"
                    style={{ 
                      maxHeight: '340px', 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45))'
                    }}
                  />
                </div>

                {/* Bottom Live Metrics Pill */}
                <div 
                  className="w-100 py-2 px-3 rounded-3 text-start d-flex align-items-center justify-content-between shadow-xs"
                  style={{ 
                    backgroundColor: 'rgba(7, 29, 39, 0.85)', 
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-block rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                    <span className="small text-white-50 fw-semibold" style={{ fontSize: '0.76rem' }}>
                      Certified Cheetus Ledger
                    </span>
                  </div>
                  <span className="fw-bold" style={{ color: '#00E5FF', fontSize: '0.8rem' }}>
                    100% Guaranteed
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
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="clock" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Payment Quality & Payouts
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Automated rotation calendar guarantees on-time payouts. Every member receives their lump-sum safely on their scheduled cycle date.
                    </p>
                  </div>
                </div>

                {/* Feature 5: Joining Process */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="check-square" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Joining Process
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Easily join and pay into Seettu circles with zero paperwork. Instant phone verification, member directories, and transparent rules.
                    </p>
                  </div>
                </div>

                {/* Feature 6: Secure */}
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-xs"
                    style={{ 
                      width: '54px', 
                      height: '54px', 
                      backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                      color: '#0097B2',
                      border: '1.5px solid rgba(0, 151, 178, 0.25)'
                    }}
                  >
                    <Icon name="shield" size={26} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D', fontSize: '1.15rem' }}>
                      Secure & Non-Custodial
                    </h5>
                    <p className="text-muted small mb-0" style={{ lineHeight: '1.6' }}>
                      Pay directly to organizer or members via bank transfer or cash with digital tamper-proof audit trails and duplicate payment prevention.
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
            <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '1px' }}>
              Simple 4-Step Process
            </span>
            <h2 className="fw-bold display-6 text-dark mt-1 mb-2" style={{ color: '#0F2F3D' }}>
              How SeettuManager Works
            </h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              A frictionless workflow designed specifically for organizers and members of Sri Lankan rotating savings circles.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                step: '01',
                title: 'Create or Join Circle',
                desc: 'Organizers set contribution amount, rotation frequency, and total member count for cash or goods.',
                icon: 'users'
              },
              {
                step: '02',
                title: 'Track Contributions',
                desc: 'Record offline cash deposits or bank slip uploads with immediate transparent confirmation.',
                icon: 'credit-card'
              },
              {
                step: '03',
                title: 'Scheduled Lump Payout',
                desc: 'Each cycle designates the next member in line to receive the pooled lump-sum safely.',
                icon: 'calendar'
              },
              {
                step: '04',
                title: 'Earn Discipline Score',
                desc: 'Punctual payments award verified 0–100 scores and unlock downloadable completion certificates.',
                icon: 'award'
              }
            ].map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="fintech-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="step-bubble mb-0">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <span className="text-muted fw-extrabold fs-5" style={{ opacity: 0.4 }}>{item.step}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2" style={{ color: '#0F2F3D' }}>{item.title}</h5>
                  <p className="text-muted small mb-0 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '1px' }}>
              Common Questions
            </span>
            <h2 className="fw-bold display-6 text-dark mt-1 mb-2" style={{ color: '#0F2F3D' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              Everything you need to know about setting up and participating in digital Seettu circles.
            </p>
          </div>

          {/* FAQ Controls: Category Pills and Live Search */}
          <div className="row justify-content-center mb-4">
            <div className="col-lg-9">
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-center">
                {/* Category Pills */}
                <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                  {[
                    { id: 'ALL', label: 'All Questions' },
                    { id: 'BASICS', label: 'Basics & Legal' },
                    { id: 'AUCTIONS', label: 'Auctions & Payouts' },
                    { id: 'PAYMENTS', label: 'Payments & Discipline' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setFaqCategory(cat.id); setOpenFaq(null); }}
                      className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold border-0 ${faqCategory === cat.id ? 'text-white shadow-sm' : 'text-dark bg-white border'}`}
                      style={{
                        backgroundColor: faqCategory === cat.id ? '#0097B2' : '#FFFFFF',
                        fontSize: '0.82rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Live Search */}
                <div className="position-relative" style={{ minWidth: '220px', width: '100%', maxWidth: '280px' }}>
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => { setFaqSearch(e.target.value); setOpenFaq(null); }}
                    placeholder="Search questions (e.g. loan, bidding)..."
                    className="form-control form-control-sm rounded-pill pe-4 ps-3 bg-white"
                    style={{ fontSize: '0.82rem', border: '1px solid #CBD5E1' }}
                  />
                  {faqSearch && (
                    <button
                      type="button"
                      onClick={() => setFaqSearch('')}
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
                    const matchesCategory = faqCategory === 'ALL' || f.category === faqCategory;
                    const matchesSearch = !faqSearch.trim() || 
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
                          style={{ cursor: 'pointer', fontSize: '0.98rem', color: '#0F2F3D' }}
                        >
                          <div className="d-flex align-items-center gap-2.5 pe-3">
                            <span 
                              className="badge rounded-pill fw-bold flex-shrink-0" 
                              style={{ 
                                backgroundColor: 'rgba(0, 151, 178, 0.1)', 
                                color: '#0097B2', 
                                fontSize: '0.68rem',
                                letterSpacing: '0.5px' 
                              }}
                            >
                              {faq.categoryLabel}
                            </span>
                            <span className="fw-bold text-dark">{faq.q}</span>
                          </div>
                          <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#0097B2" />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-muted border-top bg-light small leading-relaxed" style={{ fontSize: '0.92rem', lineHeight: '1.65' }}>
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
              <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '1px' }}>
                Get In Touch
              </span>
              <h2 className="fw-bold display-6 mb-3 text-dark mt-1" style={{ color: '#0F2F3D' }}>
                We Are Here to Assist Your Savings Group
              </h2>
              <p className="text-muted mb-4 leading-relaxed">
                Have questions regarding group setup, non-monetary asset evaluation, or audit compliance? Reach out to our dedicated customer support team.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                  <div className="p-2.5 rounded-3 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                    <Icon name="mail" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Email Support</h6>
                    <span className="text-muted small">seetumanager@gmail.com</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 p-3 rounded-3 border bg-light">
                  <div className="p-2.5 rounded-3 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Direct Helpline</h6>
                    <span className="text-muted small">+94 75 297 5632 (Mon – Sat)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="fintech-card p-4 p-md-5">
                <h5 className="fw-bold text-dark mb-3" style={{ color: '#0F2F3D' }}>Send Direct Inquiry</h5>
                {contactSubmitted ? (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                    <Icon name="check" size={20} />
                    <span>Thank you! Your message has been sent successfully. Our team will contact you soon.</span>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Your Name</label>
                        <input type="text" className="form-control" placeholder="Full name" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Phone Number</label>
                        <input type="tel" className="form-control" placeholder="077 123 4567" required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark small">Email Address</label>
                        <input type="email" className="form-control" placeholder="name@example.com" required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark small">Your Message</label>
                        <textarea className="form-control" rows="3" placeholder="How can we assist your Seettu circle?" required></textarea>
                      </div>
                      <div className="col-12">
                        <button type="submit" className="btn fw-bold text-white px-4 py-2.5 rounded-2 w-100" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}>
                          Submit Inquiry →
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

      {/* Balanced & Clean Footer */}
      <footer className="text-white pt-5 pb-4 mt-auto" style={{ backgroundColor: '#0F2F3D' }}>
        <div className="container">
          <div className="row g-4 pb-4 border-bottom border-light border-opacity-10">
            
            {/* Col 1: Brand & Socials */}
            {/* Col 1: Brand & Essential Links */}
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
                    Save Together. Grow Together.
                  </span>
                </div>
              </div>
              <p className="text-white-50 small mb-3 leading-relaxed" style={{ maxWidth: '420px' }}>
                Sri Lanka's dedicated digital platform for rotating savings groups. Empowering organizers and members with automated payment tracking, rotation cycles, dispute protection, and verified 0–100 discipline ratings.
              </p>

              {/* Essential Quick Navigation Links */}
              <div className="d-flex flex-wrap align-items-center gap-2 small mb-3 text-white-50">
                <a href="#about" className="text-white-50 text-decoration-none hover-white fw-semibold">About Us</a>
                <span>•</span>
                <a href="#how-it-works" className="text-white-50 text-decoration-none hover-white fw-semibold">How It Works</a>
                <span>•</span>
                <a href="#faq" className="text-white-50 text-decoration-none hover-white fw-semibold">FAQs</a>
              </div>

              {/* Social Media Links */}
              <div className="d-flex align-items-center gap-2">
                <a 
                  href="https://www.facebook.com/share/1DbJgZK7sY/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" 
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }}
                  title="Facebook"
                >
                  <Icon name="facebook" size={16} />
                </a>
                <a 
                  href="https://twitter.com/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" 
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }}
                  title="Twitter / X"
                >
                  <Icon name="twitter" size={16} />
                </a>
                <a 
                  href="https://instagram.com/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" 
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }}
                  title="Instagram"
                >
                  <Icon name="instagram" size={16} />
                </a>
                <a 
                  href="https://youtube.com/@seetumanager?si=xo7eEJ0r_07lYg7z" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center" 
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)' }}
                  title="YouTube"
                >
                  <Icon name="youtube" size={16} />
                </a>
              </div>
            </div>

            {/* Col 2: QUICK LINKS (Legal, Governance & Policies with Red Accent Bar) */}
            <div className="col-lg-3 col-md-6 col-6">
              <h6 className="fw-bold text-white mb-2 text-uppercase fs-7" style={{ letterSpacing: '1.2px' }}>
                QUICK LINKS
              </h6>
              {/* Red accent bar matching reference screenshot */}
              <div style={{ width: '38px', height: '3px', backgroundColor: '#C01920', marginBottom: '16px', borderRadius: '2px' }} />
              <ul className="footer-quick-links-list">
                {quickLinksList.map((item, idx) => (
                  <li key={idx}>
                    <Link 
                      to={item.path} 
                      className="footer-nav-item"
                    >
                      <span className="footer-nav-bullet">›</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: SUPPORT (Same Line & Red Accent Bar as Quick Links) */}
            <div className="col-lg-4 col-md-6 col-6">
              <h6 className="fw-bold text-white mb-2 text-uppercase fs-7" style={{ letterSpacing: '1.2px' }}>
                SUPPORT
              </h6>
              {/* Same red accent bar as Quick Links */}
              <div style={{ width: '38px', height: '3px', backgroundColor: '#C01920', marginBottom: '16px', borderRadius: '2px' }} />
              
              <div className="d-flex flex-column gap-3">
                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>Direct Helplines</strong>
                  <div className="d-flex flex-column gap-1">
                    <a href="tel:+94752975632" className="footer-contact-link">
                      <Icon name="phone" size={13} color="#0097B2" />
                      +94 75 297 5632
                    </a>

                  </div>
                </div>

                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>Email Support</strong>
                  <a href="mailto:seetumanager@gmail.com" className="footer-contact-link">
                    <Icon name="mail" size={13} color="#0097B2" />
                    seetumanager@gmail.com
                  </a>
                </div>

                <div>
                  <strong className="text-white d-block mb-1" style={{ fontSize: '0.88rem' }}>Platform Headquarters</strong>
                  <span className="d-inline-flex align-items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem' }}>
                    <Icon name="shield" size={13} color="#0097B2" />
                    Colombo, Western Province, Sri Lanka
                  </span>
                </div>

                <div className="pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-1">
                  <span className="text-white-50" style={{ fontSize: '0.78rem' }}>Mon – Sat (8:30 AM – 6:00 PM IST)</span>
                  <span className="badge bg-success bg-opacity-25 text-success px-2 py-1" style={{ fontSize: '0.72rem' }}>
                    ● Online
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Statutory Legal & Regulatory Compliance Notice */}
          <div className="pt-3 pb-3 border-top border-light border-opacity-10 small text-white-50">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-lg-8">
                <p className="mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                  <strong className="text-white">Statutory & Legal Notice:</strong> SeettuManager is an administrative digital record-keeping and rotation management software operating in alignment with <strong>The Cheetus Ordinance No. 61 of 1935 (Chapter 190)</strong>, the <strong>Electronic Transactions Act No. 19 of 2006</strong>, and the <strong>Personal Data Protection Act No. 9 of 2022</strong> of Sri Lanka. SeettuManager does not accept public deposits, act as a banking institution, or provide loan facilities. All financial pooling is peer-to-peer and executed between enrolled circle members and verified organizers.
                </p>
              </div>
              <div className="col-12 col-lg-4 text-lg-end">
                <div className="d-inline-flex flex-wrap gap-2 text-white-50" style={{ fontSize: '0.78rem' }}>
                  <Link to="/law" className="text-white-50 text-decoration-none hover-white">Statutory Law</Link>
                  <span>•</span>
                  <Link to="/rules" className="text-white-50 text-decoration-none hover-white">Enrollment Rules</Link>
                  <span>•</span>
                  <Link to="/terms" className="text-white-50 text-decoration-none hover-white">Terms</Link>
                  <span>•</span>
                  <Link to="/privacy" className="text-white-50 text-decoration-none hover-white">Privacy</Link>
                  <span>•</span>
                  <Link to="/disclaimer" className="text-white-50 text-decoration-none hover-white">Disclaimer</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Scroll Top */}
          <div className="pt-2 d-flex justify-content-between align-items-center flex-wrap gap-2 border-top border-light border-opacity-10">
            <p className="text-white-50 small mb-0">
              © 2026 SeettuManager. All rights reserved. • Sri Lanka Digital Rotating Savings Platform
            </p>
            <button 
              onClick={scrollToTop} 
              className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
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

      {/* Become an Organizer Application Popup Modal */}
      <BecomeOrganizerModal
        show={showOrganizerModal}
        onHide={() => setShowOrganizerModal(false)}
      />

    </div>
  );
};

export default LandingPage;
