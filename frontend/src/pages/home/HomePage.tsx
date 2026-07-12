import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LandingNavbar } from '../../components/layout/LandingNavbar';
import dbHero from '../../assets/DashBoard1st.png';
import { Features } from '../../components/layout/Features';
import HowItWorks from '../../components/layout/HowItWorks';
import FAQ from '../../components/layout/FAQ';
import { Footer } from '../../components/layout/Footer';
import { CreditCard } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToId = searchParams.get('scrollTo');
    if (scrollToId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(element);
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);


  useEffect(() => {
    const handleScroll = () => {
      if (!imageContainerRef.current) return;
      
      const scrollY = window.scrollY;
      const maxScroll = 500; // Animation completes over 500px of scrolling
      const progress = Math.min(scrollY / maxScroll, 1);
      
      // Smooth easing function for more fluid transition
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      // Interpolation values with easing:
      // At scroll 0: rotateX = 8deg, scale = 0.96, translateZ = -20px, translateY = -20px
      // At scroll 500: rotateX = 0deg, scale = 1.0, translateZ = 0px, translateY = 0px
      const rotateX = 8 * (1 - easedProgress);
      const scale = 0.96 + 0.04 * easedProgress;
      const translateZ = -20 * (1 - easedProgress);
      const translateY = -20 * (1 - easedProgress);
      
      imageContainerRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) translateY(${translateY}px) scale(${scale}) translateZ(${translateZ}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-container">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="hero-section">


        <div className="hero-content">
          {/* Trusted Badge */}
          <div className="slide-up" style={{ '--slide-delay': '0ms' } as React.CSSProperties}>
            <div className="trusted-badge">
              <span className="trusted-text">Built for Modern Transport Operations</span>
            </div>
          </div>

          {/* Heading — word-by-word left-to-right blur reveal */}
          <h1 className="hero-title">
            {['Run', 'Your', 'Entire', 'Fleet'].map((word, i) => (
              <span
                key={word}
                className="word-blur-reveal"
                style={{ '--word-delay': `${80 + i * 80}ms` } as React.CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
            <br />
            {['from', 'One', 'Dashboard'].map((word, i) => (
              <span
                key={word}
                className="highlight-text word-blur-reveal"
                style={{ '--word-delay': `${400 + i * 80}ms` } as React.CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle blur-reveal" style={{ '--blur-delay': '680ms' } as React.CSSProperties}>
            Manage vehicles, drivers, trips, maintenance, fuel expenses,<br />
            and operations—all from a single intelligent platform.
          </p>

          {/* CTA Group */}
          <div className="hero-cta-group">
            <div className="slide-up" style={{ '--slide-delay': '820ms' } as React.CSSProperties}>
              <button className="hero-cta-btn" onClick={() => navigate('/signup')}>
                Get Started For Free
              </button>
            </div>
            <div className="slide-up" style={{ '--slide-delay': '940ms' } as React.CSSProperties}>
              <span className="hero-subtext">
                <CreditCard size={14} style={{ color: '#FF540E', strokeWidth: 2 }} />
                No credit card required
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Showcase Image with X-Axis perspective rotation */}
        <div className="hero-image-wrapper">
          <div ref={imageContainerRef} className="hero-image-container">
            <img src={dbHero} alt="Dashboard Analytics Preview" className="hero-dashboard-img" />
          </div>
        </div>
      </section>

      {/* Unique Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default HomePage;
