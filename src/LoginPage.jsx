import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logo from './assets/naf-logo-animated.gif';
import { COLORS } from './designTokens';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier: username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const userData = { username, ...data };

                // Persist based on "Remember me" preference
                if (rememberMe) {
                    localStorage.setItem('authData', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('authData', JSON.stringify(userData));
                }

                onLogin(userData);
            } else {
                setError("Invalid Credentials. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: COLORS.backgrounds.main }}>

            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7FEE64]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#7FEE64]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-2xl backdrop-blur-sm">
                        <img src={logo} alt="NAF Logo" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold font-heading tracking-tight" style={{ color: COLORS.text.heading }}>NAF SUPPORT</h1>
                    <p className="text-sm opacity-50 mt-1 force-satoshi" style={{ color: COLORS.text.body }}>Sign in to access the admin dashboard</p>
                </div>

                {/* Card */}
                <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-xl"
                    style={{ backgroundColor: COLORS.backgrounds.card, borderColor: COLORS.border }}>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-sm text-red-200 force-satoshi">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1 force-satoshi" style={{ color: COLORS.text.heading }}>
                                Username
                            </label>
                            <div className="relative group">
                                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7FEE64]" style={{ color: COLORS.text.disabled }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all force-satoshi"
                                    style={{
                                        backgroundColor: COLORS.backgrounds.input,
                                        color: COLORS.text.heading,
                                        borderColor: 'transparent'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.primary[500]}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1 force-satoshi" style={{ color: COLORS.text.heading }}>
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#7FEE64]" style={{ color: COLORS.text.disabled }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl outline-none border transition-all force-satoshi"
                                    style={{
                                        backgroundColor: COLORS.backgrounds.input,
                                        color: COLORS.text.heading,
                                        borderColor: 'transparent'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = COLORS.primary[500]}
                                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword
                                        ? <EyeOff className="w-4 h-4" style={{ color: COLORS.text.disabled }} />
                                        : <Eye className="w-4 h-4" style={{ color: COLORS.text.disabled }} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-transparent accent-[#7FEE64]"
                            />
                            <span className="text-xs text-white/50 force-satoshi">Remember me</span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-black shadow-lg shadow-[#7FEE64]/20 hover:shadow-[#7FEE64]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 force-satoshi"
                            style={{ backgroundColor: COLORS.primary[500] }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
