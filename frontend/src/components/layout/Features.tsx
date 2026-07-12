import React from 'react';
import feat1 from '../../assets/feat1.png';
import feat2 from '../../assets/feat2.png';
import feat3 from '../../assets/feat3.png';
import feat4 from '../../assets/feat4.png';
import { useInView } from '../../hooks/useInView';

const TITLE_LINE1_STATIC = ['One', 'Platform.'];
const TITLE_LINE1_ORANGE: string[] = [];
const TITLE_LINE2 = ['Every', 'Fleet'];
const TITLE_LINE2_ORANGE = ['Operation.'];

interface CardData {
  src: string;
  alt: string;
  title: string;
  desc: string;
}

const CARDS: CardData[] = [
  { 
    src: feat1, 
    alt: 'Fleet Management',   
    title: 'Fleet Management',   
    desc: 'Centralize vehicle registration, monitor availability, track status, and manage your entire fleet from one intelligent dashboard.' 
  },
  { 
    src: feat2, 
    alt: 'Smart Trip Dispatch', 
    title: 'Smart Trip Dispatch', 
    desc: 'Create and assign trips with automated validation for vehicles, drivers, and cargo capacity to ensure smooth operations.' 
  },
  { 
    src: feat3, 
    alt: 'Driver Management',       
    title: 'Driver Management',       
    desc: 'Manage driver profiles, monitor license validity, track safety scores, and ensure every trip is assigned to eligible personnel.' 
  },
  { 
    src: feat4, 
    alt: 'Maintenance & Analytics',     
    title: 'Maintenance & Analytics',     
    desc: 'Schedule maintenance, monitor fuel and operational costs, and gain real-time insights into fleet performance and efficiency.' 
  },
];

// Word delay: starts at 100ms, +60ms per word
const wordDelay = (i: number) => `${100 + i * 60}ms`;
// After all title words: 100 + 8*60 = 580ms
const SUBTITLE_DELAY = '600ms';

interface FeatureCardProps {
  card: CardData;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ card, index }) => {
  const [cardRef, inView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={cardRef as any}
      className={`feature-card reveal-card${inView ? ' is-visible' : ''}`}
      style={{ '--delay': `${index * 100}ms` } as React.CSSProperties}
    >
      <div className="feature-img-box">
        <img src={card.src} alt={card.alt} className="feature-img" />
      </div>
      <div className="feature-info">
        <h3 className="feature-card-title">{card.title}</h3>
        <p className="feature-card-desc">{card.desc}</p>
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  const [sectionRef, inView] = useInView({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef as any}
      id="features"
      className={`features-section${inView ? ' is-visible' : ''}`}
    >
      <div className="features-header">
        {/* Badge */}
        <span className="features-badge reveal-text" style={{ '--delay': '0ms' } as React.CSSProperties}>
          Core Features
        </span>

        {/* Title — word-by-word progressive blur reveal, two explicit lines */}
        <h2 className="features-title">
          <span className="features-title-line">
            {TITLE_LINE1_STATIC.map((word, i) => (
              <span
                key={`static-${i}`}
                className="reveal-text"
                style={{ '--delay': wordDelay(i) } as React.CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
            <em>
              {TITLE_LINE1_ORANGE.map((word, i) => (
                <span
                  key={`orange-${i}`}
                  className="reveal-text"
                  style={{ '--delay': wordDelay(TITLE_LINE1_STATIC.length + i) } as React.CSSProperties}
                >
                  {word}{' '}
                </span>
              ))}
            </em>
          </span>
          <span className="features-title-line">
            {TITLE_LINE2.map((word, i) => (
              <span
                key={`line2-${i}`}
                className="reveal-text"
                style={{
                  '--delay': wordDelay(
                    TITLE_LINE1_STATIC.length + TITLE_LINE1_ORANGE.length + i
                  )
                } as React.CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
            <em>
              {TITLE_LINE2_ORANGE.map((word, i) => (
                <span
                  key={`orange-line2-${i}`}
                  className="reveal-text"
                  style={{
                    '--delay': wordDelay(
                      TITLE_LINE1_STATIC.length + TITLE_LINE1_ORANGE.length + TITLE_LINE2.length + i
                    )
                  } as React.CSSProperties}
                >
                  {word}{' '}
                </span>
              ))}
            </em>
          </span>
        </h2>

        {/* Subtitle */}
        <p className="features-subtitle reveal-text" style={{ '--delay': SUBTITLE_DELAY } as React.CSSProperties}>
          Replace spreadsheets with a centralized system for vehicle management, driver assignments, dispatching, maintenance, and reporting.
        </p>
      </div>

      {/* Cards — slide up individually as they enter the screen */}
      <div className="features-grid">
        {CARDS.map((card, i) => (
          <FeatureCard key={card.title} card={card} index={i} />
        ))}
      </div>
    </section>
  );
};
