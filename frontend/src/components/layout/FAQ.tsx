import React, { useState } from 'react';
import { useInView } from '../../hooks/useInView';
import './FAQ.css';

interface FAQItem {
  q: string;
  qWords?: string[];
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'What is Swift?',
    a: 'Swift is a smart transport operations platform that helps businesses manage vehicles, drivers, trip dispatch, maintenance, fuel expenses, and fleet performance from a single centralized dashboard.',
  },
  {
    q: 'How does trip dispatch work?',
    a: 'Create a trip by selecting a source, destination, available vehicle, and eligible driver. Swift automatically validates vehicle availability, driver eligibility, and cargo capacity before dispatching the trip.',
  },
  {
    q: 'Can I track vehicle maintenance?',
    a: 'Yes. Swift lets you schedule and manage maintenance records. Vehicles under maintenance are automatically marked as "In Shop" and cannot be assigned to new trips until maintenance is completed.',
  },
  {
    q: 'How does Swift improve fleet efficiency?',
    a: 'Swift provides real-time visibility into vehicle utilization, fuel consumption, operational costs, and trip performance, helping organizations reduce downtime and optimize fleet operations.',
  },
  {
    q: 'Does the system prevent scheduling conflicts?',
    a: 'Absolutely. A vehicle or driver already assigned to an active trip cannot be dispatched again. The platform also blocks retired vehicles, suspended drivers, and expired licenses from being assigned.',
  },
  {
    q: 'Can I monitor fuel and operational expenses?',
    a: 'Yes. Record fuel logs, maintenance costs, tolls, and other expenses for every vehicle. Swift automatically calculates operational costs and provides detailed reports for analysis.',
  },
  {
    q: 'Is Swift suitable for small and large fleets?',
    a: 'Yes. Whether you manage a handful of vehicles or an enterprise fleet, Swift scales to support your transport operations with centralized management and real-time insights.',
  },
  {
    q: 'Does Swift support role-based access?',
    a: 'Yes. Different roles such as Fleet Managers, Drivers, Safety Officers, and Financial Analysts can securely access features relevant to their responsibilities.',
  },
];

const HEADING_STATIC_WORDS = ['Frequently', 'asked'];
const HEADING_ITALIC_WORDS = ['questions'];
const wordDelay = (i: number) => `${80 + i * 70}ms`;
const SUBHEADING_DELAY = '240ms';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [sectionRef, inView] = useInView({ threshold: 0.15 });

  const toggle = (i: number) => {
    setOpenIndex(prev => prev === i ? null : i);
  };

  return (
    <section ref={sectionRef as any} className={`faq${inView ? ' is-visible' : ''}`} id="faq">
      <div className="faq__label-top">
        <span className="reveal-text" style={{ '--delay': '0ms' } as React.CSSProperties}>Everything explained</span>
      </div>
      
      <div className="faq__inner">
        <div className="faq__header">
          <h2 className="faq__title">
            {HEADING_STATIC_WORDS.map((word, i) => (
              <span key={word} className="reveal-text" style={{ '--delay': wordDelay(i) } as React.CSSProperties}>
                {word}{' '}
              </span>
            ))}
            <em className="faq__title-em">
              {HEADING_ITALIC_WORDS.map((word, i) => (
                <span
                  key={word}
                  className="reveal-text"
                  style={{ '--delay': wordDelay(HEADING_STATIC_WORDS.length + i) } as React.CSSProperties}
                >
                  {word}{' '}
                </span>
              ))}
            </em>
          </h2>
          <p className="faq__sub reveal-text" style={{ '--delay': SUBHEADING_DELAY } as React.CSSProperties}>
            Everything you need to know about Swift.<br />
            Can't find an answer? <a href="/contact">Talk to our team.</a>
          </p>
        </div>

        <div className="faq__list reveal-card" style={{ '--delay': '300ms' } as React.CSSProperties}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
              >
                <button
                  className="faq__question"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="faq__question-text">{item.q}</span>
                  <span className="faq__icon" aria-hidden="true">
                    {isOpen ? (
                      /* minus */
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M5.5 9h7" stroke="currentColor" strokeWidth="1.4"
                          strokeLinecap="round"/>
                      </svg>
                    ) : (
                      /* plus */
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="8.5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M9 5.5v7M5.5 9h7" stroke="currentColor" strokeWidth="1.4"
                          strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </button>

                <div className="faq__answer-wrap">
                  <div className="faq__answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
