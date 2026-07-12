"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import "./LandingNavbar.css";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuthStore();

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

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar-wrapper ${hidden ? "navbar-wrapper--hidden" : ""}`}>
      <div className="navbar">
        <Link href="/" className="navbar-logo" style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/shift-logo.png" alt="Shift" style={{ height: "30px", objectFit: "contain" }} />
        </Link>

        <ul className="navbar-links">
          {LINKS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="navbar-link"
              >
                <span className="navbar-link-inner">
                  <span className="navbar-link-top">{item.label}</span>
                  <span className="navbar-link-bottom">{item.label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        {token ? (
          <Link href="/dashboard" className="navbar-cta-link">
            <button className="navbar-cta">
              <span className="navbar-cta-arrow-enter">
                <ArrowRight className="navbar-cta-icon" />
              </span>
              <span className="navbar-cta-arrow-wrap">
                <span className="navbar-cta-arrow-exit">
                  <ArrowRight className="navbar-cta-icon" />
                </span>
                Dashboard
              </span>
            </button>
          </Link>
        ) : (
          <Link href="/login" className="navbar-cta-link">
            <button className="navbar-cta">
              <span className="navbar-cta-arrow-enter">
                <ArrowRight className="navbar-cta-icon" />
              </span>
              <span className="navbar-cta-arrow-wrap">
                <span className="navbar-cta-arrow-exit">
                  <ArrowRight className="navbar-cta-icon" />
                </span>
                Get Started
              </span>
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
