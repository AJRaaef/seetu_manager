import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import Icon from '../components/Icons';
import { getAllGroups } from '../api/groupApi';

const LandingPage = () => {
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  // State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [dbGroups, setDbGroups] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const heroSlides = [
    {
      title: 'Smart Digital Savings & Financial Discipline',
      subtitle: 'Join or manage transparent Seettu groups with automated payment tracking, scheduled rotation payouts, dispute protection, and verified 0–100 discipline ratings.',
      tag: 'Built for Sri Lankan Rotating Savings Groups',
      cta: 'Create New Seettu Group →',
      link: user ? '/groups/create' : '/register',
      accentColor: '#0097B2',
      bgImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      slideTitle: 'Digital Discipline'
    },
    {
      title: 'Automated Rotation Cycles & Scheduled Payouts',
      subtitle: 'Set up weekly, bi-weekly, or monthly Seettu groups. Automatically generate cycle dates, assign payout recipients, and issue instant completion certificates.',
      tag: 'Seamless Cycle Management',
      cta: 'Explore Seettu Schemes →',
      link: '#schemes',
      accentColor: '#0F2F3D',
      bgImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      slideTitle: 'Rotation Cycles'
    },
    {
      title: 'Verified 0–100 Discipline Rating Engine',
      subtitle: 'Build a trustworthy financial reputation across all your savings groups. Timely payments increase your rating and award verified digital certificates.',
      tag: 'Algorithmic Reliability Rating',
      cta: 'Calculate Discipline Score →',
      link: '#calculator',
      accentColor: '#0097B2',
      bgImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      slideTitle: 'Rating System'
    },
    {
      title: 'Gold, Appliance & Vehicle Asset Seettu',
      subtitle: 'Organize non-monetary rotational savings for high-value assets with transparent bidding, item valuation, and verified delivery logs.',
      tag: 'Non-Monetary Asset Savings',
      cta: 'Browse Asset Plans →',
      link: '#schemes',
      accentColor: '#0097B2',
      bgImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=80',
      slideTitle: 'Asset Seettu'
    }
  ];

  // Auto-advance hero slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Seettu Calculator State
  const [calcContribution, setCalcContribution] = useState(10000);
  const [calcMembers, setCalcMembers] = useState(12);
  const totalPot = calcContribution * calcMembers;

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
      contribution: 10000,
      members: 12,
      totalValue: 120000,
      frequency: 'Monthly',
      type: 'Monetary',
      badge: 'Most Popular'
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
      badge: 'Low Contribution'
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
      badge: 'Item Based'
    },
    {
      id: 4,
      name: 'Express Weekly Micro Savings',
      category: 'GENERAL',
      contribution: 2000,
      members: 10,
      totalValue: 20000,
      frequency: 'Weekly',
      type: 'Monetary',
      badge: 'Fast Cycle'
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
      badge: 'High Value'
    },
    {
      id: 6,
      name: 'Home Appliances & Kitchenware',
      category: 'FURNITURE',
      contribution: 8000,
      members: 15,
      totalValue: 120000,
      frequency: 'Monthly',
      type: 'Non-Monetary',
      badge: 'Non-Monetary'
    }
  ];

  const schemes = dbGroups.length > 0 ? dbGroups : defaultSchemes;

  const filteredSchemes = selectedCategory === 'ALL'
    ? schemes
    : schemes.filter(s => s.category === selectedCategory || (selectedCategory === 'NON_MONETARY' && s.type === 'Non-Monetary'));

  const faqs = [
    {
      q: 'How does SeettuManager digitize traditional Seettu groups?',
      a: 'SeettuManager maintains the traditional community structure of Seettu while replacing paper logs with automated payment tracking, rotation cycle management, and financial discipline ratings.'
    },
    {
      q: 'What is the Financial Discipline Score?',
      a: 'It is an automated 0 to 100 rating calculated per member based on payment timeliness. On-time payments maintain high scores (90-100), while late or missed payments incur score penalties.'
    },
    {
      q: 'Are actual payments processed inside the system?',
      a: 'No. All financial transactions occur offline through cash or bank transfers. SeettuManager serves as a transparent digital ledger, record keeper, and audit tracking system.'
    },
    {
      q: 'How do rotation payout schedules work?',
      a: 'When a group is created, SeettuManager automatically generates payout rotation cycles. Organizers assign payout recipients per cycle and mark cycles completed upon payout.'
    },
    {
      q: 'Does the system support Non-Monetary Seettu?',
      a: 'Yes! In addition to monetary cash Seettu, SeettuManager supports non-monetary Seettu for goods such as furniture, kitchen equipment, gold, or vehicles.'
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSlide = heroSlides[heroSlide];

  return (
    <div className="landing-page bg-light min-vh-100 d-flex flex-column text-dark" style={{ backgroundColor: '#F8FAFC' }}>
      
      {/* Dynamic Background Patterns & Commercial Floating Widgets */}
      <style>{`
        .hero-pattern-bg {
          background-color: #0F2F3D;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(45, 212, 191, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(13, 148, 136, 0.22) 0%, transparent 50%),
            linear-gradient(135deg, #0F2F3D 0%, #1A5265 60%, #235665 100%);
        }
        .hero-grid-overlay {
          background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .slide-fade-in {
          animation: fadeInSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          background: transparent;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .nav-dot.active {
          width: 32px;
          border-radius: 6px;
          background-color: #0097B2;
          border-color: #0097B2;
        }
        
        /* Floating Right Side Tab & Call Widget (Jayapriya Inspired in Project Colors) */
        .floating-organizer-tab {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1040;
          background-color: #0097B2;
          color: #FFFFFF;
          padding: 14px 10px;
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          border-radius: 8px 0 0 8px;
          box-shadow: -4px 4px 15px rgba(0,0,0,0.3);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .floating-organizer-tab:hover {
          background-color: #0F2F3D;
          color: #FFFFFF;
          padding-right: 14px;
        }
        .floating-call-bar {
          position: fixed;
          right: 75px;
          bottom: 24px;
          z-index: 1040;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .floating-call-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #0097B2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0, 151, 178, 0.45);
          border: 2px solid #FFFFFF;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .floating-call-btn:hover {
          transform: scale(1.1);
          background-color: #0F2F3D;
          color: white;
        }
        .floating-call-card {
          background-color: #FFFFFF;
          color: #0F2F3D;
          padding: 6px 14px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          border: 1px solid #E2E8F0;
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      {/* Floating Vertical Right Tab: BECOME AN ORGANIZER */}
      <Link to="/register" className="floating-organizer-tab" title="Register or Join as Seettu Organizer">
        BECOME AN ORGANIZER
      </Link>

      {/* Floating Call Widget */}
      <div className="floating-call-bar d-none d-md-flex">
        <a href="tel:0112345678" className="floating-call-btn" title="Call Helpline">
          <Icon name="phone" size={22} />
        </a>
        <div className="floating-call-card">
          <span className="text-muted fw-semibold" style={{ fontSize: '0.72rem' }}>Call to Become an Organizer</span>
          <strong style={{ color: '#0097B2', fontSize: '0.88rem' }}>011 234 5678</strong>
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="bg-dark text-white py-1 px-3 fs-7 border-bottom border-secondary" style={{ backgroundColor: '#0A212B' }}>
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 small">
            <span className="d-flex align-items-center"><Icon name="phone" size={13} className="me-1 text-info" /> Support: 011 234 5678</span>
            <span className="d-none d-md-inline">|</span>
            <span className="d-none d-md-inline d-flex align-items-center"><Icon name="mail" size={13} className="me-1 text-info" /> seetumanager@gmail.com</span>
            <span className="d-none d-lg-inline">|</span>
            <span className="d-none d-lg-inline d-flex align-items-center">Colombo, Sri Lanka</span>
          </div>
          <div className="d-flex align-items-center gap-3 ms-auto small">
            <div className="d-flex align-items-center gap-1">
              <span className="text-white-50">Lang:</span>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`btn btn-link btn-sm text-decoration-none p-0 px-1 ${language === 'en' ? 'fw-bold text-info' : 'text-white-50'}`}
              >
                EN
              </button>
              <span className="text-white-50">|</span>
              <button 
                onClick={() => changeLanguage('si')} 
                className={`btn btn-link btn-sm text-decoration-none p-0 px-1 ${language === 'si' ? 'fw-bold text-info' : 'text-white-50'}`}
              >
                SI
              </button>
              <span className="text-white-50">|</span>
              <button 
                onClick={() => changeLanguage('ta')} 
                className={`btn btn-link btn-sm text-decoration-none p-0 px-1 ${language === 'ta' ? 'fw-bold text-info' : 'text-white-50'}`}
              >
                TA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm py-2" style={{ backgroundColor: '#0F2F3D' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center me-4" to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <span className="fw-bold fs-3">
              <span style={{ color: '#FFFFFF' }}>Seettu</span>
              <span style={{ color: '#0097B2' }}>Manager</span>
            </span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#landingNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="landingNav">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold">
              <li className="nav-item">
                <a className="nav-link active px-3" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-white-50" href="#schemes">Seettu Schemes</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-white-50" href="#how-it-works">How It Works</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-white-50" href="#calculator">Discipline Score</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-white-50" href="#faq">FAQs</a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 text-white-50" href="#contact">Contact Us</a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-info fw-bold text-white px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}>
                    Go to Dashboard →
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-light fw-semibold px-3 py-2 rounded-3">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-info fw-bold text-white px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}>
                    Register Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Banner with Full-Coverage Dynamic Background Image */}
      <header 
        key={heroSlide}
        className="text-white py-5 position-relative overflow-hidden slide-fade-in"
        style={{
          backgroundColor: '#0F2F3D',
          backgroundImage: `linear-gradient(135deg, rgba(15, 47, 61, 0.88) 0%, rgba(10, 33, 43, 0.94) 100%), url(${currentSlide.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.6s ease-in-out',
          minHeight: '520px'
        }}
      >
        <div className="container py-lg-4 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-7">
              <span className="badge rounded-pill px-3 py-2 mb-3 fw-semibold border border-light border-opacity-25" style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(6px)' }}>
                {currentSlide.tag}
              </span>
              
              <h1 className="display-4 fw-extrabold mb-3 text-white lh-sm">
                {currentSlide.title}
              </h1>
              
              <p className="lead text-white-50 mb-4 fs-5" style={{ maxWidth: '640px' }}>
                {currentSlide.subtitle}
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <Link 
                  to={currentSlide.link.startsWith('#') ? currentSlide.link : currentSlide.link} 
                  className="btn btn-info btn-lg fw-bold text-white px-4 py-3 rounded-3 shadow-lg"
                  style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                  onClick={(e) => {
                    if (currentSlide.link.startsWith('#')) {
                      e.preventDefault();
                      const el = document.querySelector(currentSlide.link);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {currentSlide.cta}
                </Link>
                
                {!user && (
                  <Link to="/login" className="btn btn-outline-light btn-lg fw-semibold px-4 py-3 rounded-3">
                    Member Sign In
                  </Link>
                )}
              </div>

              {/* Slider Dots */}
              <div className="d-flex align-items-center gap-2 mt-4 pt-2">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    className={`nav-dot ${heroSlide === idx ? 'active' : ''}`}
                    onClick={() => setHeroSlide(idx)}
                    title={slide.slideTitle}
                  />
                ))}
              </div>
            </div>

            {/* Right Side Live System Glassmorphic Summary Card */}
            <div className="col-lg-5 d-none d-lg-block">
              <div 
                className="rounded-4 p-4 shadow-2xl border border-white border-opacity-25"
                style={{ 
                  backgroundColor: 'rgba(15, 47, 61, 0.75)', 
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light border-opacity-25">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success px-3 py-2 rounded-pill fw-bold">Live System</span>
                    <span className="small text-white-50">Rotational Savings Circle</span>
                  </div>
                  <Icon name="shield" size={24} color="#0097B2" />
                </div>

                <div className="bg-dark bg-opacity-50 p-3 rounded-3 mb-3 border border-light border-opacity-10">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-white-50">Active Scheme:</span>
                    <span className="fw-bold text-info" style={{ color: '#0097B2' }}>{currentSlide.slideTitle}</span>
                  </div>
                  <h4 className="fw-extrabold text-white mb-0">120,000 LKR Pot Value</h4>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-40 p-3 rounded-3 border border-light border-opacity-10">
                      <span className="fs-7 text-white-50 d-block mb-1">Discipline Score</span>
                      <h5 className="fw-bold text-success mb-0">98 / 100</h5>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-dark bg-opacity-40 p-3 rounded-3 border border-light border-opacity-10">
                      <span className="fs-7 text-white-50 d-block mb-1">Payout Status</span>
                      <h5 className="fw-bold text-white mb-0">Cycle #4 Paid</h5>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-3 text-white" style={{ background: 'linear-gradient(135deg, rgba(0,151,178,0.4) 0%, rgba(15,47,61,0.85) 100%)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-info text-white p-2 rounded-circle" style={{ backgroundColor: '#0097B2' }}>
                      <Icon name="check" size={20} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-white">{currentSlide.slideTitle}</h6>
                      <p className="small text-white-50 mb-0">Verified Payout Rotation & Digital Ledger</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trust & Stat Metrics Bar */}
      <section className="bg-white py-4 border-bottom shadow-sm">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-2">
                <h3 className="fw-extrabold text-dark mb-0" style={{ color: '#0F2F3D' }}>LKR 50M+</h3>
                <p className="text-muted small mb-0 fw-semibold">Tracked Seettu Rotations</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="p-2">
                <h3 className="fw-extrabold text-dark mb-0" style={{ color: '#0F2F3D' }}>100%</h3>
                <p className="text-muted small mb-0 fw-semibold">Transparent Audit Ledger</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="p-2">
                <h3 className="fw-extrabold text-dark mb-0" style={{ color: '#0F2F3D' }}>0 - 100</h3>
                <p className="text-muted small mb-0 fw-semibold">Discipline Rating Engine</p>
              </div>
            </div>
            <div className="col-6 col-md-3 border-start">
              <div className="p-2">
                <h3 className="fw-extrabold text-dark mb-0" style={{ color: '#0F2F3D' }}>Monetary & Goods</h3>
                <p className="text-muted small mb-0 fw-semibold">Gold, Vehicles & Cash</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Seettu Schemes Section */}
      <section id="schemes" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-info text-white px-3 py-2 rounded-pill fw-semibold mb-2" style={{ backgroundColor: '#0097B2' }}>
              Explore Available Plans
            </span>
            <h2 className="fw-bold display-6 text-dark mb-2" style={{ color: '#0F2F3D' }}>
              Featured Seettu Schemes
            </h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '650px' }}>
              Browse active monetary and asset-based Seettu groups organized by verified Sri Lankan community leaders.
            </p>

            {/* Category Filter Pills */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
              {[
                { id: 'ALL', label: 'All Schemes' },
                { id: 'GENERAL', label: 'Cash Savings' },
                { id: 'GOLD', label: 'Gold Seettu' },
                { id: 'VEHICLE', label: 'Vehicles' },
                { id: 'FURNITURE', label: 'Home & Furniture' },
                { id: 'NON_MONETARY', label: 'Non-Monetary Goods' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn rounded-pill px-4 py-2 fw-semibold border-0 ${selectedCategory === cat.id ? 'btn-dark text-white shadow-sm' : 'btn-outline-secondary bg-white text-dark'}`}
                  style={selectedCategory === cat.id ? { backgroundColor: '#0F2F3D' } : {}}
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
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover position-relative bg-white">
                  <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary-subtle text-dark fw-bold px-3 py-2 rounded-pill small">
                      {s.type}
                    </span>
                    <span className="badge bg-info text-white fw-bold px-3 py-2 rounded-pill small" style={{ backgroundColor: '#0097B2' }}>
                      {s.badge}
                    </span>
                  </div>

                  <div className="card-body px-4 py-3">
                    <h5 className="fw-bold text-dark mb-2" style={{ color: '#0F2F3D' }}>{s.name}</h5>
                    <p className="text-muted small mb-3">Rotational savings pool organized with transparent scheduled payouts.</p>

                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Monthly Contribution:</span>
                        <span className="fw-bold text-dark">{s.contribution.toLocaleString()} LKR</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Total Group Members:</span>
                        <span className="fw-semibold text-dark">{s.members} Members</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2 mt-2">
                        <span className="fw-bold text-dark small">Total Rotation Pool Value:</span>
                        <span className="fw-extrabold text-info" style={{ color: '#0097B2' }}>{s.totalValue.toLocaleString()} LKR</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                      <Icon name="clock" size={16} />
                      <span>Payout Frequency: {s.frequency}</span>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 px-4 pb-4 pt-0">
                    <Link 
                      to={user ? '/groups' : '/register'} 
                      className="btn btn-outline-dark w-100 fw-bold py-2 rounded-3"
                    >
                      {user ? 'View Group Details →' : 'Join Scheme Now →'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discipline Score Calculator Section */}
      <section id="calculator" className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-info text-white px-3 py-2 rounded-pill fw-semibold mb-2" style={{ backgroundColor: '#0097B2' }}>
                Interactive Seettu Calculator
              </span>
              <h2 className="fw-bold display-6 mb-3 text-dark" style={{ color: '#0F2F3D' }}>
                Calculate Your Total Group Rotation Pool
              </h2>
              <p className="text-muted lead mb-4">
                Adjust monthly contributions and member counts to see instant total pot values, payout cycle timelines, and expected financial discipline scores.
              </p>

              <div className="bg-light p-4 rounded-4 border shadow-sm">
                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between text-dark">
                    <span>Monthly Contribution per Member:</span>
                    <span className="text-info fw-extrabold" style={{ color: '#0097B2' }}>{calcContribution.toLocaleString()} LKR</span>
                  </label>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={calcContribution}
                    onChange={(e) => setCalcContribution(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between text-muted fs-7">
                    <span>1,000 LKR</span>
                    <span>50,000 LKR</span>
                    <span>100,000 LKR</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between text-dark">
                    <span>Number of Group Members:</span>
                    <span className="text-info fw-extrabold" style={{ color: '#0097B2' }}>{calcMembers} Members</span>
                  </label>
                  <input 
                    type="range" 
                    className="form-range" 
                    min="3" 
                    max="36" 
                    step="1"
                    value={calcMembers}
                    onChange={(e) => setCalcMembers(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between text-muted fs-7">
                    <span>3 Members</span>
                    <span>12 Members</span>
                    <span>36 Members</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4 text-white shadow-xl" style={{ backgroundColor: '#0F2F3D' }}>
                <h4 className="fw-bold mb-4 text-white">Group Projection Summary</h4>
                
                <div className="mb-4 pb-3 border-bottom border-secondary">
                  <span className="text-white-50 text-uppercase fs-7 fw-bold">Total Lump-Sum Payout Pool</span>
                  <h1 className="display-4 fw-extrabold text-info mb-0" style={{ color: '#0097B2' }}>
                    {totalPot.toLocaleString()} LKR
                  </h1>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <span className="text-white-50 fs-7">Rotation Duration:</span>
                    <h5 className="fw-bold text-white mb-0">{calcMembers} Months</h5>
                  </div>
                  <div className="col-6">
                    <span className="text-white-50 fs-7">Target Discipline Rating:</span>
                    <h5 className="fw-bold text-success mb-0">95 / 100 Verified</h5>
                  </div>
                </div>

                <Link 
                  to={user ? '/groups/create' : '/register'} 
                  className="btn btn-info w-100 fw-bold py-3 text-white rounded-3 shadow-md"
                  style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}
                >
                  Start Group With This Projection →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Core Features */}
      <section id="how-it-works" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-info text-white px-3 py-2 rounded-pill fw-semibold mb-2" style={{ backgroundColor: '#0097B2' }}>
              Simple 4-Step Process
            </span>
            <h2 className="fw-bold display-6 text-dark mb-2" style={{ color: '#0F2F3D' }}>
              How SeettuManager Works
            </h2>
            <p className="text-muted lead mx-auto" style={{ maxWidth: '650px' }}>
              Transparent rotation management designed specifically for local savings circles.
            </p>
          </div>

          <div className="row g-4">
            {[
              { step: '01', title: 'Create or Join Group', desc: 'Organizers set up monthly contributions, frequency, total members, and monetary or asset preferences.' },
              { step: '02', title: 'Record Monthly Contributions', desc: 'Members pay offline via cash or bank transfer. Organizers record transactions in the transparent digital ledger.' },
              { step: '03', title: 'Scheduled Rotation Payout', desc: 'Each cycle, the designated member receives the lump-sum payout according to the agreed payout order.' },
              { step: '04', title: 'Earn Verified Discipline Rating', desc: 'On-time payment records build your 0–100 discipline rating score and unlock verified completion certificates.' }
            ].map((item, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white card-hover">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center fw-extrabold fs-4 text-white" style={{ width: '60px', height: '60px', backgroundColor: '#0F2F3D' }}>
                    {item.step}
                  </div>
                  <h5 className="fw-bold text-dark mb-2" style={{ color: '#0F2F3D' }}>{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-5 bg-white border-top">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-info text-white px-3 py-2 rounded-pill fw-semibold mb-2" style={{ backgroundColor: '#0097B2' }}>
              Got Questions?
            </span>
            <h2 className="fw-bold display-6 text-dark mb-2" style={{ color: '#0F2F3D' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion accordion-flush shadow-sm rounded-4 overflow-hidden border" id="faqAccordion">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div className="accordion-item" key={index}>
                      <h2 className="accordion-header" id={`heading${index}`}>
                        <button 
                          className={`accordion-button fw-bold text-dark py-3 ${isOpen ? '' : 'collapsed'}`} 
                          type="button" 
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          style={{ cursor: 'pointer', backgroundColor: isOpen ? '#F1F5F9' : '#FFFFFF' }}
                        >
                          {faq.q}
                        </button>
                      </h2>
                      <div 
                        className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
                        style={{ display: isOpen ? 'block' : 'none' }}
                      >
                        <div className="accordion-body text-muted leading-relaxed py-3 px-4 border-top">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-5 bg-light border-top">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <span className="badge bg-info text-white px-3 py-2 rounded-pill fw-semibold mb-2" style={{ backgroundColor: '#0097B2' }}>
                We Are Here To Help
              </span>
              <h2 className="fw-bold display-6 mb-3 text-dark" style={{ color: '#0F2F3D' }}>
                Get In Touch With Our Team
              </h2>
              <p className="text-muted mb-4">
                Have questions about setting up a high-value Seettu group or integrating non-monetary asset rotational savings? Send us a message!
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 shadow-sm border">
                  <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                    <Icon name="mail" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Email Support</h6>
                    <span className="text-muted small">seetumanager@gmail.com</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 shadow-sm border">
                  <div className="p-2 rounded-3 text-white" style={{ backgroundColor: '#0F2F3D' }}>
                    <Icon name="shield" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">Dispute & Audit Helpline</h6>
                    <span className="text-muted small">011 234 5678 (Mon - Sat)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border">
                <h5 className="fw-bold text-dark mb-3" style={{ color: '#0F2F3D' }}>Send Direct Inquiry</h5>
                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent.'); }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small">Your Name</label>
                      <input type="text" className="form-control" placeholder="Enter full name" required />
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
                      <textarea className="form-control" rows="4" placeholder="How can we assist your Seettu group?" required></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-info fw-bold text-white px-4 py-2 rounded-3 w-100" style={{ backgroundColor: '#0097B2', borderColor: '#0097B2' }}>
                        Submit Inquiry →
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Project Footer (Jayapriya Layout in SeettuManager Colors) */}
      <footer className="text-white pt-5 pb-3 mt-auto position-relative" style={{ backgroundColor: '#0F2F3D' }}>
        <div className="container">
          <div className="row g-4 pb-4 border-bottom border-secondary border-opacity-50">
            
            {/* Col 1: Brand & Bio & Socials */}
            <div className="col-lg-5 col-md-6">
              <h4 className="fw-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span style={{ color: '#FFFFFF' }}>Seettu</span>
                <span style={{ color: '#0097B2' }}>Manager</span>
              </h4>
              <p className="text-white-50 small mb-4 leading-relaxed" style={{ maxWidth: '420px' }}>
                SeettuManager is Sri Lanka's dedicated digital platform for rotating savings circles. Empowering organizers and members with automated payment tracking, scheduled rotation payouts, dispute protection, and verified 0–100 discipline ratings.
              </p>
              <div className="d-flex align-items-center gap-2">
                <a 
                  href="https://facebook.com/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-1 px-2 py-2 d-inline-flex align-items-center justify-content-center" 
                  title="Facebook"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="facebook" size={16} />
                </a>
                <a 
                  href="https://twitter.com/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-1 px-2 py-2 d-inline-flex align-items-center justify-content-center" 
                  title="Twitter / X"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="twitter" size={16} />
                </a>
                <a 
                  href="https://instagram.com/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-1 px-2 py-2 d-inline-flex align-items-center justify-content-center" 
                  title="Instagram"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="instagram" size={16} />
                </a>
                <a 
                  href="https://linkedin.com/company/seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-1 px-2 py-2 d-inline-flex align-items-center justify-content-center" 
                  title="LinkedIn"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="linkedin" size={16} />
                </a>
                <a 
                  href="https://youtube.com/@seetumanager" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-light btn-sm rounded-1 px-2 py-2 d-inline-flex align-items-center justify-content-center" 
                  title="YouTube"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Icon name="youtube" size={16} />
                </a>
              </div>
            </div>

            {/* Col 2: QUICK LINKS */}
            <div className="col-lg-3 col-md-6">
              <h6 className="fw-bold text-white mb-2 text-uppercase fs-7">QUICK LINKS</h6>
              <div className="mb-3" style={{ width: '40px', height: '2px', backgroundColor: '#0097B2' }}></div>
              <ul className="list-unstyled text-white-50 small mb-0 d-flex flex-column gap-2">
                <li><a href="#" className="text-white-50 text-decoration-none hover-white">Seettu Act & Regulations</a></li>
                <li><Link to="/certificates" className="text-white-50 text-decoration-none hover-white">Certificate Verification</Link></li>
                <li><Link to="/disputes" className="text-white-50 text-decoration-none hover-white">Dispute Complaints</Link></li>
                <li><a href="#contact" className="text-white-50 text-decoration-none hover-white">Contact Us</a></li>
                <li><a href="#faq" className="text-white-50 text-decoration-none hover-white">Privacy & Policy</a></li>
                <li><a href="#faq" className="text-white-50 text-decoration-none hover-white">Terms & Conditions</a></li>
                <li><a href="#faq" className="text-white-50 text-decoration-none hover-white">Cancellation Policy</a></li>
                <li><a href="#faq" className="text-white-50 text-decoration-none hover-white">Refund Policy</a></li>
                <li><a href="#faq" className="text-white-50 text-decoration-none hover-white">Disclaimer</a></li>
              </ul>
            </div>

            {/* Col 3: CONTACT INFO */}
            <div className="col-lg-4 col-md-6">
              <h6 className="fw-bold text-white mb-2 text-uppercase fs-7">CONTACT INFO</h6>
              <div className="mb-3" style={{ width: '40px', height: '2px', backgroundColor: '#0097B2' }}></div>
              
              <div className="d-flex flex-column gap-2 text-white-50 small mb-3">
                <div>Colombo, Sri Lanka</div>
                <div>Helpline: 011 234 5678 / 077 123 4567</div>
                <div>Email: <a href="mailto:seetumanager@gmail.com" className="text-info text-decoration-none" style={{ color: '#0097B2' }}>seetumanager@gmail.com</a></div>
              </div>
            </div>
          </div>

          {/* Centered Copyright Line & Scroll-To-Top Button */}
          <div className="pt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-white-50 small mb-0 mx-auto text-center">
              © Copyright 2026 SeettuManager. All Rights Reserved.
            </p>
            <button 
              onClick={scrollToTop} 
              className="btn btn-info btn-sm rounded-2 p-2 ms-auto text-white shadow-sm"
              style={{ backgroundColor: '#0097B2', borderColor: '#0097B2', width: '36px', height: '36px' }}
              title="Back to Top"
            >
              ▲
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
