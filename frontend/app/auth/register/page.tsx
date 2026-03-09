"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setSession } from "@/lib/auth";

export default function RegisterPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [terms, setTerms] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const [pwdStrength, setPwdStrength] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const val = password;
        let strength = 0;
        if (val.length >= 1) strength = 1;
        if (val.length >= 8) strength = 2;
        if (val.length >= 8 && (/[A-Z]/.test(val) || /\d/.test(val))) strength = 3;
        if (val.length >= 8 && /[A-Z]/.test(val) && /\d/.test(val) && /[^A-Za-z0-9]/.test(val)) strength = 4;
        setPwdStrength(strength);
    }, [password]);

    const getStrengthStyles = () => {
        switch (pwdStrength) {
            case 0: return { width: '0%', bg: 'transparent', color: 'transparent', text: '' };
            case 1: return { width: '25%', bg: '#dc3545', color: '#dc3545', text: 'Weak' };
            case 2: return { width: '50%', bg: '#f9bf29', color: '#f9bf29', text: 'Fair' };
            case 3: return { width: '75%', bg: '#5a7d6d', color: '#5a7d6d', text: 'Good' };
            case 4: return { width: '100%', bg: '#3b5d50', color: '#3b5d50', text: 'Strong' };
            default: return { width: '0%', bg: 'transparent', color: 'transparent', text: '' };
        }
    };
    const sStyles = getStrengthStyles();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus("idle");
        setErrorMessage("");

        if (!firstName || !lastName) {
            setStatus("error"); setErrorMessage("First and last name are required."); return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setStatus("error"); setErrorMessage("Please enter a valid email address."); return;
        }
        if (password.length < 8) {
            setStatus("error"); setErrorMessage("Password must be at least 8 characters long."); return;
        }
        if (password !== confirmPassword) {
            setStatus("error"); setErrorMessage("Passwords do not match."); return;
        }
        if (!terms) {
            setStatus("error"); setErrorMessage("You must agree to the Terms of Service."); return;
        }

        setStatus("loading");

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed.");

            setSession(data.session_token, data.email);
            router.push("/");
        } catch (err: any) {
            console.error("Register error:", err);
            setStatus("error");
            setErrorMessage(err.message || "Registration failed.");
        }
    };

    return (
        <div className="ag-reg-wrapper">
            <style dangerouslySetInnerHTML={{
                __html: `
                .ag-reg-wrapper {
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
                    z-index: 9999;
                    background-color: var(--color-primary);
                    font-family: var(--font-body);
                    color: var(--color-white);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: auto;
                }
                .ag-reg-wrapper * { box-sizing: border-box; margin: 0; padding: 0; }

                .ag-universe { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
                .ag-universe::before {
                    content: ""; position: absolute; inset: 0;
                    background:
                        radial-gradient(ellipse 120% 80% at 80% 50%, #2d4a40 0%, transparent 55%),
                        radial-gradient(ellipse 80% 100% at 20% 30%, #4a7060 0%, transparent 50%),
                        radial-gradient(ellipse 60% 60% at 40% 90%, #2a4538 0%, transparent 45%);
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
                .ag-orb-1 { width: 500px; height: 500px; top: -10%; right: -10%; background: rgba(59,93,80,0.5); animation: agMoveOrb1 22s ease-in-out infinite alternate; }
                .ag-orb-2 { width: 400px; height: 400px; bottom: -5%; left: -5%; background: rgba(249,191,41,0.18); animation: agMoveOrb2 18s ease-in-out infinite alternate-reverse; }
                .ag-orb-3 { width: 280px; height: 280px; top: 40%; left: 10%; background: rgba(59,93,80,0.25); animation: agMoveOrb3 26s linear infinite; }
                .ag-orb-4 { width: 180px; height: 180px; top: 50%; right: 40%; background: rgba(249,191,41,0.1); animation: agMoveOrb4 14s ease-in-out infinite alternate; }

                @keyframes agMoveOrb1 { from { transform: translate(0, 0) scale(0.97); } to { transform: translate(40px, 40px) scale(1.05); } }
                @keyframes agMoveOrb2 { from { transform: translate(0, 0); } to { transform: translate(50px, -50px); } }
                @keyframes agMoveOrb3 { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(30px, 30px) rotate(180deg); } }
                @keyframes agMoveOrb4 { from { transform: translate(0, 0) scale(0.97); } to { transform: translate(-40px, -40px) scale(1.05); } }

                #ag-reg-container {
                    position: relative; z-index: 10; display: grid; grid-template-columns: 45% 55%; max-width: 1280px; width: 100%; height: auto; min-height: 100vh; padding: 40px; gap: 32px; align-items: center; justify-content: center;
                }

                .ag-left-col { opacity: 0; animation: agSlideLeft 0.9s cubic-bezier(0.16,1,0.3,1) forwards; display: flex; justify-content: flex-start; }
                @keyframes agSlideLeft { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .ag-form-card { position: relative; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 36px 38px; max-width: 440px; width: 100%; backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,93,80,0.2), inset 0 1px 0 rgba(255,255,255,0.1); animation: agLevitate 9s ease-in-out infinite; }
                @keyframes agLevitate { 0% { transform: translateY(0); } 45% { transform: translateY(-8px); } 75% { transform: translateY(5px); } 100% { transform: translateY(0); } }
                .ag-form-card::before { content: ""; position: absolute; top: 0; left: 15%; right: 15%; height: 2px; background: linear-gradient(90deg, transparent, var(--color-secondary), transparent); }

                .ag-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; color: var(--color-secondary); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.3s; }
                .ag-eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--color-secondary); box-shadow: 0 0 8px rgba(249,191,41,0.8); }
                .ag-form-title { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--color-white); letter-spacing: -1px; margin-bottom: 4px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.35s; }
                .ag-form-sub { font-size: 0.82rem; color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.35s; }

                .ag-error-banner { display: none; background: rgba(220,53,69,0.12); border: 1px solid rgba(220,53,69,0.3); border-radius: var(--radius-10); color: #ff8080; font-size: 0.82rem; padding: 12px 16px; margin-bottom: 16px; }
                .ag-error-banner.ag-show { display: block; }

                .ag-form-group { position: relative; margin-bottom: 14px; opacity: 0; }
                #ag-fg-name { animation: agFadeUp 0.6s ease forwards 0.44s; }
                #ag-fg-email { animation: agFadeUp 0.6s ease forwards 0.48s; }
                #ag-fg-password { animation: agFadeUp 0.6s ease forwards 0.52s; }
                #ag-fg-confirm { animation: agFadeUp 0.6s ease forwards 0.56s; }
                .ag-name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

                .ag-form-input { width: 100%; height: 44px; border-radius: var(--radius-10); background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.1); color: var(--color-white); padding: 0 16px; font-family: var(--font-body); font-size: 0.9rem; outline: none; transition: all 0.2s ease; backdrop-filter: blur(8px); }
                .ag-form-input::placeholder { color: rgba(255,255,255,0.3); }
                .ag-form-input:focus { border-color: rgba(249,191,41,0.5); box-shadow: 0 0 0 3px rgba(249,191,41,0.12), 0 0 20px rgba(249,191,41,0.08); }

                .ag-password-toggle { position: absolute; top: 22px; right: 16px; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.25); cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.2s ease; }
                .ag-password-toggle:hover { color: var(--color-secondary); }

                .ag-pwd-strength-container { margin-top: 6px; padding: 0 4px; }
                .ag-pwd-strength-bar { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.08); width: 100%; overflow: hidden; }
                .ag-pwd-strength-fill { height: 100%; transition: width 0.3s ease, background 0.3s ease; }
                .ag-pwd-strength-label { font-size: 0.68rem; margin-top: 4px; display: block; text-align: right; transition: color 0.3s ease; }

                .ag-terms-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; margin-top: 6px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.6s; }
                .ag-terms-row input[type="checkbox"] { margin-top: 4px; accent-color: var(--color-secondary); width: 16px; height: 16px; cursor: pointer; }
                .ag-terms-label { color: rgba(255,255,255,0.35); font-size: 0.76rem; line-height: 1.4; }
                .ag-terms-label a { color: rgba(249,191,41,0.7); text-decoration: none; transition: color 0.2s ease; }
                .ag-terms-label a:hover { color: var(--color-secondary); }

                .ag-btn { height: 50px; width: 100%; border-radius: var(--radius-30); font-family: var(--font-body); font-size: 0.9rem; font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s ease; outline: none; }
                .ag-btn-primary { background: var(--color-secondary); color: #2f2f2f; border: none; box-shadow: 0 4px 24px rgba(249,191,41,0.35); opacity: 0; animation: agFadeUp 0.6s ease forwards 0.64s; }
                .ag-btn-primary:hover { background: var(--color-secondary-dark); transform: translateY(-2px); box-shadow: 0 6px 30px rgba(249,191,41,0.5); }
                .ag-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: translateY(0); }

                .ag-divider { display: flex; align-items: center; text-align: center; color: rgba(255,255,255,0.25); font-size: 0.85rem; margin: 20px 0; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.68s; }
                .ag-divider::before, .ag-divider::after { content: ""; flex: 1; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .ag-divider::before { margin-right: 12px; }
                .ag-divider::after { margin-left: 12px; }

                .ag-btn-google { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); border: 1.5px solid rgba(255,255,255,0.12); height: 46px; border-radius: var(--radius-30); opacity: 0; animation: agFadeUp 0.6s ease forwards 0.72s; }
                .ag-btn-google:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); }

                .ag-login-link { text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.3); margin-top: 24px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.76s; }
                .ag-login-link a { color: rgba(249,191,41,0.8); text-decoration: none; transition: color 0.2s ease; font-weight: 500; }
                .ag-login-link a:hover { color: var(--color-secondary); }

                .ag-right-col { position: relative; opacity: 0; animation: agSlideRight 0.9s cubic-bezier(0.16,1,0.3,1) forwards 0.15s; padding-left: 20px; }
                @keyframes agSlideRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .ag-logo { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--color-white); letter-spacing: -0.5px; margin-bottom: 2rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.1s; }
                .ag-logo span { opacity: 0.4; }

                .ag-h1 { font-family: var(--font-display); font-size: clamp(2rem, 2.8vw, 2.8rem); font-weight: 700; color: var(--color-white); letter-spacing: -1px; line-height: 1.1; margin-bottom: 0.5rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.2s; }
                .ag-h1 .ag-highlight { color: var(--color-secondary); }

                .ag-subtext { font-family: var(--font-body); font-size: 0.88rem; color: rgba(255,255,255,0.45); max-width: 360px; line-height: 1.5; margin-bottom: 3rem; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.3s; }

                .ag-cards-cluster { position: relative; height: 260px; width: 100%; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.4s; }
                .ag-glass-card { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }

                .ag-card-1 { position: absolute; top: 0; left: 10px; width: 260px; padding: 18px 20px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-20); box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08); animation: agDriftCard1 8s ease-in-out infinite; }
                @keyframes agDriftCard1 { 0% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-14px) rotate(-0.5deg); } 75% { transform: translateY(8px) rotate(0.3deg); } 100% { transform: translateY(0) rotate(0); } }
                .ag-card-1 .ag-label { font-size: 9px; text-transform: uppercase; color: rgba(255,255,255,0.35); letter-spacing: 1.5px; margin-bottom: 6px; }
                .ag-card-1 .ag-big-amount { font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: var(--color-secondary); letter-spacing: -1px; line-height: 1; }
                .ag-card-1 .ag-amount-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-bottom: 14px; display: block; }
                .ag-mini-rows { display: flex; flex-direction: column; gap: 6px; }
                .ag-mini-row { background: rgba(255,255,255,0.04); border-radius: 8px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; }
                .ag-mini-row .ag-name { font-size: 10px; color: rgba(255,255,255,0.6); }
                .ag-mini-row .ag-save-badge { font-size: 10px; font-weight: 700; color: var(--color-secondary); background: rgba(249,191,41,0.12); border-radius: 20px; padding: 2px 7px; }

                .ag-card-2 { position: absolute; top: 20px; right: 0; width: 185px; padding: 14px 16px; background: rgba(59,93,80,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: var(--radius-20); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1); animation: agDriftCard2 11s ease-in-out infinite; }
                @keyframes agDriftCard2 { 0% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-18px) rotate(-2.5deg); } 75% { transform: translateY(18px) rotate(0deg); } 100% { transform: translateY(0) rotate(-1.5deg); } }
                .ag-card-2 .ag-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
                .ag-card-2 .ag-icon-box { width: 28px; height: 28px; border-radius: 8px; background: rgba(249,191,41,0.15); display: flex; justify-content: center; align-items: center; font-size: 14px; }
                .ag-card-2 .ag-title-wrap { display: flex; flex-direction: column; }
                .ag-card-2 .ag-notif-title { font-size: 11px; font-weight: 700; color: var(--color-white); }
                .ag-card-2 .ag-notif-time { font-size: 9px; color: rgba(255,255,255,0.4); }
                .ag-card-2 .ag-notif-body { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.4; }
                .ag-card-2 .ag-notif-body .ag-highlight { color: var(--color-secondary); font-weight: 700; }

                .ag-card-3 { position: absolute; bottom: 20px; right: 10px; left: auto; padding: 9px 16px; border-radius: 50px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; gap: 12px; animation: agDriftCard3 13s ease-in-out infinite alternate; }
                @keyframes agDriftCard3 { 0% { transform: translate(0, 0); } 50% { transform: translate(12px, -8px); } 100% { transform: translate(-8px, 12px); } }
                .ag-avatars { display: flex; }
                .ag-avatar { width: 22px; height: 22px; border-radius: 50%; margin-right: -6px; border: 1px solid #3b5d50; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: #fff; }
                .ag-avatar:last-child { margin-right: 0; }
                .ag-av-1 { background: #E57373; z-index: 4; }
                .ag-av-2 { background: #81C784; z-index: 3; }
                .ag-av-3 { background: #64B5F6; z-index: 2; }
                .ag-av-4 { background: #BA68C8; z-index: 1; }
                .ag-card-3 span { font-size: 11px; color: rgba(255,255,255,0.65); }
                .ag-card-3 .ag-highlight { color: var(--color-secondary); font-weight: 600; }

                .ag-perks-list { display: flex; flex-direction: column; gap: 10px; opacity: 0; animation: agFadeUp 0.6s ease forwards 0.5s; }
                .ag-perk-item { display: flex; align-items: center; gap: 12px; }
                .ag-perk-icon { width: 30px; height: 30px; border-radius: 9px; background: rgba(249,191,41,0.1); border: 1px solid rgba(249,191,41,0.2); display: flex; justify-content: center; align-items: center; font-size: 14px; flex-shrink: 0; }
                .ag-perk-text { font-size: 0.82rem; color: rgba(255,255,255,0.55); line-height: 1.4; }
                .ag-perk-text span { color: var(--color-white); font-weight: 600; }

                @keyframes agFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 900px) {
                    #ag-reg-container { grid-template-columns: 1fr; display: flex; flex-direction: column; overflow-y: auto; height: 100%; padding: 40px 20px; gap: 60px; }
                    .ag-left-col { justify-content: center; order: 2; }
                    .ag-right-col { order: 1; padding-left: 0; }
                }
            `}} />

            <div className="ag-universe">
                <div className="ag-orb ag-orb-1"></div>
                <div className="ag-orb ag-orb-2"></div>
                <div className="ag-orb ag-orb-3"></div>
                <div className="ag-orb ag-orb-4"></div>
            </div>

            <div id="ag-reg-container">

                {/* Left Side: Form */}
                <div className="ag-left-col">
                    <div className="ag-form-card">
                        <div className="ag-eyebrow">
                            <div className="ag-eyebrow-dot"></div>
                            START SAVING TODAY
                        </div>
                        <h2 className="ag-form-title">Create account</h2>
                        <div className="ag-form-sub">Free forever. No credit card needed.</div>

                        <div className={`ag-error-banner ${status === 'error' ? 'ag-show' : ''}`} id="errorBanner">
                            {errorMessage}
                        </div>

                        <form id="registerForm" onSubmit={handleSubmit}>
                            <div className="ag-form-group ag-name-row" id="ag-fg-name">
                                <input type="text" className="ag-form-input" placeholder="First Name (e.g. Arjun)" required value={firstName} onChange={e => setFirstName(e.target.value)} disabled={status === "loading"} />
                                <input type="text" className="ag-form-input" placeholder="Last Name (e.g. Sharma)" required value={lastName} onChange={e => setLastName(e.target.value)} disabled={status === "loading"} />
                            </div>

                            <div className="ag-form-group" id="ag-fg-email">
                                <input type="email" className="ag-form-input" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={status === "loading"} />
                            </div>

                            <div className="ag-form-group" id="ag-fg-password">
                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} className="ag-form-input" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} disabled={status === "loading"} />
                                    <button type="button" className="ag-password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ color: showPassword ? 'var(--color-secondary)' : 'rgba(255,255,255,0.25)' }}>
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="ag-pwd-strength-container">
                                    <div className="ag-pwd-strength-bar">
                                        <div className="ag-pwd-strength-fill" style={{ width: sStyles.width, background: sStyles.bg }}></div>
                                    </div>
                                    <span className="ag-pwd-strength-label" style={{ color: sStyles.color }}>{sStyles.text}</span>
                                </div>
                            </div>

                            <div className="ag-form-group" id="ag-fg-confirm">
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirmPassword ? "text" : "password"} className="ag-form-input" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={status === "loading"} />
                                    <button type="button" className="ag-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ color: showConfirmPassword ? 'var(--color-secondary)' : 'rgba(255,255,255,0.25)' }}>
                                        {showConfirmPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="ag-terms-row">
                                <input type="checkbox" id="terms" required checked={terms} onChange={e => setTerms(e.target.checked)} disabled={status === "loading"} />
                                <label htmlFor="terms" className="ag-terms-label">
                                    I agree to Wafferly's <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>
                                </label>
                            </div>

                            <button type="submit" className="ag-btn ag-btn-primary" disabled={status === "loading"}>
                                {status === "loading" ? "Creating account..." : "Create my free account"}
                            </button>
                        </form>

                        <div className="ag-divider">or</div>

                        <button type="button" className="ag-btn ag-btn-google">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="ag-login-link">
                            Already have an account? <Link href="/auth/login">Sign in &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Perks & Content */}
                <div className="ag-right-col">
                    <div className="ag-logo">Wafferly<span>.</span></div>
                    <h1 className="ag-h1">Join <span className="ag-highlight">12,000+</span><br />smart shoppers.</h1>
                    <p className="ag-subtext">Wafferly automates price tracking for your wishlist so you never miss a sale again.</p>

                    <div className="ag-cards-cluster">

                        <div className="ag-card-1 ag-glass-card">
                            <div className="ag-label">TOTAL SAVED THIS MONTH</div>
                            <div className="ag-big-amount">₹4.2L</div>
                            <div className="ag-amount-sub">across all Wafferly users</div>

                            <div className="ag-mini-rows">
                                <div className="ag-mini-row">
                                    <span className="ag-name">Samsung 65" TV</span>
                                    <span className="ag-save-badge">saved ₹8,400</span>
                                </div>
                                <div className="ag-mini-row">
                                    <span className="ag-name">iPad Air M2</span>
                                    <span className="ag-save-badge">saved ₹5,200</span>
                                </div>
                                <div className="ag-mini-row">
                                    <span className="ag-name">Dyson V15</span>
                                    <span className="ag-save-badge">saved ₹3,700</span>
                                </div>
                            </div>
                        </div>

                        <div className="ag-card-2 ag-glass-card">
                            <div className="ag-top-row">
                                <div className="ag-icon-box">🎯</div>
                                <div className="ag-title-wrap">
                                    <span className="ag-notif-title">Target hit!</span>
                                    <span className="ag-notif-time">2 min ago</span>
                                </div>
                            </div>
                            <div className="ag-notif-body">
                                Sony WH-1000XM5 dropped to <span className="ag-highlight">₹21,700</span> — your target was ₹22,000
                            </div>
                        </div>

                        <div className="ag-card-3 ag-glass-card">
                            <div className="ag-avatars">
                                <div className="ag-avatar ag-av-1">AS</div>
                                <div className="ag-avatar ag-av-2">MJ</div>
                                <div className="ag-avatar ag-av-3">TK</div>
                                <div className="ag-avatar ag-av-4">RP</div>
                            </div>
                            <span><span className="ag-highlight">12,847</span> members tracking deals</span>
                        </div>

                    </div>

                    <div className="ag-perks-list">
                        <div className="ag-perk-item">
                            <div className="ag-perk-icon">🔔</div>
                            <div className="ag-perk-text"><span>Instant email alerts</span> when prices drop</div>
                        </div>
                        <div className="ag-perk-item">
                            <div className="ag-perk-icon">🎯</div>
                            <div className="ag-perk-text"><span>Set a target price</span> — only alert when it matters</div>
                        </div>
                        <div className="ag-perk-item">
                            <div className="ag-perk-icon">📈</div>
                            <div className="ag-perk-text"><span>Full price history</span> for every product</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
