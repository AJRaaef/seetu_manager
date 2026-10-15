import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import Icon from '../components/Icons';
import { getAllGroups } from '../api/groupApi';

const LandingPage = () => {
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();

  // State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dbGroups, setDbGroups] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Calculator State
  const [calcContribution, setCalcContribution] = useState(10000);
  const [calcMembers, setCalcMembers] = useState(12);
  const totalPot = calcContribution * calcMembers;

  // Navigatable Hero Slides
  const heroSlides = [
    {
      id: 0,
      tag: 'TRADITIONAL SRI LANKAN SEETTU (සීට්ටු / சீட்டு)',
      bannerTitle: 'HAPPY AND SATISFIED SEETTU MEMBERS',
      mainTitle: 'Traditional Community Savings, Powered by Digital Trust',
      subtitle: 'Digitize your village or neighborhood Seettu (සීට්ටු / சீட்டு) circle with transparent contribution logs, automated rotation cycles, and mutual financial discipline.',
      cta: 'Explore Seettu Schemes',
      link: '#schemes',
      bgImage: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#0097B2'
    },
    {
      id: 1,
      tag: 'LOCAL TRADERS & COMMUNITY MERCHANTS',
      bannerTitle: 'TRANSPARENT ROTATIONS & SCHEDULED PAYOUTS',
      mainTitle: 'Automated Record-Keeping for Sri Lankan Savings Groups',
      subtitle: 'Eliminate forgotten payments and handwritten notebook disputes. Manage cash handovers, bank slip verifications, and scheduled lump-sum payouts seamlessly.',
      cta: 'Create a Seettu Group',
      link: user ? '/groups/create' : '/register',
      bgImage: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#0F2F3D'
    },
    {
      id: 2,
      tag: 'TRADITIONAL GOLD SEETTU (රන් සීට්ටු / தங்கச் சீட்டு)',
      bannerTitle: 'GOLD & VALUABLE ASSET-BASED SEETTU',
      mainTitle: 'Preserve Family Wealth with Traditional Gold Rotations',
      subtitle: 'Organize high-value rotation pools for sovereign gold jewelry, farming equipment, and vehicles with verified item valuation.',
      cta: 'Browse Gold & Asset Plans',
      link: '#schemes',
      bgImage: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=80',
      badgeColor: '#FFB020'
    },
    {
      id: 3,
      tag: 'VERIFIED DISCIPLINE SCORING',
      bannerTitle: 'VERIFIED 0–100 FINANCIAL DISCIPLINE RATINGS',
      mainTitle: 'Build Community Trust with Tamper-Proof Discipline Scores',
      subtitle: 'On-time monthly contributions award recognized discipline scores and unlock verified completion certificates for all group members.',
      cta: 'Try Discipline Calculator',
      link: '#calculator',
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

  // Fetch real database groups from backend Spring Boot API
  useEffect(() => {
    const fetchDbGroups = async () => {
      try {
        const groups = await getAllGroups();
        if (groups && Array.isArray(groups) && groups.length > 0) {
          const mapped = groups.map((g) => ({
            id: g.id,
            name: g.groupName || g.name || 'Seettu Group',
            category: g.category || 'GENERAL',
            contribution: g.monthlyContribution || g.contributionAmount || 10000,
            members: g.totalMembers || g.memberCount || 12,
            totalValue: (g.monthlyContribution || 10000) * (g.totalMembers || 12),
            frequency: g.cycleFrequency || 'Monthly',
            type: g.isNonMonetary ? 'Non-Monetary' : 'Monetary',
            badge: g.status || 'Active'
          }));
          setDbGroups(mapped);
        }
      } catch (err) {
        console.log('Using default schemes fallback:', err);
      }
    };
    fetchDbGroups();
  }, []);

  const defaultSchemes = [
    {
      id: 1,
      name: 'Gold Saver Monthly Seettu',
      category: 'GOLD',
      contribution: 15000,
      members: 12,
      totalValue: 180000,
      frequency: 'Monthly',
      type: 'Monetary',
      badge: 'Popular',
      icon: 'award'
    },
    {
      id: 2,
      name: 'Community Farmer Circle',
      category: 'GENERAL',
      contribution: 5000,
      members: 20,
      totalValue: 100000,
      frequency: 'Monthly',
      type: 'Monetary',
      badge: 'Low Entry',
      icon: 'users'
    },
    {
      id: 3,
      name: 'Small Business Equipment Seettu',
      category: 'FURNITURE',
      contribution: 25000,
      members: 10,
      totalValue: 250000,
      frequency: 'Monthly',
      type: 'Non-Monetary',
      badge: 'Equipment',
      icon: 'zap'
    },
    {
      id: 4,
      name: 'Express Weekly Micro Savings',
      category: 'GENERAL',
      contribution: 2500,
      members: 8,
      totalValue: 20000,
      frequency: 'Weekly',
      type: 'Monetary',
      badge: 'Fast Payout',
      icon: 'clock'
    },
    {
      id: 5,
      name: 'Vehicle & Transport Savings',
      category: 'VEHICLE',
      contribution: 50000,
      members: 12,
      totalValue: 600000,
      frequency: 'Monthly',
      type: 'Monetary',
      badge: 'High Value',
      icon: 'credit-card'
    },
    {
      id: 6,
      name: 'Home Appliances & Living',
      category: 'FURNITURE',
      contribution: 8000,
      members: 15,
      totalValue: 120000,
      frequency: 'Monthly',
      type: 'Non-Monetary',
      badge: 'Goods Based',
      icon: 'handshake'
    }
  ];

  const schemes = dbGroups.length > 0 ? dbGroups : defaultSchemes;

  const filteredSchemes = selectedCategory === 'ALL'
    ? schemes
    : schemes.filter(s => s.category === selectedCategory || (selectedCategory === 'NON_MONETARY' && s.type === 'Non-Monetary'));

  const faqs = [
    {
      q: 'How does SeettuManager modernize traditional Seettu groups?',
      a: 'SeettuManager preserves the trusted communal nature of Sri Lankan Seettu while replacing error-prone paper logs with automated payment tracking, scheduled rotation cycles, digital dispute records, and algorithmic discipline ratings.'
    },
    {
      q: 'What is the Financial Discipline Score and how is it calculated?',
      a: 'The Discipline Score is a 0 to 100 rating computed per member based on payment punctuality: Score = max(0, 100 - [(Late × 5) + (Missed × 10) + (AvgDelayDays × 0.5)]). On-time payments maintain a 100 score and qualify members for verified completion certificates.'
    },
    {
      q: 'Are financial transactions handled directly inside the app?',
      a: 'No. Actual cash deposits and bank transfers remain between group members and organizers. SeettuManager functions as an impartial, transparent digital record-keeper and auditable tracking ledger.'
    },
    {
      q: 'How does rotation cycle scheduling work?',
      a: 'Upon group initiation, SeettuManager automatically creates all cycle dates based on member count and frequency (weekly, bi-weekly, or monthly). Organizers assign payout recipients and mark cycles completed upon payout distribution.'
    },
    {
      q: 'Can we manage Non-Monetary asset-based Seettu groups?',
      a: 'Yes! In addition to cash Seettu, the platform fully supports non-monetary Seettu for physical goods such as gold jewelry, kitchen appliances, furniture, and vehicles with transparent item valuation.'
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

        /* Floating Call Widget on Bottom Right (Reference Image Style) */
        .floating-call-pill {
          position: fixed;
          right: 75px;
          bottom: 24px;
          z-index: 1040;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .call-pill-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #0097B2;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 151, 178, 0.4);
          border: 2px solid #FFFFFF;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .floating-call-pill:hover .call-pill-icon {
          transform: scale(1.1);
          background: #0F2F3D;
        }
        .call-pill-content {
          background: #FFFFFF;
          color: #0F2F3D;
          padding: 6px 14px;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border: 1px solid #E2E8F0;
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
        }

        /* Fintech Cards & Buttons */
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
        .filter-pill {
          background-color: #F1F5F9;
          color: #475569;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .filter-pill:hover {
          background-color: #E2E8F0;
          color: #0F2F3D;
        }
        .filter-pill.active {
          background-color: #0F2F3D;
          color: #FFFFFF;
          border-color: #0F2F3D;
          box-shadow: 0 4px 12px rgba(15, 47, 61, 0.2);
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
        .calc-preset-btn {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #334155;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .calc-preset-btn:hover {
          background: #E6F7F9;
          border-color: #0097B2;
          color: #0097B2;
        }
      `}</style>

      {/* Vertical Sticky Right Tab: BECOME AN ORGANIZER */}
      <Link to="/register" className="vertical-organizer-tab" title="Become a Seettu Organizer">
        BECOME AN ORGANIZER
      </Link>

      {/* Floating Call Helpline Widget */}
      <div className="floating-call-pill d-none d-md-flex">
        <a href="tel:+94752975632" className="call-pill-icon" title="Call Helpline">
          <Icon name="phone" size={20} />
        </a>
        <div className="call-pill-content">
          <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>Call to Become an Organizer</span>
          <strong style={{ color: '#0097B2', fontSize: '0.86rem' }}>+94 75 297 5632</strong>
        </div>
      </div>

      {/* Top Brand Header Bar (Jayapriya Reference Layout in Deep Slate Teal) */}
      <div className="top-brand-bar text-white py-1.5 px-3 fs-7">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 small">
            <span className="d-flex align-items-center">
              <Icon name="mail" size={13} className="me-1" color="#0097B2" />
              seetumanager@gmail.com
            </span>
            <span className="d-none d-md-inline" style={{ opacity: 0.4 }}>|</span>
            <span className="d-flex align-items-center">
              <Icon name="phone" size={13} className="me-1" color="#0097B2" />
              +94 75 297 5632 / 4040
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

            {/* Direct Login / Portal Buttons */}
            {user ? (
              <Link to="/dashboard" className="btn btn-sm fw-bold px-3 text-white rounded-1" style={{ backgroundColor: '#0097B2', fontSize: '0.8rem' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm fw-bold px-3 text-dark rounded-1" style={{ backgroundColor: '#FFB020', fontSize: '0.8rem' }}>
                  Member Login
                </Link>
                <Link to="/register" className="btn btn-sm fw-bold px-3 text-white rounded-1" style={{ backgroundColor: '#0097B2', fontSize: '0.8rem' }}>
                  Organizer Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white border-bottom py-2.5 shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 me-4" to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} aria-label="SeettuManager Home - Sri Lanka Digital Seettu Platform">
            <img src="/logo.png" alt="SeettuManager - Sri Lanka Digital Seettu & Savings Platform Logo" style={{ height: '42px', width: '42px', borderRadius: '50%', objectFit: 'cover' }} />
            <span className="fw-extrabold fs-4 tracking-tight">
              <span style={{ color: '#0F2F3D' }}>Seettu</span>
              <span style={{ color: '#0097B2' }}>Manager</span>
            </span>
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#landingNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold fs-6">
              <li className="nav-item">
                <a className="nav-link px-3 active fw-bold" style={{ color: '#0097B2' }} href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-secondary" href="#schemes">Schemes</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-secondary" href="#how-it-works">How It Works</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-secondary" href="#calculator">Discipline Calculator</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-secondary" href="#faq">FAQs</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-secondary" href="#contact">Contact Us</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <Link to="/groups" className="btn btn-outline-dark fw-bold px-3 py-2 rounded-2" style={{ borderColor: '#CBD5E1', color: '#0F2F3D', fontSize: '0.88rem' }}>
                Browse Circles
              </Link>
              <Link to={user ? '/dashboard' : '/register'} className="btn fw-bold text-white px-3 py-2 rounded-2 shadow-sm" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2', fontSize: '0.88rem' }}>
                {user ? 'My Account' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigatable Image Hero Section (Reference Style with Project Theme) */}
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

        {/* Big Bold Banner Title Overlay on Bottom Right (Reference Style: HAPPY AND SATISFIED CUSTOMERS) */}
        <div className="hero-banner-title">
          {activeSlide.bannerTitle}
        </div>

        {/* Navigatable Dash Indicators (Reference Image Style: Red/Teal Navigatable Dashes) */}
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

      {/* Featured Seettu Schemes Section */}
      <section id="schemes" className="py-5" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '1px' }}>
              Explore Available Plans
            </span>
            <h2 className="fw-bold display-6 text-dark mt-1 mb-2" style={{ color: '#0F2F3D' }}>
              Featured Seettu Schemes
            </h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              Discover active monetary savings pools and asset plans organized by verified community organizers.
            </p>

            {/* Clean Segmented Filter Chips */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
              {[
                { id: 'ALL', label: 'All Schemes' },
                { id: 'GENERAL', label: 'Cash Savings' },
                { id: 'GOLD', label: 'Gold Seettu' },
                { id: 'VEHICLE', label: 'Vehicles' },
                { id: 'FURNITURE', label: 'Home Appliances' },
                { id: 'NON_MONETARY', label: 'Non-Monetary' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="row g-4">
            {filteredSchemes.map((s) => (
              <div key={s.id} className="col-md-6 col-lg-4">
                <div className="fintech-card h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-light text-dark fw-bold px-2.5 py-1 rounded-pill border small">
                        {s.type}
                      </span>
                      <span className="badge text-white fw-bold px-2.5 py-1 rounded-pill small" style={{ backgroundColor: '#0097B2' }}>
                        {s.badge}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2" style={{ color: '#0F2F3D' }}>{s.name}</h5>
                    <p className="text-muted small mb-3">Organized rotation pool with automated tracking and dispute audit trail.</p>

                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <div className="d-flex justify-content-between mb-1.5 small">
                        <span className="text-muted">Monthly Contribution:</span>
                        <span className="fw-bold text-dark">{s.contribution.toLocaleString()} LKR</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1.5 small">
                        <span className="text-muted">Total Members:</span>
                        <span className="fw-semibold text-dark">{s.members} Members</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2 mt-2">
                        <span className="fw-bold text-dark small">Total Pool Value:</span>
                        <span className="fw-extrabold" style={{ color: '#0097B2' }}>{s.totalValue.toLocaleString()} LKR</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                      <Icon name="clock" size={15} />
                      <span>Rotation: {s.frequency}</span>
                    </div>
                  </div>

                  <Link 
                    to={user ? '/groups' : '/register'} 
                    className="btn btn-outline-dark w-100 fw-bold py-2 rounded-2 mt-2"
                    style={{ borderColor: '#CBD5E1', color: '#0F2F3D' }}
                  >
                    {user ? 'View Scheme Details' : 'Join Scheme →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Seettu Calculator Section */}
      <section id="calculator" className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            
            {/* Controls */}
            <div className="col-lg-6">
              <span className="text-uppercase fw-bold text-muted small" style={{ letterSpacing: '1px' }}>
                Interactive Projection
              </span>
              <h2 className="fw-bold display-6 mb-3 text-dark mt-1" style={{ color: '#0F2F3D' }}>
                Calculate Your Group Rotation Pool
              </h2>
              <p className="text-muted lead mb-4" style={{ fontSize: '1.05rem' }}>
                Simulate your savings circle size, monthly member contributions, payout cycles, and expected financial discipline target.
              </p>

              <div className="bg-light p-4 rounded-4 border">
                
                {/* Contribution Slider */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold text-dark mb-0">Monthly Contribution per Member:</label>
                    <span className="fw-extrabold fs-5" style={{ color: '#0097B2' }}>
                      {calcContribution.toLocaleString()} LKR
                    </span>
                  </div>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={calcContribution}
                    onChange={(e) => setCalcContribution(Number(e.target.value))}
                  />
                  {/* Presets */}
                  <div className="d-flex gap-2 mt-2">
                    {[5000, 10000, 25000, 50000].map((val) => (
                      <button 
                        key={val} 
                        type="button" 
                        className="calc-preset-btn"
                        onClick={() => setCalcContribution(val)}
                      >
                        {val.toLocaleString()} LKR
                      </button>
                    ))}
                  </div>
                </div>

                {/* Members Slider */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold text-dark mb-0">Number of Group Members:</label>
                    <span className="fw-extrabold fs-5" style={{ color: '#0097B2' }}>
                      {calcMembers} Members
                    </span>
                  </div>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="3" 
                    max="36" 
                    step="1"
                    value={calcMembers}
                    onChange={(e) => setCalcMembers(Number(e.target.value))}
                  />
                  {/* Presets */}
                  <div className="d-flex gap-2 mt-2">
                    {[6, 12, 18, 24].map((cnt) => (
                      <button 
                        key={cnt} 
                        type="button" 
                        className="calc-preset-btn"
                        onClick={() => setCalcMembers(cnt)}
                      >
                        {cnt} Members
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Projection Summary Card */}
            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4 text-white shadow-lg" style={{ backgroundColor: '#0F2F3D' }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-white-50 text-uppercase small fw-bold tracking-wider">Lump-Sum Payout Pool</span>
                  <span className="badge bg-white-subtle text-white border border-light border-opacity-25 px-2.5 py-1 rounded-pill small">
                    Calculated Live
                  </span>
                </div>
                
                <h1 className="display-4 fw-extrabold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
                  LKR {totalPot.toLocaleString()}
                </h1>

                <div className="row g-3 py-3 border-top border-bottom border-light border-opacity-10 mb-4">
                  <div className="col-6">
                    <div className="text-white-50 small">Cycle Duration:</div>
                    <div className="fw-bold text-white fs-5">{calcMembers} Months</div>
                  </div>
                  <div className="col-6">
                    <div className="text-white-50 small">Discipline Target:</div>
                    <div className="fw-bold text-success fs-5">95 / 100 [High]</div>
                  </div>
                </div>

                <Link 
                  to={user ? '/groups/create' : '/register'} 
                  className="btn btn-lg w-100 fw-bold text-white rounded-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                >
                  <span>Start Group with this Projection</span>
                  <Icon name="chevron-right" size={18} />
                </Link>
              </div>
            </div>

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

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex flex-column gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="fintech-card overflow-hidden">
                      <button 
                        className="w-100 text-start p-4 border-0 bg-white d-flex align-items-center justify-content-between fw-bold text-dark"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        style={{ cursor: 'pointer', fontSize: '1.02rem', color: '#0F2F3D' }}
                      >
                        <span>{faq.q}</span>
                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#0097B2" />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-muted border-top bg-light small leading-relaxed" style={{ fontSize: '0.94rem' }}>
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
                Have questions regarding group setup, non-monetary asset evaluation, or audit compliance? Reach out to our Moratuwa project support team.
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
            <div className="col-lg-5 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fw-extrabold fs-4 tracking-tight">
                  <span style={{ color: '#FFFFFF' }}>Seettu</span>
                  <span style={{ color: '#0097B2' }}>Manager</span>
                </span>
              </div>
              <p className="text-white-50 small mb-4 leading-relaxed" style={{ maxWidth: '400px' }}>
                Sri Lanka's dedicated digital platform for rotating savings groups. Empowering organizers and members with automated payment tracking, rotation cycles, dispute protection, and verified 0–100 discipline ratings.
              </p>
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

            {/* Col 2: Quick Links */}
            <div className="col-lg-3 col-md-3 col-6">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7" style={{ letterSpacing: '1px' }}>Quick Navigation</h6>
              <ul className="list-unstyled text-white-50 small mb-0 d-flex flex-column gap-2">
                <li><a href="#schemes" className="text-white-50 text-decoration-none">Available Schemes</a></li>
                <li><a href="#how-it-works" className="text-white-50 text-decoration-none">How It Works</a></li>
                <li><a href="#calculator" className="text-white-50 text-decoration-none">Discipline Calculator</a></li>
                <li><Link to="/certificates" className="text-white-50 text-decoration-none">Verify Certificate</Link></li>
                <li><Link to="/disputes" className="text-white-50 text-decoration-none">Dispute Resolution</Link></li>
              </ul>
            </div>

            {/* Col 3: Academic / Project Details */}
            <div className="col-lg-4 col-md-3 col-6">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7" style={{ letterSpacing: '1px' }}>Project Context</h6>
              <div className="text-white-50 small leading-relaxed d-flex flex-column gap-1.5">
                <div>Institute of Technology University of Moratuwa</div>
                <div>Division of Information Technology</div>
                <div>Supervised by W.M.N. Wathsala Bandara Manike</div>
                <div className="mt-2 text-white-50">Colombo, Sri Lanka</div>
              </div>
            </div>

          </div>

          {/* Copyright & Scroll Top */}
          <div className="pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-white-50 small mb-0">
              © 2026 SeettuManager. Developed for ITUM NDIT Capstone. All rights reserved.
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

    </div>
  );
};

export default LandingPage;
