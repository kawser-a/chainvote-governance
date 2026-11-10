

'use client';
import { useState } from 'react';
import CustomDropdown from '../components/CustomDropdown';

export default function EnrollPage() {
    const [step, setStep] = useState(1);
    const [nid, setNid] = useState('');
    const [name, setName] = useState('');
    const [sims, setSims] = useState([]);
    const [msisdn, setMsisdn] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [pin2, setPin2] = useState('');
    const [msg, setMsg] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [loading, setLoading] = useState(false);

    async function findVoter() {
        setMsg('');
        if (!nid) { setMsg('Please enter NID'); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/voter-sims?nid=${encodeURIComponent(nid)}`);
            const j = await res.json();
            if (!res.ok) { setMsg(j.error || 'Voter not found'); setLoading(false); return; }
            setName(j.name);
            setSims(j.sims || []);
            setStep(2);
        } catch (e) {
            setMsg('Network error.');
        } finally { setLoading(false); }
    }

    async function sendOtp() {
        setMsg('');
        if (!msisdn) { setMsg('Select a SIM'); return; }
        setLoading(true);
        try {
            const r = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, msisdn })
            });
            const j = await r.json();
            if (!j.ok) { setMsg(j.error || 'Failed to send OTP'); setLoading(false); return; }
            setDevOtp(j.devOtp || '');
            setStep(3);
        } catch { setMsg('Network error.'); }
        finally { setLoading(false); }
    }

    async function complete() {
        setMsg('');
        if (pin !== pin2) { setMsg('PINs do not match'); return; }
        if (!/^[0-9]{6}$/.test(pin)) { setMsg('PIN must be exactly 6 digits'); return; }
        setLoading(true);
        try {
            const r = await fetch('/api/enroll/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, msisdn, otp, pin })
            });
            const j = await r.json();
            if (!j.ok) { setMsg(j.error || 'Enrollment failed'); setLoading(false); return; }
            setMsg('Enrollment complete! Credential commitment: ' + j.credentialCommitment);
            setStep(4);
        } catch { setMsg('Network error.'); }
        finally { setLoading(false); }
    }

    // UI tokens (dark theme)
    const primary = 'bg-[#C9F300] text-[#121212]';
    const primaryHover = 'hover:bg-[#B7E200]';
    const surface = 'bg-[#141414]';
    const panel = 'bg-[#1C1C1C]';
    const border = 'border border-[#2A2A2A]';
    const text = 'text-[#EDEDED]';
    const textMuted = 'text-[#A1A1A1]';
    const inputBg = 'bg-[#121212]';
    const focusRing =
        'focus:outline-none focus:ring-2 focus:ring-[#C9F300]/40 focus:ring-offset-2 focus:ring-offset-[#121212]';

    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="mx-auto max-w-5xl px-4 py-10">
                {/* Header with persistent Login */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-semibold ${text}`}>Enrollment</h1>
                        <p className={`mt-1 text-sm ${textMuted}`}>
                            Verify identity, confirm SIM, and set a secure 6‑digit PIN.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Step indicators */}
                        <div className="hidden md:flex items-center gap-2 text-xs">
                            <StepDot active={step === 1} done={step > 1} label="Lookup" />
                            <StepConnector />
                            <StepDot active={step === 2} done={step > 2} label="SIM" />
                            <StepConnector />
                            <StepDot active={step === 3} done={step > 3} label="OTP & PIN" />
                            <StepConnector />
                            <StepDot active={step === 4} done={step > 4} label="Done" />
                        </div>

                        {/* Persistent Login button */}
                        <a
                            href="/login"
                            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium border border-[#2A2A2A] text-[#EDEDED] hover:bg-[#1D1D1D] transition"
                        >
                            Login
                        </a>
                    </div>
                </div>

                {/* Grid: main + side to avoid sparse look */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main card */}
                    <div className={`lg:col-span-2 rounded-xl ${surface} ${border} p-5`}>
                        {/* Step 1 */}
                        {/* {step === 1 && (
              <div className="space-y-5">
                <Section title="National ID Lookup" subtitle="Enter the NID to fetch registered SIMs." />
                <div className="space-y-3">
                  <label className={`block text-sm ${text}`}>National ID</label>
                  <input
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    placeholder="1990123456789"
                    className={`w-full ${inputBg} ${border} rounded-lg px-3 py-2 text-sm ${text} placeholder-[#6B6B6B] ${focusRing}`}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={findVoter}
                      disabled={loading}
                      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${primary} ${primaryHover} disabled:opacity-60 disabled:cursor-not-allowed transition`}
                    >
                      {loading ? 'Looking up…' : 'Lookup NID'}
                    </button>
                    <p className={`text-xs ${textMuted}`}>
                      If already enrolled, you can{' '}
                      <a href="/login" className="underline underline-offset-4 hover:text-[#EDEDED]">
                        log in here
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            )} */}


                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="text-center">
                                    <div className='flex items-center justify-center gap-4'>
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9F300]/10 mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-4">
                                            National ID Verification
                                        </h2>
                                    </div>
                                    <p className="mt-2 text-gray-400">
                                        Enter your National ID to verify your identity and retrieve registered SIM cards
                                    </p>
                                </div>

                                {/* Input Card */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800 shadow-lg">
                                    <div className="space-y-4">
                                        <div>
                                            <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                National ID Number
                                                <span className="ml-1.5 text-[#C9F300]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    value={nid}
                                                    onChange={(e) => setNid(e.target.value)}
                                                    placeholder="e.g., 1990123456789"
                                                    className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent transition-all duration-200"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Enter your government-issued National ID number exactly as it appears on your ID card</p>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={findVoter}
                                                disabled={loading || !nid.trim()}
                                                className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9F300] focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed bg-[#C9F300] hover:bg-[#B5E300] text-[#121212]"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Verifying National ID...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Verify Identity
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-300">Why we need your National ID</h3>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Your National ID helps us securely retrieve your registered SIM cards for authentication. This information is encrypted and never stored on our servers.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Action */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Already enrolled?{' '}
                                        <a href="/login" className="font-medium text-[#C9F300] hover:text-[#9EFF00] transition-colors duration-200 underline underline-offset-2">
                                            Log in to your account
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}


                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9F300]/10 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Verify Your SIM Card</h2>
                                    <p className="mt-2 text-gray-400">Select the SIM card that will receive your verification code</p>
                                </div>

                                {/* Voter Info Card */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800 shadow-lg">
                                    <div className="flex items-start">
                                        <div className="bg-[#C9F300]/10 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-medium text-gray-400">Verified Voter</h3>
                                            <p className="text-lg font-semibold text-white mt-1">{name || '—'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SIM Selection Card */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800 shadow-lg">
                                    <div className="space-y-4">
                                        <div>
                                            <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                Select Your Primary SIM
                                                <span className="ml-1.5 text-[#C9F300]">*</span>
                                            </label>
                                            <div className="relative">
                                                {/* <select
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent appearance-none transition-all duration-200 custom-dropdown"
            >
              <option value="">Choose your registered SIM...</option>
              {sims.map((s) => (
                <option key={s} value={s} className="text-white hover:bg-[#C9F300] hover:text-[#121212]">{s}</option>
              ))}
            </select> */}
                                                <CustomDropdown
                                                    options={sims}
                                                    value={msisdn}
                                                    onChange={setMsisdn}
                                                    placeholder="Choose your registered SIM..."
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">This SIM will receive your one-time verification code</p>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => { setStep(1); setMsisdn(''); setSims([]); }}
                                                className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1A1A] bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                                Back
                                            </button>
                                            <button
                                                disabled={!msisdn || loading}
                                                onClick={sendOtp}
                                                className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9F300] focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed bg-[#C9F300] hover:bg-[#B5E300] text-[#121212]"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending Code...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send Verification Code
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Card */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-300">Why we need to verify your SIM</h3>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Verifying your SIM card ensures that only you can access your voting account. The verification code adds an extra layer of security to protect your identity.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Action */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Already enrolled?{' '}
                                        <a href="/login" className="font-medium text-[#C9F300] hover:text-[#9EFF00] transition-colors duration-200 underline underline-offset-2">
                                            Log in to your account
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9F300]/10 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Secure Your Account</h2>
                                    <p className="mt-2 text-gray-400">Enter the verification code and set your 6-digit PIN</p>
                                </div>

                                {/* Dev OTP Notice */}
                                {devOtp && (
                                    <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/50">
                                        <div className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-400">Development Mode</h3>
                                                <p className="mt-1 text-xs text-yellow-500">
                                                    OTP for testing: <span className="font-mono font-bold">{devOtp}</span>
                                                    <span className="block mt-1">This will be hidden in production</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* OTP & PIN Form */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800 shadow-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* OTP Field */}
                                        <div className="md:col-span-2">
                                            <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                One-Time Password
                                                <span className="ml-1.5 text-[#C9F300]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    placeholder="Enter 6-digit code"
                                                    className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent transition-all duration-200"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Enter the verification code sent to your SIM</p>
                                        </div>

                                        {/* PIN Field */}
                                        <div>
                                            <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                Set 6-Digit PIN
                                                <span className="ml-1.5 text-[#C9F300]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={pin}
                                                    onChange={(e) => setPin(e.target.value)}
                                                    placeholder="••••••"
                                                    maxLength={6}
                                                    className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent transition-all duration-200"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Use digits only; avoid birthdays or sequences</p>
                                        </div>

                                        {/* Confirm PIN Field */}
                                        <div>
                                            <label className=" text-sm font-medium text-gray-300 mb-2 flex items-center">
                                                Confirm PIN
                                                <span className="ml-1.5 text-[#C9F300]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    value={pin2}
                                                    onChange={(e) => setPin2(e.target.value)}
                                                    placeholder="••••••"
                                                    maxLength={6}
                                                    className="w-full bg-[#242424] border border-gray-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent transition-all duration-200"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">Re-enter your PIN for confirmation</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1A1A] bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back
                                        </button>
                                        <button
                                            onClick={complete}
                                            disabled={loading}
                                            className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9F300] focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed bg-[#C9F300] hover:bg-[#B5E300] text-[#121212]"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Securing Account...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    Complete Enrollment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Security Information */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-300">Security Best Practices</h3>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Use a unique PIN that you don't use for other accounts</li>
                                                    <li>Avoid obvious sequences like 123456 or repeating digits</li>
                                                    <li>Your PIN is encrypted and never stored in plain text</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Action */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
                                        Already enrolled?{' '}
                                        <a href="/login" className="font-medium text-[#C9F300] hover:text-[#9EFF00] transition-colors duration-200 underline underline-offset-2">
                                            Log in to your account
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* Step 4 */}
                        {/* {step === 4 && (
                            <div className="space-y-5">
                                <Section title="Enrollment Successful" subtitle="Your credential has been created." />
                                <div className="rounded-lg border border-[#2A2A2A] bg-[#131313] p-4">
                                    <p className="text-[#9EFF00] text-sm">Enrollment complete.</p>
                                    {msg && <p className="mt-2 text-xs text-[#CFCFCF] break-words">{msg}</p>}
                                </div>
                                <a
                                    href="/login"
                                    className={`inline-block rounded-lg px-4 py-2 text-sm font-medium ${primary} ${primaryHover} transition`}
                                >
                                    Go to Login
                                </a>
                            </div>
                        )} */}
                        {step === 4 && (
                            <div className="space-y-6">
                                {/* Header Section with Celebration */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#C9F300]/10 mb-5 mx-auto">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9F300]/20">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Enrollment Successful!</h2>
                                    <p className="mt-2 text-gray-400">Your voting credential has been securely created and stored on the blockchain</p>
                                </div>

                                {/* Next Steps Information */}
                                <div className="bg-[#1A1A1A] rounded-xl p-5 border border-gray-800">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-300">What's Next?</h3>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>You can now log in to access the voting platform</li>
                                                    <li>Your credential is securely stored on the blockchain</li>
                                                    <li>Keep your PIN safe as it's required for voting</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="/login"
                                        className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9F300] focus:ring-offset-[#1A1A1A] bg-[#C9F300] hover:bg-[#B5E300] text-[#121212] text-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Go to Login
                                    </a>
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setNid('');
                                            setMsisdn('');
                                            setOtp('');
                                            setPin('');
                                            setPin2('');
                                            setMsg('');
                                        }}
                                        className="flex-1 inline-flex items-center justify-center py-3.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-[#1A1A1A] bg-transparent hover:bg-gray-800 text-gray-300 border border-gray-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Start New Enrollment
                                    </button>
                                </div>

                                {/* Security Reminder */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        Secured by blockchain technology • Your data is encrypted and protected
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Inline message for errors/info (hidden on success screen) */}
                        {msg && step !== 4 && (
                            <div className="mt-4 rounded-lg border border-[#2A2A2A] bg-[#181818] p-3">
                                <p className="text-sm text-[#EDEDED]">{msg}</p>
                            </div>
                        )}
                    </div>

                    {/* Side panel: steps + tips to keep density */}
                    <aside className={`rounded-xl ${panel} ${border} p-5`}>
                        <h3 className={`text-sm font-medium ${text}`}>Enrollment Steps</h3>
                        <ol className="mt-3 space-y-3 text-sm">
                            <SideStep index={1} current={step} title="Lookup NID" desc="Find voter and SIMs." />
                            <SideStep index={2} current={step} title="Choose SIM" desc="Select primary number." />
                            <SideStep index={3} current={step} title="OTP & PIN" desc="Verify and set PIN." />
                            <SideStep index={4} current={step} title="Complete" desc="Save credentials." />
                        </ol>
                        <div className="mt-6 rounded-lg border border-[#2A2A2A] bg-[#161616] p-4">
                            <h4 className={`text-xs font-medium ${text}`}>Tips</h4>
                            <ul className={`mt-2 space-y-1 text-xs ${textMuted}`}>
                                <li>Have the SIM device nearby.</li>
                                <li>Use a unique 6‑digit PIN.</li>
                                {step >= 2 && (
                                    <li>
                                        Selected SIM: <span className="text-[#EDEDED]">{msisdn || '—'}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function Section({ title, subtitle }) {
    return (
        <div>
            <h2 className="text-lg font-semibold text-[#EDEDED]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[#A1A1A1]">{subtitle}</p>}
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm text-[#EDEDED]">{label}</label>
            {children}
            {hint && <p className="text-xs text-[#A1A1A1]">{hint}</p>}
        </div>
    );
}

function KeyValue({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#161616] p-3">
            <span className="text-sm text-[#A1A1A1]">{label}</span>
            <span className="text-sm text-[#EDEDED]">{value}</span>
        </div>
    );
}

function StepDot({ active, done, label }) {
    const base = 'h-2.5 w-2.5 rounded-full';
    const color = done ? 'bg-[#9EFF00]' : active ? 'bg-[#C9F300]' : 'bg-[#2A2A2A]';
    const text = active ? 'text-[#EDEDED]' : 'text-[#A1A1A1]';
    return (
        <div className="flex items-center gap-2">
            <div className={`${base} ${color}`} />
            <span className={`text-xs ${text}`}>{label}</span>
        </div>
    );
}

function StepConnector() {
    return <div className="mx-1 h-px w-6 bg-[#2A2A2A]" />;
}

function SideStep({ index, current, title, desc }) {
    const active = current === index;
    const done = current > index;
    return (
        <li className={`rounded-md p-2 ${active ? 'bg-[#181818] border border-[#2A2A2A]' : ''}`}>
            <div className="flex items-center gap-2">
                <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs
          ${done ? 'bg-[#9EFF00] text-[#121212]' : active ? 'bg-[#C9F300] text-[#121212]' : 'bg-[#2A2A2A] text-[#EDEDED]'}`}
                >
                    {index}
                </div>
                <div>
                    <div className={`text-xs font-medium ${active ? 'text-[#EDEDED]' : 'text-[#CFCFCF]'}`}>
                        {title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A1]">{desc}</div>
                </div>
            </div>
        </li>
    );
}
