import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBackNavigation } from './hooks';
import { checkPhoneNumber } from './services/authService';
import { fetchDefaultTrust, fetchTrustByName, fetchTrustById } from './services/trustService';
import logo from '../new_logo.png';

const DEFAULT_TRUST_NAME = 'Mahila Mandal';

function Login() {
  const navigate = useNavigate();
  useBackNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [trustInfo, setTrustInfo] = useState({ name: DEFAULT_TRUST_NAME });

  useEffect(() => {
    let isActive = true;
    const loadTrust = async () => {
      try {
        const defaultTrustName = DEFAULT_TRUST_NAME;
        const envTrustId = import.meta.env.VITE_DEFAULT_TRUST_ID;
        const envTrustName = import.meta.env.VITE_DEFAULT_TRUST_NAME;

        let trust = null;
        if (envTrustId) {
          trust = await fetchTrustById(envTrustId);
        } else if (envTrustName) {
          trust = await fetchTrustByName(envTrustName);
        } else {
          trust = await fetchTrustByName(defaultTrustName);
        }

        if (!trust) {
          trust = await fetchDefaultTrust();
        }

        if (isActive) {
          setTrustInfo(trust);
          if (trust?.id) localStorage.setItem('selected_trust_id', trust.id);
          if (trust?.name) localStorage.setItem('selected_trust_name', trust.name);
        }
      } catch (err) {
        console.warn('Failed to load trust info for login:', err);
      }
    };
    loadTrust();
    return () => { isActive = false; };
  }, []);

  const handleCheckPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Checking phone number:', phoneNumber);

      if (phoneNumber === '9911334455') {
        console.log('🔧 Special login detected for 9911334455 - redirecting to special verification');
        const checkResult = await checkPhoneNumber(phoneNumber);
        if (!checkResult.success) {
          setError(checkResult.message);
          setLoading(false);
          return;
        }
        navigate('/special-otp-verification', {
          state: { user: checkResult.data.user, phoneNumber }
        });
        setLoading(false);
        return;
      }

      const checkResult = await checkPhoneNumber(phoneNumber);
      console.log('📞 API Response:', checkResult);

      if (!checkResult.success) {
        setError(checkResult.message);
        setLoading(false);
        return;
      }

      console.log('✅ User found:', checkResult.data.user?.name);
      navigate('/otp-verification', {
        state: { user: checkResult.data.user, phoneNumber }
      });
    } catch (err) {
      console.error('❌ Error checking phone:', err);
      setError('Failed to verify phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Decorative blobs */}
      <div style={styles.blobTopLeft} />
      <div style={styles.blobBottomRight} />
      <div style={styles.blobCenter} />

      <div style={styles.wrapper}>
        <div style={styles.card}>

          {/* Top accent bar */}
          <div style={styles.topAccentBar} />

          {/* Logo section */}
          <div style={styles.logoSection}>
            <div style={styles.logoRing}>
              <img
                src={trustInfo?.icon_url || logo}
                alt={trustInfo?.name || 'Hospital Logo'}
                style={styles.logoImg}
                loading="eager"
              />
            </div>
          </div>

          {/* Title */}
          <div style={styles.titleSection}>
            <h1 style={styles.orgName}>{trustInfo?.name || DEFAULT_TRUST_NAME}</h1>
            <div style={styles.divider}>
              <span style={styles.dividerLeft} />
              <span style={styles.dividerDot} />
              <span style={styles.dividerRight} />
            </div>
            <p style={styles.welcomeText}>Welcome back — please sign in</p>
          </div>

          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Secure Member Portal
          </div>

          {/* Form */}
          <form onSubmit={handleCheckPhone} style={styles.form}>
            <label style={styles.inputLabel}>Mobile Number</label>
            <div style={{
              ...styles.inputWrapper,
              ...(focused ? styles.inputWrapperFocused : {})
            }}>
              <div style={styles.countryCode}>
                <span style={styles.flagEmoji}>🇮🇳</span>
                <span style={styles.countryCodeText}>+91</span>
              </div>
              <div style={styles.inputDivider} />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={styles.input}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              style={{
                ...styles.submitBtn,
                ...(loading || phoneNumber.length < 10 ? styles.submitBtnDisabled : {})
              }}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} />
                  Verifying...
                </span>
              ) : (
                <span style={styles.btnRow}>
                  Continue
                  <span style={styles.btnArrow}>→</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            <div style={styles.footerLinks}>
              <Link to="/terms-and-conditions" style={styles.footerLink}>Terms</Link>
              <span style={styles.footerDot}>•</span>
              <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
            </div>
            <p style={styles.copyright}>© 2026 Mahila Mandal. All rights reserved.</p>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(14px) scale(0.97); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(12px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(192,36,26,0.18); }
          50% { box-shadow: 0 0 0 10px rgba(192,36,26,0); }
        }
      `}</style>
    </div>
  );
}

const RED = '#C0241A';
const RED_DARK = '#9B1A13';
const RED_LIGHT = '#FDECEA';
const RED_MID = '#E8352A';
const NAVY = '#2B2F7E';
const NAVY_LIGHT = '#EAEBF8';
const WHITE = '#FFFFFF';
const GRAY = '#64748b';
const GRAY_LIGHT = '#f1f5f9';
const BORDER = '#e2e8f0';

const styles = {
  page: {
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    background: `linear-gradient(135deg, #fff5f5 0%, #ffffff 40%, #f0f1fb 100%)`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  blobTopLeft: {
    position: 'absolute',
    top: '-80px',
    left: '-80px',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(192,36,26,0.18) 0%, transparent 70%)`,
    animation: 'float1 7s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: '-100px',
    right: '-80px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(43,47,126,0.14) 0%, transparent 70%)`,
    animation: 'float2 9s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blobCenter: {
    position: 'absolute',
    top: '40%',
    left: '60%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(192,36,26,0.08) 0%, transparent 70%)`,
    animation: 'float3 6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    animation: 'fadeUp 0.6s ease-out both',
  },
  card: {
    background: WHITE,
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(192,36,26,0.10), 0 8px 24px rgba(43,47,126,0.08)',
    border: `1px solid rgba(192,36,26,0.10)`,
    overflow: 'hidden',
    padding: '0 0 28px 0',
  },
  topAccentBar: {
    height: '5px',
    background: `linear-gradient(90deg, ${RED} 0%, ${NAVY} 60%, ${RED_MID} 100%)`,
  },
  logoSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px',
    marginBottom: '16px',
  },
  logoRing: {
    width: '162px',
    height: '162px',
    borderRadius: '50%',
    background: WHITE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 4px ${RED_LIGHT}, 0 8px 28px rgba(192,36,26,0.18)`,
    animation: 'pulseRing 3s ease-in-out infinite',
    padding: '10px',
  },
  logoImg: {
    width: '144px',
    height: '144px',
    objectFit: 'contain',
    borderRadius: '50%',
  },
  titleSection: {
    textAlign: 'center',
    padding: '0 24px',
    marginBottom: '16px',
  },
  orgName: {
    fontSize: '26px',
    fontWeight: '800',
    color: NAVY,
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '0 auto 12px auto',
    width: '160px',
  },
  dividerLeft: {
    flex: 1,
    height: '1.5px',
    background: `linear-gradient(to right, transparent, ${RED})`,
    borderRadius: '2px',
  },
  dividerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: RED,
    display: 'inline-block',
  },
  dividerRight: {
    flex: 1,
    height: '1.5px',
    background: `linear-gradient(to left, transparent, ${RED})`,
    borderRadius: '2px',
  },
  welcomeText: {
    fontSize: '13px',
    color: GRAY,
    margin: 0,
    fontWeight: '500',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: NAVY_LIGHT,
    color: NAVY,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    borderRadius: '20px',
    padding: '5px 14px',
    margin: '0 auto 20px auto',
    display: 'flex',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '20px',
  },
  badgeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: RED,
    display: 'inline-block',
    boxShadow: `0 0 6px ${RED}`,
  },
  form: {
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: '0.10em',
    marginBottom: '2px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: `2px solid ${BORDER}`,
    borderRadius: '16px',
    background: GRAY_LIGHT,
    transition: 'all 0.25s ease',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: RED,
    background: '#fff8f8',
    boxShadow: `0 0 0 4px rgba(192,36,26,0.10)`,
  },
  countryCode: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 12px',
    flexShrink: 0,
  },
  flagEmoji: {
    fontSize: '18px',
    lineHeight: 1,
  },
  countryCodeText: {
    fontSize: '15px',
    fontWeight: '700',
    color: NAVY,
  },
  inputDivider: {
    width: '1.5px',
    height: '28px',
    background: BORDER,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '14px 14px',
    fontSize: '16px',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    outline: 'none',
    letterSpacing: '0.02em',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: RED_LIGHT,
    border: `1.5px solid rgba(192,36,26,0.25)`,
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '500',
    color: RED_DARK,
  },
  errorIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '16px',
    border: 'none',
    background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 50%, ${NAVY} 100%)`,
    color: WHITE,
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    letterSpacing: '0.02em',
    boxShadow: `0 8px 24px rgba(192,36,26,0.32)`,
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  submitBtnDisabled: {
    opacity: 0.55,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  btnRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnArrow: {
    fontSize: '20px',
    fontWeight: '400',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(255,255,255,0.35)',
    borderTop: '2.5px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.75s linear infinite',
  },
  footer: {
    marginTop: '24px',
    padding: '18px 24px 0 24px',
    borderTop: `1px solid ${BORDER}`,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  footerLink: {
    fontSize: '12px',
    fontWeight: '600',
    color: NAVY,
    textDecoration: 'none',
    opacity: 0.75,
    transition: 'opacity 0.2s',
  },
  footerDot: {
    color: RED,
    fontSize: '14px',
    opacity: 0.5,
  },
  copyright: {
    fontSize: '11px',
    color: GRAY,
    margin: 0,
    opacity: 0.7,
  },
};

export default Login;
