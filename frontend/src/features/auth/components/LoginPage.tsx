import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks';
import shiftLogo from '../../../assets/shift-logo.png';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  const apiError = error as any;
  const loginErrorMessage =
    apiError?.response?.data?.message ||
    apiError?.message ||
    'Invalid credentials';

  return (
    <>
      <style>{`
        .auth-page-container {
          min-height: 100vh;
          background-color: #F9FAFB;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-x: hidden;
          position: relative;
          padding: 60px 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Vertical grid lines extending through the full screen height */
        .grid-v-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background-color: #E2E8F0;
          pointer-events: none;
        }
        .grid-v-line-left {
          left: calc(50% - 230px);
        }
        .grid-v-line-right {
          left: calc(50% + 230px);
        }

        .auth-center-column {
          width: 460px;
          position: relative;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .auth-row {
          width: 100%;
          position: relative;
          box-sizing: border-box;
        }

        /* Horizontal grid lines extending screen-wide */
        .grid-h-line {
          position: absolute;
          left: -100vw;
          right: -100vw;
          height: 1px;
          background-color: #E2E8F0;
          pointer-events: none;
        }

        /* Monospace intersection plus symbol style */
        .grid-plus {
          position: absolute;
          font-size: 13px;
          color: #94A3B8;
          background-color: #F9FAFB;
          width: 11px;
          height: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          line-height: 1;
          z-index: 20;
          pointer-events: none;
          user-select: none;
        }

        .grid-plus-tl { top: -6px; left: -5px; }
        .grid-plus-tr { top: -6px; right: -5px; }
        .grid-plus-bl { bottom: -6px; left: -5px; }
        .grid-plus-br { bottom: -6px; right: -5px; }

        /* Form styling */
        .auth-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .auth-input {
          width: 100%;
          border: 1px solid #D1D5DB;
          border-radius: 9999px;
          padding: 11px 20px;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auth-input:focus {
          border-color: #FF540E;
          box-shadow: 0 0 0 3px rgba(255, 84, 14, 0.15);
        }

        .auth-input::placeholder {
          color: #9CA3AF;
        }

        .auth-button-submit {
          width: 100%;
          background: #FF540E;
          color: #FFFFFF;
          border-radius: 9999px;
          border: none;
          padding: 12.5px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
        }

        .auth-button-submit:hover:not(:disabled) {
          background: #E04300;
        }

        .auth-button-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .auth-button-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footnote {
          font-size: 11.5px;
          color: #94A3B8;
          text-align: center;
          line-height: 1.5;
        }

        .auth-footnote a {
          color: #64748B;
          text-decoration: underline;
          transition: color 0.15s;
        }

        .auth-footnote a:hover {
          color: #0F172A;
        }
      `}</style>

      <div className="auth-page-container">
        {/* Full-height vertical grid lines */}
        <div className="grid-v-line grid-v-line-left" />
        <div className="grid-v-line grid-v-line-right" />

        <div className="auth-center-column">
          {/* Row 1: Logo */}
          <div className="auth-row" style={{ padding: '16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="grid-h-line" style={{ top: 0 }} />
            <div className="grid-plus grid-plus-tl">+</div>
            <div className="grid-plus grid-plus-tr">+</div>

             <div style={{ display: 'flex', alignItems: 'center' }}>
               <img src={shiftLogo} alt="Shift" style={{ height: '130px', objectFit: 'contain' }} />
             </div>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 2: Title Header */}
          <div className="auth-row" style={{ padding: '24px 40px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Log In</h2>
            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>

          {/* Row 3: Credentials Form */}
          <div className="auth-row" style={{ padding: '36px 40px' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span style={{ marginTop: '1.5px' }}>⚠️</span>
                <span>{loginErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} id="auth-form">
              <div style={{ marginBottom: '18px' }}>
                <label className="auth-label">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  {...register('email')}
                  autoComplete="email"
                />
                {errors.email && (
                  <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', marginLeft: '12px' }}>
                    ⚠️ {errors.email.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="auth-label">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  {...register('password')}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', marginLeft: '12px' }}>
                    ⚠️ {errors.password.message}
                  </p>
                )}
              </div>

              <button
                id="btn-auth-submit"
                type="submit"
                className="auth-button-submit"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <div className="grid-h-line" style={{ bottom: 0 }} />
            <div className="grid-plus grid-plus-bl">+</div>
            <div className="grid-plus grid-plus-br">+</div>
          </div>



          {/* Row 5: Footer & Credentials Demo */}
          <div className="auth-row" style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="auth-footnote">
              By logging in, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
            </div>

            <div className="auth-footnote" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              For testing (password: <code>password123</code>):
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#334155' }}>fleet@transitops.com</span>
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#334155' }}>driver@transitops.com</span>
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#334155' }}>safety@transitops.com</span>
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 6px', fontSize: '10px', color: '#334155' }}>finance@transitops.com</span>
              </div>
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
