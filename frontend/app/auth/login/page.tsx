"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Invalid email or password.");

            setSession(data.session_token, data.email);
            router.push("/");
        } catch (err: any) {
            console.error("Login error:", err);
            setStatus("error");
            setErrorMessage(err.message || "Invalid email or password.");
        }
    };

    return (
        <div className="ag-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
                .ag-wrapper {
                    --color-primary:        #3b5d50;
                    --color-primary-light:  #5a7d6d;
                    --color-primary-dark:   #2d4a40;
                    --color-secondary:      #f9bf29;
                    --color-secondary-dark: #f8b810;
                    --color-white:          #ffffff;
                    --color-error:          #dc3545;
                    --radius-10: 10px;
                    --radius-20: 20px;
                    --radius-30: 30px;
                    --font-body:    'Inter', sans-serif;
                    --font-display: 'Space Grotesk', sans-serif;

                    position: fixed;
                    inset: 0;
                    z-index: 9999; /* Cover navbar if any */
                    background-color: var(--color-primary);
                    font-family: var(--font-body);
                    color: var(--color-white);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: auto;
                }
                .ag-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }

                .ag-universe { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
                .ag-universe::before {
                    content: ""; position: absolute; inset: 0;
                    background:
                        radial-gradient(ellipse 120% 80% at 20% 50%, #2d4a40 0%, transparent 55%),
                        radial-gradient(ellipse 80% 100% at 80% 30%, #4a7060 0%, transparent 50%),
                        radial-gradient(ellipse 60% 60% at 60% 90%, #2a4538 0%, transparent 45%);
                    background-color: var(--color-primary);
                }
                .ag-universe::after {
                    content: ""; position: absolute; inset: -100px;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1.5px, transparent 1.5px);
                    background-size: 28px 28px;
                    animation: agDriftGrid 40s linear infinite;
                }
                @keyframes agDriftGrid { from { transform: translate(0, 0); } to { transform: translate(28px, 28px); } }

                .ag-orb { position: absolute; border-radius: 50%; filter: blur(60px); }
                .ag-orb-1 { width: 500px; height: 500px; top: -10%; left: -10%; background: rgba(59,93,80,0.5); animation: agMoveOrb1 22s ease-in-out infinite alternate; }
                .ag-orb-2 { width: 400px; height: 400px; bottom: -5%; right: -5%; background: rgba(249,191,41,0.18); animation: agMoveOrb2 18s ease-in-out infinite alternate-reverse; }
                .ag-orb-3 { width: 280px; height: 280px; top: 40%; right: 10%; background: rgba(59,93,80,0.25); animation: agMoveOrb3 26s linear infinite; }
                .ag-orb-4 { width: 180px; height: 180px; top: 50%; left: 40%; background: rgba(249,191,41,0.1); animation: agMoveOrb4 14s ease-in-out infinite alternate; }

                @keyframes agMoveOrb1 { from { transform: translate(0, 0) scale(0.97); } to { transform: translate(-40px, 40px) scale(1.05); } }
                @keyframes agMoveOrb2 { from { transform: translate(0, 0); } to { transform: translate(-50px, -50px); } }
                @keyframes agMoveOrb3 { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(-30px, 30px) rotate(180deg); } }
                @keyframes agMoveOrb4 { from { transform: translate(0, 0) scale(0.97); } to { transform: translate(40px, -40px) scale(1.05); } }

                #ag-layout-container {
                    position: relative; z-index: 10; display: grid; grid-template-columns: 55% 45%; max-width: 1280px; width: 100%; height: auto; min-height: 100vh; padding: 40px; gap: 32px; align-items: center; justify-content: center;
                }

                .ag-left-col { position: relative; opacity: 0; animation: agSlideLeft 0.9s cubic-bezier(0.16,1,0.3,1) forwards; }
                @keyframes agSlideLeft { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .ag-logo { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--color-white); letter-spacing: -0.5px; margin-bottom: 2rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.1s; }
                .ag-logo span { opacity: 0.4; }
                .ag-h1 { font-family: var(--font-display); font-size: clamp(2rem, 3vw, 3rem); font-weight: 700; color: var(--color-white); letter-spacing: -1px; line-height: 1.1; margin-bottom: 0.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.2s; }
                .ag-h1 .ag-highlight { color: var(--color-secondary); }
                .ag-subtext { font-family: var(--font-body); font-size: 0.9rem; color: rgba(255,255,255,0.45); max-width: 340px; line-height: 1.5; margin-bottom: 3rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.3s; }

                .ag-cards-cluster { position: relative; height: 280px; width: 100%; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.4s; }
                .ag-glass-card { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }

                .ag-card-1 { position: absolute; top: 0; left: 20px; width: 280px; padding: 20px 22px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-20); box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08); animation: agDriftCard1 8s ease-in-out infinite; }
                @keyframes agDriftCard1 { 0% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-14px) rotate(-0.5deg); } 75% { transform: translateY(8px) rotate(0.3deg); } 100% { transform: translateY(0) rotate(0); } }
                .ag-card-1 .ag-label { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.35); letter-spacing: 1.5px; margin-bottom: 4px; }
                .ag-card-1 .ag-title { font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--color-white); margin-bottom: 12px; }

                .ag-card-2 { position: absolute; top: 30px; right: 0; width: 190px; padding: 16px 18px; background: rgba(249,191,41,0.1); border: 1px solid rgba(249,191,41,0.3); border-radius: var(--radius-20); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 12px 40px rgba(249,191,41,0.12); animation: agDriftCard2 11s ease-in-out infinite; }
                @keyframes agDriftCard2 { 0% { transform: translateY(0) rotate(1.5deg); } 50% { transform: translateY(-18px) rotate(2.5deg); } 75% { transform: translateY(18px) rotate(0deg); } 100% { transform: translateY(0) rotate(1.5deg); } }
                .ag-card-2 .ag-top-label { display: flex; align-items: center; gap: 4px; font-size: 8px; text-transform: uppercase; color: var(--color-secondary); font-weight: 600; margin-bottom: 6px; }
                .ag-card-2 .ag-product { font-size: 13px; color: var(--color-white); font-weight: 500; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ag-card-2 .ag-pricing { display: flex; align-items: center; gap: 6px; }
                .ag-card-2 .ag-current { color: var(--color-white); font-weight: 700; font-size: 14px; }
                .ag-card-2 .ag-strikethrough { color: rgba(255,255,255,0.4); text-decoration: line-through; font-size: 11px; }
                .ag-card-2 .ag-badge { background: var(--color-secondary); color: #111; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 10px; }

                .ag-card-3 { position: absolute; bottom: 10px; left: 60px; padding: 9px 16px; border-radius: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; gap: 8px; animation: agDriftCard3 13s ease-in-out infinite alternate; }
                @keyframes agDriftCard3 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -12px); } 100% { transform: translate(-8px, 8px); } }
                .ag-pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-secondary); animation: agPulseDot 2s infinite; }
                @keyframes agPulseDot { 0% { box-shadow: 0 0 8px rgba(249,191,41,0.8); } 50% { box-shadow: 0 0 16px rgba(249,191,41,0.8); } 100% { box-shadow: 0 0 8px rgba(249,191,41,0.8); } }
                .ag-card-3 span { font-size: 11px; color: rgba(255,255,255,0.7); }
                .ag-card-3 .ag-highlight { color: var(--color-secondary); font-weight: 600; }

                .ag-trust-row { display: flex; gap: 16px; margin-top: 10px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.5s; }
                .ag-trust-item { font-size: 0.75rem; color: rgba(255,255,255,0.35); font-weight: 500; display: flex; align-items: center; gap: 4px; }
                .ag-trust-item span { color: var(--color-secondary); }

                .ag-right-col { opacity: 0; animation: agSlideRight 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.15s; display: flex; justify-content: flex-end; }
                @keyframes agSlideRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .ag-form-card { position: relative; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 44px 40px; max-width: 420px; width: 100%; backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,93,80,0.2), inset 0 1px 0 rgba(255,255,255,0.1); animation: agLevitate 9s ease-in-out infinite; }
                @keyframes agLevitate { 0% { transform: translateY(0); } 45% { transform: translateY(-8px); } 75% { transform: translateY(5px); } 100% { transform: translateY(0); } }
                .ag-form-card::before { content: ""; position: absolute; top: 0; left: 15%; right: 15%; height: 2px; background: linear-gradient(90deg, transparent, var(--color-secondary), transparent); }

                .ag-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: var(--color-secondary); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.3s; }
                .ag-eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--color-secondary); box-shadow: 0 0 8px rgba(249,191,41,0.8); }
                .ag-form-title { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-white); letter-spacing: -1px; margin-bottom: 4px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.35s; }
                .ag-form-sub { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.35s; }

                .ag-error-banner { display: none; background: rgba(220,53,69,0.12); border: 1px solid rgba(220,53,69,0.3); border-radius: var(--radius-10); color: #ff8080; font-size: 0.82rem; padding: 12px 16px; margin-bottom: 16px; }
                .ag-error-banner.ag-show { display: block; }
                .ag-form-group { position: relative; margin-bottom: 16px; opacity: 0; }
                #ag-fg-email { animation: agFadeUp 0.6s ease forwards 0.44s; }
                #ag-fg-password { animation: agFadeUp 0.6s ease forwards 0.49s; }

                .ag-form-input { width: 100%; height: 48px; border-radius: var(--radius-10); background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.1); color: var(--color-white); padding: 0 16px; font-family: var(--font-body); font-size: 0.9rem; outline: none; transition: all 0.2s ease; backdrop-filter: blur(8px); }
                .ag-form-input::placeholder { color: rgba(255,255,255,0.3); }
                .ag-form-input:focus { border-color: rgba(249,191,41,0.5); box-shadow: 0 0 0 3px rgba(249,191,41,0.12), 0 0 20px rgba(249,191,41,0.08); }
                
                .ag-forgot-link { position: absolute; top: -22px; right: 0; color: rgba(249,191,41,0.6); font-size: 0.78rem; text-decoration: none; transition: color 0.2s ease; }
                .ag-forgot-link:hover { color: var(--color-secondary); }

                .ag-password-toggle { position: absolute; top: 50%; right: 16px; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.25); cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.2s ease; }
                .ag-password-toggle:hover { color: var(--color-secondary); }

                .ag-btn { height: 50px; width: 100%; border-radius: var(--radius-30); font-family: var(--font-body); font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s ease; outline: none; }
                .ag-btn-primary { background: var(--color-primary); color: var(--color-white); border: 1.5px solid rgba(91,125,109,0.6); box-shadow: 0 4px 20px rgba(59,93,80,0.4); margin-top: 24px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.58s; }
                .ag-btn-primary:hover { background: var(--color-primary-light); transform: translateY(-2px); }
                .ag-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: translateY(0); }

                .ag-divider { display: flex; align-items: center; text-align: center; color: rgba(255,255,255,0.25); font-size: 0.85rem; margin: 24px 0; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.62s; }
                .ag-divider::before, .ag-divider::after { content: ""; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .ag-divider::before { margin-right: 12px; }
                .ag-divider::after { margin-left: 12px; }

                .ag-btn-secondary { background: rgba(249,191,41,0.1); color: var(--color-secondary); border: 1.5px solid rgba(249,191,41,0.3); font-weight: 600; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.66s; }
                .ag-btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 0 15px rgba(249,191,41,0.2); }

                .ag-register { text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.3); margin-top: 24px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.7s; }
                .ag-register a { color: rgba(249,191,41,0.8); text-decoration: none; transition: color 0.2s ease; }
                .ag-register a:hover { color: var(--color-secondary); }

                @keyframes agFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 900px) {
                    #ag-layout-container { grid-template-columns: 1fr; overflow-y: auto; height: 100%; padding: 40px 20px; gap: 60px; }
                    .ag-right-col { justify-content: center; }
                }
            `}} />

            <div className="ag-universe">
                <div className="ag-orb ag-orb-1"></div>
                <div className="ag-orb ag-orb-2"></div>
                <div className="ag-orb ag-orb-3"></div>
                <div className="ag-orb ag-orb-4"></div>
            </div>

            <div id="ag-layout-container">
                <div className="ag-left-col">
                    <div className="ag-logo">Wafferly<span>.</span></div>
                    <h1 className="ag-h1">Never pay full price <span className="ag-highlight">again.</span></h1>
                    <p className="ag-subtext">Join over 50,000 smart shoppers tracking deals, setting alerts, and saving money on Amazon.</p>

                    <div className="ag-cards-cluster">
                        <div className="ag-card-1 ag-glass-card">
                            <div className="ag-label">PRICE HISTORY</div>
                            <div className="ag-title">Sony WH-1000XM5</div>
                            <svg viewBox="0 0 260 100" width="100%" height="90px">
                                <defs>
                                    <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <g fill="rgba(255,255,255,0.35)" fontSize="6">
                                    <text x="0" y="12">28k</text>
                                    <text x="0" y="28">26k</text>
                                    <text x="0" y="44">24k</text>
                                    <text x="0" y="60">22k</text>
                                    <text x="0" y="76">20k</text>
                                </g>
                                <g stroke="rgba(255,255,255,0.05)">
                                    <line x1="18" y1="8" x2="248" y2="8" />
                                    <line x1="18" y1="24" x2="248" y2="24" />
                                    <line x1="18" y1="40" x2="248" y2="40" />
                                    <line x1="18" y1="56" x2="248" y2="56" />
                                    <line x1="18" y1="72" x2="248" y2="72" />
                                </g>
                                <path d="M36 19 L62 14 L88 22 L114 33 L140 38 L166 49 L192 41 L218 30 L232 25 L232 72 L36 72 Z" fill="url(#areaGrad2)" />
                                <polyline points="36,19 62,14 88,22 114,33 140,38 166,49 192,41 218,30 232,25" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                                <g fill="rgba(255,255,255,0.5)">
                                    <circle cx="36" cy="19" r="2" />
                                    <circle cx="62" cy="14" r="2" />
                                    <circle cx="88" cy="22" r="2" />
                                    <circle cx="114" cy="33" r="2" />
                                    <circle cx="140" cy="38" r="2" />
                                    <circle cx="192" cy="41" r="2" />
                                    <circle cx="218" cy="30" r="2" />
                                    <circle cx="232" cy="25" r="2" />
                                </g>
                                <circle cx="166" cy="49" r="10" fill="rgba(249,191,41,0.12)" />
                                <circle cx="166" cy="49" r="4" fill="#f9bf29" />
                                <circle cx="166" cy="49" r="2" fill="#fff" />
                                <polygon points="163,54 169,54 166,50" fill="#2d4a40" />
                                <polyline points="163,54 166,50 169,54" stroke="rgba(249,191,41,0.4)" strokeWidth="1" fill="none" />
                                <rect x="130" y="54" width="72" height="20" rx="5" fill="#2d4a40" stroke="rgba(249,191,41,0.4)" strokeWidth="1" />
                                <text x="166" y="67" textAnchor="middle" fontSize="6" fill="#f9bf29">₹21,700 <tspan fill="rgba(255,255,255,0.4)">·</tspan> Lowest</text>
                                <g fontSize="6" fill="rgba(255,255,255,0.3)" textAnchor="middle">
                                    <text x="36" y="82">Jun</text>
                                    <text x="62" y="82">Jul</text>
                                    <text x="88" y="82">Aug</text>
                                    <text x="114" y="82">Sep</text>
                                    <text x="140" y="82">Oct</text>
                                    <text x="166" y="82" fill="#f9bf29" fontWeight="bold">Nov</text>
                                    <text x="192" y="82">Dec</text>
                                    <text x="218" y="82">Jan</text>
                                    <text x="232" y="82">Feb</text>
                                </g>
                            </svg>
                        </div>

                        <div className="ag-card-2 ag-glass-card">
                            <div className="ag-top-label">
                                <span>🔔</span> PRICE DROP
                            </div>
                            <div className="ag-product">Apple AirPods Pro</div>
                            <div className="ag-pricing">
                                <span className="ag-current">₹18,900</span>
                                <span className="ag-strikethrough">₹24,900</span>
                                <span className="ag-badge">−24%</span>
                            </div>
                        </div>

                        <div className="ag-card-3 ag-glass-card">
                            <div className="ag-pulse-dot"></div>
                            <span>Tracking <span className="ag-highlight">1,247</span> products live</span>
                        </div>
                    </div>

                    <div className="ag-trust-row">
                        <div className="ag-trust-item"><span>✓</span> Free to use</div>
                        <div className="ag-trust-item"><span>✓</span> Instant email alerts</div>
                        <div className="ag-trust-item"><span>✓</span> Auto re-checks</div>
                    </div>
                </div>

                <div className="ag-right-col">
                    <div className="ag-form-card">
                        <div className="ag-eyebrow">
                            <div className="ag-eyebrow-dot"></div>
                            WELCOME BACK
                        </div>
                        <h2 className="ag-form-title">Sign in</h2>
                        <div className="ag-form-sub">Your dashboard and saved deals are waiting.</div>

                        <div className={`ag-error-banner ${status === 'error' ? 'ag-show' : ''}`} id="errorBanner">
                            {errorMessage}
                        </div>

                        <form id="loginForm" onSubmit={handleSubmit}>
                            <div className="ag-form-group" id="ag-fg-email">
                                <input
                                    type="email"
                                    id="email"
                                    className="ag-form-input"
                                    placeholder="Email address"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "loading"}
                                />
                            </div>

                            <div className="ag-form-group" id="ag-fg-password">
                                <Link href="#" className="ag-forgot-link">Forgot?</Link>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="ag-form-input"
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={status === "loading"}
                                />
                                <button
                                    type="button"
                                    className="ag-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ color: showPassword ? 'var(--color-secondary)' : 'rgba(255,255,255,0.25)' }}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <button type="submit" className="ag-btn ag-btn-primary" disabled={status === "loading"}>
                                {status === "loading" ? "Signing in..." : "Sign in to Wafferly"}
                            </button>
                        </form>

                        <div className="ag-divider">or</div>

                        <button type="button" className="ag-btn ag-btn-secondary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="ag-register">
                            Don't have an account? <Link href="/auth/register">Create one &rarr;</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
