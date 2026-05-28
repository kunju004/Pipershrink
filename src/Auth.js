import React, { useState, useEffect, useRef } from 'react';

/* ─── Simulated email OTP backend ────────────────────────────────────────── */
// In production, replace sendOTP / verifyOTP with real API calls.
const otpStore = {};

function sendOTP(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  console.log(`[PiperShrink] OTP for ${email}: ${code}`); // dev only
  return code; // remove in production
}

function verifyOTP(email, input) {
  const entry = otpStore[email];
  if (!entry) return false;
  if (Date.now() > entry.expires) return false;
  return entry.code === input.trim();
}

/* ─── Tiny shared styles ─────────────────────────────────────────────────── */
const C = {
  accent: '#c8f53b',
  accent2: '#3bf5d4',
  bg: '#0a0a0a',
  bg1: '#111',
  bg2: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  text: '#f0f0f0',
  text2: '#aaa',
  text3: '#555',
  red: '#f53b6e',
  mono: "'DM Mono', monospace",
  display: "'Syne', sans-serif",
  radius: 14,
};

const inputStyle = {
  width: '100%',
  background: C.bg2,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '13px 16px',
  color: C.text,
  fontFamily: C.mono,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const btnPrimary = {
  width: '100%',
  padding: '13px 0',
  background: C.accent,
  color: '#0a0a0a',
  fontFamily: C.display,
  fontWeight: 800,
  fontSize: 15,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  letterSpacing: '-0.3px',
  transition: 'opacity 0.15s, transform 0.15s',
};

const btnGhost = {
  background: 'none',
  border: 'none',
  color: C.accent,
  fontFamily: C.mono,
  fontSize: 13,
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
  textUnderlineOffset: 3,
};

/* ─── OTP input row ──────────────────────────────────────────────────────── */
function OTPInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.split('');

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      const next = digits.slice();
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); refs.current[i - 1]?.focus(); }
    }
  }

  function handleChange(i, e) {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[i] = val;
    onChange(next.join(''));
    if (val && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44, height: 52,
            textAlign: 'center',
            background: C.bg2,
            border: `1px solid ${digits[i] ? C.accent : C.border}`,
            borderRadius: 10,
            color: C.text,
            fontFamily: C.mono,
            fontSize: 22,
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Countdown timer ───────────────────────────────────────────────────── */
function Countdown({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return <span style={{ color: left < 30 ? C.red : C.text3, fontFamily: C.mono, fontSize: 12 }}>{m}:{s}</span>;
}

/* ─── Card wrapper ───────────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundImage: `
        radial-gradient(ellipse 60% 40% at 50% -10%, rgba(200,245,59,0.12) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 80% 80%, rgba(59,245,212,0.07) 0%, transparent 70%)
      `,
    }}>
      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px', color: C.text, fontFamily: C.display }}>PiperShrink</div>
          <div style={{ fontSize: 10, color: C.text3, fontFamily: C.mono }}>File Compressor</div>
        </div>
      </div>

      <div style={{
        width: '100%', maxWidth: 420,
        background: C.bg1,
        border: `1px solid ${C.border}`,
        borderRadius: C.radius + 4,
        padding: '2.5rem 2rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {children}
      </div>
    </div>
  );
}

function Heading({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontFamily: C.display, fontSize: 26, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.8px' }}>{title}</h1>
      {subtitle && <p style={{ fontFamily: C.mono, fontSize: 13, color: C.text2, margin: '8px 0 0', lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

function Alert({ type, msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, marginBottom: 16,
      background: type === 'error' ? 'rgba(245,59,110,0.1)' : 'rgba(200,245,59,0.1)',
      border: `1px solid ${type === 'error' ? 'rgba(245,59,110,0.3)' : 'rgba(200,245,59,0.3)'}`,
      color: type === 'error' ? C.red : C.accent,
      fontFamily: C.mono, fontSize: 12, lineHeight: 1.5,
    }}>{msg}</div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREENS
══════════════════════════════════════════════════════════════════════════ */

/* ── Login ── */
function LoginScreen({ onSwitch, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // email | otp
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  async function handleSendOTP(e) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800)); // simulate network
    sendOTP(email);
    setInfo(`A 6-digit code was sent to ${email}`);
    setStep('otp'); setExpired(false); setOtp('');
    setLoading(false);
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 600));
    if (verifyOTP(email, otp)) {
      onLoggedIn(email);
    } else {
      setError('Incorrect or expired code. Try again.');
    }
    setLoading(false);
  }

  function resend() {
    sendOTP(email);
    setOtp(''); setExpired(false); setError('');
    setInfo(`New code sent to ${email}`);
  }

  return (
    <Card>
      <Heading title="Welcome back" subtitle={step === 'email' ? 'Sign in with your email' : `Check your inbox`} />
      <Alert type="error" msg={error} />
      <Alert type="success" msg={info} />

      {step === 'email' ? (
        <form onSubmit={handleSendOTP}>
          <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>Email address</label>
          <input
            style={inputStyle} type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required autoFocus
          />
          <div style={{ height: 16 }} />
          <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Sending code…' : 'Send OTP →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, marginBottom: 16 }}>
              Enter the 6-digit code sent to<br />
              <span style={{ color: C.accent }}>{email}</span>
            </div>
            <OTPInput value={otp} onChange={setOtp} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {expired ? (
                <button type="button" style={btnGhost} onClick={resend}>Resend code</button>
              ) : (
                <>
                  <span style={{ fontFamily: C.mono, fontSize: 12, color: C.text3 }}>Expires in</span>
                  <Countdown seconds={600} onExpire={() => setExpired(true)} />
                  <span style={{ color: C.text3, fontSize: 12 }}>·</span>
                  <button type="button" style={btnGhost} onClick={resend}>Resend</button>
                </>
              )}
            </div>
          </div>
          <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying…' : 'Verify & Sign in →'}
          </button>
          <button type="button" style={{ ...btnGhost, display: 'block', margin: '12px auto 0', textAlign: 'center', color: C.text3, textDecoration: 'none' }} onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo(''); }}>
            ← Change email
          </button>
        </form>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', fontFamily: C.mono, fontSize: 12, color: C.text3 }}>
        No account?{' '}
        <button style={btnGhost} onClick={() => onSwitch('signup')}>Create one</button>
        {' · '}
        <button style={btnGhost} onClick={() => onSwitch('forgot')}>Forgot password?</button>
      </div>
    </Card>
  );
}

/* ── Signup ── */
function SignupScreen({ onSwitch, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('form'); // form | otp
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    sendOTP(email);
    setInfo(`Verification code sent to ${email}`);
    setStep('otp'); setExpired(false); setOtp('');
    setLoading(false);
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 600));
    if (verifyOTP(email, otp)) {
      onLoggedIn(email);
    } else {
      setError('Incorrect or expired code. Try again.');
    }
    setLoading(false);
  }

  function resend() { sendOTP(email); setOtp(''); setExpired(false); setError(''); setInfo(`New code sent to ${email}`); }

  return (
    <Card>
      <Heading title="Create account" subtitle={step === 'form' ? 'Start compressing for free' : 'Verify your email'} />
      <Alert type="error" msg={error} />
      <Alert type="success" msg={info} />

      {step === 'form' ? (
        <form onSubmit={handleRegister}>
          <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>Full name</label>
          <input style={inputStyle} type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          <div style={{ height: 12 }} />
          <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>Email address</label>
          <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <div style={{ height: 16 }} />
          <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Sending code…' : 'Continue →'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, marginBottom: 16 }}>
              Enter the 6-digit code sent to<br />
              <span style={{ color: C.accent }}>{email}</span>
            </div>
            <OTPInput value={otp} onChange={setOtp} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {expired ? (
                <button type="button" style={btnGhost} onClick={resend}>Resend code</button>
              ) : (
                <>
                  <span style={{ fontFamily: C.mono, fontSize: 12, color: C.text3 }}>Expires in</span>
                  <Countdown seconds={600} onExpire={() => setExpired(true)} />
                  <span style={{ color: C.text3, fontSize: 12 }}>·</span>
                  <button type="button" style={btnGhost} onClick={resend}>Resend</button>
                </>
              )}
            </div>
          </div>
          <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading || otp.length < 6}>
            {loading ? 'Verifying…' : 'Create account →'}
          </button>
          <button type="button" style={{ ...btnGhost, display: 'block', margin: '12px auto 0', textAlign: 'center', color: C.text3, textDecoration: 'none' }} onClick={() => { setStep('form'); setOtp(''); setError(''); setInfo(''); }}>
            ← Change details
          </button>
        </form>
      )}

      <div style={{ marginTop: 24, textAlign: 'center', fontFamily: C.mono, fontSize: 12, color: C.text3 }}>
        Already have an account?{' '}
        <button style={btnGhost} onClick={() => onSwitch('login')}>Sign in</button>
      </div>
    </Card>
  );
}

/* ── Forgot Password ── */
function ForgotScreen({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // email | otp | reset | done
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    sendOTP(email);
    setInfo(`Reset code sent to ${email}`);
    setStep('otp'); setExpired(false); setOtp('');
    setLoading(false);
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 600));
    if (verifyOTP(email, otp)) {
      setStep('reset'); setError(''); setInfo('');
    } else {
      setError('Incorrect or expired code.');
    }
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    // In production: call API to update password
    setStep('done');
    setLoading(false);
  }

  function resend() { sendOTP(email); setOtp(''); setExpired(false); setError(''); setInfo(`New code sent to ${email}`); }

  return (
    <Card>
      {step === 'done' ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: C.display, fontWeight: 800, color: C.text, marginBottom: 8 }}>Password reset!</h2>
          <p style={{ fontFamily: C.mono, fontSize: 13, color: C.text2, marginBottom: 24 }}>Your password has been updated successfully.</p>
          <button style={btnPrimary} onClick={() => onSwitch('login')}>Back to sign in →</button>
        </div>
      ) : (
        <>
          <Heading
            title="Reset password"
            subtitle={
              step === 'email' ? 'Enter your email to receive a reset code' :
              step === 'otp' ? 'Enter the code from your inbox' :
              'Choose a new password'
            }
          />
          <Alert type="error" msg={error} />
          <Alert type="success" msg={info} />

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
            {['email', 'otp', 'reset'].map((s, i) => (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 3,
                background: ['email', 'otp', 'reset'].indexOf(step) >= i ? C.accent : C.border,
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {step === 'email' && (
            <form onSubmit={handleSend}>
              <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>Email address</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              <div style={{ height: 16 }} />
              <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset code →'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, marginBottom: 16 }}>
                  Code sent to <span style={{ color: C.accent }}>{email}</span>
                </div>
                <OTPInput value={otp} onChange={setOtp} />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  {expired ? (
                    <button type="button" style={btnGhost} onClick={resend}>Resend code</button>
                  ) : (
                    <>
                      <span style={{ fontFamily: C.mono, fontSize: 12, color: C.text3 }}>Expires in</span>
                      <Countdown seconds={600} onExpire={() => setExpired(true)} />
                      <span style={{ color: C.text3, fontSize: 12 }}>·</span>
                      <button type="button" style={btnGhost} onClick={resend}>Resend</button>
                    </>
                  )}
                </div>
              </div>
              <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying…' : 'Verify code →'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset}>
              <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>New password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} required autoFocus />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 14 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ height: 12 }} />
              <label style={{ fontFamily: C.mono, fontSize: 12, color: C.text2, display: 'block', marginBottom: 6 }}>Confirm password</label>
              <input style={inputStyle} type={showPass ? 'text' : 'password'} placeholder="Repeat password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />

              {/* Password strength */}
              {newPass.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(i => {
                      const score = [newPass.length >= 8, /[A-Z]/.test(newPass), /[0-9]/.test(newPass), /[^a-zA-Z0-9]/.test(newPass)].filter(Boolean).length;
                      return <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= score ? (score < 2 ? C.red : score < 3 ? '#f5a63b' : C.accent) : C.border, transition: 'background 0.3s' }} />;
                    })}
                  </div>
                  <div style={{ fontFamily: C.mono, fontSize: 11, color: C.text3, marginTop: 4 }}>
                    Tip: add uppercase, numbers, symbols for a stronger password
                  </div>
                </div>
              )}

              <div style={{ height: 16 }} />
              <button style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password →'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontFamily: C.mono, fontSize: 12, color: C.text3 }}>
            <button style={btnGhost} onClick={() => onSwitch('login')}>← Back to sign in</button>
          </div>
        </>
      )}
    </Card>
  );
}

/* ─── Main Auth export ───────────────────────────────────────────────────── */
export default function Auth({ onLoggedIn }) {
  const [screen, setScreen] = useState('login');

  return (
    <>
      {screen === 'login'  && <LoginScreen  onSwitch={setScreen} onLoggedIn={onLoggedIn} />}
      {screen === 'signup' && <SignupScreen onSwitch={setScreen} onLoggedIn={onLoggedIn} />}
      {screen === 'forgot' && <ForgotScreen onSwitch={setScreen} />}
    </>
  );
}
