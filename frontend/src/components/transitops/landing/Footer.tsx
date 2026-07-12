"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useInView } from "@/hooks/useInView";
import "./Footer.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [footerRef, inView] = useInView({ threshold: 0.1 });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const targetId = href.replace("#", "");
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(element);
        } else {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      e.preventDefault();
      router.push(`/?scrollTo=${targetId}`);
    }
  };

  return (
    <footer ref={footerRef as any} className={`ft-footer ${inView ? "is-visible" : ""}`}>
      <h2 className="ft-headline ft-reveal" style={{ "--delay": "0ms" } as React.CSSProperties}>
        Built For Modern<br />
        <span className="ft-gradient">Transport Teams.</span>
      </h2>

      <nav className="ft-nav ft-reveal" style={{ "--delay": "150ms" } as React.CSSProperties}>
        {NAV_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onClick={(e) => handleLinkClick(e, l.href)}
            className="ft-nav-link"
          >
            {l.label}
          </a>
        ))}
        <Link href="/login" className="ft-nav-link ft-nav-link--cta">Get Started</Link>
      </nav>

      <div className="ft-bottom-row ft-reveal" style={{ "--delay": "300ms" } as React.CSSProperties}>
        <a href="#" className="ft-legal-link">Terms & Conditions</a>
        <a href="#" className="ft-legal-link">Privacy Policy</a>

        <div className="ft-socials">
          <a href="#" className="ft-social" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
          <a href="#" className="ft-social" aria-label="Twitter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="ft-social" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>

      <div className="ft-watermark ft-watermark-reveal" style={{ "--delay": "450ms" } as React.CSSProperties} aria-hidden="true">
        SHIFT
      </div>

      <p className="ft-copy ft-reveal" style={{ "--delay": "550ms" } as React.CSSProperties}>
        © {new Date().getFullYear()} Shift. All rights reserved.
      </p>
    </footer>
  );
}
