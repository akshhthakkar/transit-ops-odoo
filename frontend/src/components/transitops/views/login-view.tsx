"use client";

import * as React from "react";
import { useAuthStore } from "@/store/auth";
import "./login.css";

export function LoginView() {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch {
      // error is set in the store
    }
  };

  return (
    <>
      <div className="auth-page-container">
        {/* Full-height vertical grid lines */}
        <div className="grid-v-line grid-v-line-left" />
        <div className="grid-v-line grid-v-line-right" />

        <div className="auth-center-column">
          {/* Row 1: Logo */}
          <div className="auth-row" style={{ padding: "16px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="grid-h-line" style={{ top: 0 }} />
            <div className="grid-plus grid-plus-tl">+</div>
            <div className="grid-plus grid-plus-tr">+</div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <img src="/assets/shift-logo.png" alt="Shift" style={{ height: "45px", objectFit: "contain" }} />
            </div>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 2: Title Header */}
          <div className="auth-row" style={{ padding: "24px 40px", textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>Sign in</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748B" }}>
              Enter your credentials to access the dashboard
            </p>
            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 3: Credentials Form */}
          <div className="auth-row" style={{ padding: "36px 40px" }}>
            {/* Error message */}
            {error && (
              <div className="animate-shake" style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#EF4444",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}>
                <span style={{ marginTop: "1.5px" }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} id="auth-form">
              <div style={{ marginBottom: "18px" }}>
                <label className="auth-label">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="fleet@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="auth-label">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                id="btn-auth-submit"
                type="submit"
                className="auth-button-submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 4: Demo Credentials */}
          <div className="auth-row" style={{ padding: "24px 40px" }}>
            <div style={{
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
              padding: "12px",
              fontSize: "12px",
              color: "#64748B",
            }}>
              <p style={{ margin: "0 0 6px 0", fontWeight: 600, color: "#0F172A" }}>Demo Credentials</p>
              <p style={{ margin: "2px 0" }}>fleet@transitops.com / password123</p>
              <p style={{ margin: "2px 0" }}>safety@transitops.com / password123</p>
              <p style={{ margin: "2px 0" }}>finance@transitops.com / password123</p>
            </div>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 5: Footer */}
          <div className="auth-row" style={{ padding: "24px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="auth-footnote">
              By logging in, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
            </div>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>
        </div>
      </div>
    </>
  );
}
