import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Eye, EyeOff, Sparkles, Shield, ArrowRight, Building2, Users2, Layers, MessageSquare, Calendar, FolderGit2 } from 'lucide-react';
import mascotImg from '../../images/mascot.webp';
import logoImg from '../../images/wegrow&Bschool.webp';

export const Gate = () => {
  const { login, register, demoAccounts } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(['wegrow']);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          title,
          department,
          brands: selectedBrands
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleBrand = (b) => {
    if (selectedBrands.includes(b)) {
      if (selectedBrands.length > 1) {
        setSelectedBrands(selectedBrands.filter(item => item !== b));
      }
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 overflow-y-auto bg-[#F4F6FB] dark:bg-[#151515]">
      {/* Hero Left Panel */}
      <div className="lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-[#0C2F9A] via-[#0A2A8C] to-[#061B5C] p-8 md:p-12 lg:p-16 text-white flex flex-col justify-between min-h-[520px]">
        {/* Glow circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none"></div>

        {/* Brand header with Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="WeGrow & BSchool" className="h-10 w-auto object-contain bg-white/95 px-3 py-1 rounded-xl shadow-md" />
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                WeGrow <span className="text-[#FF8A3D]">ConnectX</span>
              </span>
              <span className="text-xs uppercase tracking-widest text-blue-200/70 font-semibold block">
                Enterprise Collaboration Suite
              </span>
            </div>
          </div>
        </div>

        {/* Mascot with Speech Bubble */}
        <div className="hidden lg:block absolute right-0 bottom-0 pointer-events-none z-10 w-64 xl:w-80 select-none">
          <div className="relative">
            <div className="absolute -top-12 left-4 bg-white text-[#0A2A8C] font-extrabold text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-blue-100 flex items-center gap-1.5">
              <span>Welcome back! Let's grow together 👋</span>
            </div>
            <img
              src={mascotImg}
              alt="WeGrow Mascot"
              className="w-full h-auto object-contain filter drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-orange-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
            Unified Workspace for All 3 Brands
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight mb-4 text-white">
            Where our teams <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A3D] to-amber-300">connect</span>, learn and grow.
          </h1>
          <p className="text-base text-blue-100/80 mb-8 leading-relaxed max-w-md">
            Team channels, private chats, real-time meetings, unified calendar, and organization files for everyone at WeGrow, SkillCampus, and BSchool.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-blue-200 flex-none">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Channels & Threads</div>
                <div className="text-[10px] text-blue-200/70">Posts & reactions</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-blue-200 flex-none">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Smart Calendar</div>
                <div className="text-[10px] text-blue-200/70">Meetings & RSVPs</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-blue-200 flex-none">
                <Users2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">People Directory</div>
                <div className="text-[10px] text-blue-200/70">Live status & quick DMs</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-blue-200 flex-none">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Centralized Files</div>
                <div className="text-[10px] text-blue-200/70">Asset sharing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brands pill bar */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-4 border-t border-white/15">
          <span className="text-xs font-semibold text-blue-200/70 mr-1">Ecosystem Brands:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> WeGrow
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span> SkillCampus
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-400/30 text-rose-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> BSchool
          </span>
        </div>
      </div>

      {/* Auth Card Right Panel */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white dark:bg-[#242424] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
          {/* Header with Logo */}
          <div className="mb-5 text-center">
            <img src={logoImg} alt="WeGrow & BSchool Logo" className="h-11 w-auto mx-auto mb-3 object-contain" />
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isRegister ? 'Join WeGrow ConnectX' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isRegister ? 'Create your employee account' : 'Sign in with your company credentials'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2A8C] dark:focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Trainer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0A2A8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Academics"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0A2A8C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Brand Access</label>
                  <div className="flex gap-2">
                    {['wegrow', 'skillcampus', 'bschool'].map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => toggleBrand(b)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize transition-all ${
                          selectedBrands.includes(b)
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="name@wegrow.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2A8C] dark:focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2A8C] dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF6A13] to-[#FF8A3D] hover:from-[#F25E08] hover:to-[#FF7A2A] shadow-lg shadow-orange-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In to ConnectX'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Staff Login Selector */}
          {!isRegister && demoAccounts.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-orange-500">⚡</span> 1-Click Staff Sign-In
                </span>
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                  {demoAccounts.length} staff accounts
                </span>
              </div>

              {/* Branch filter tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 text-[10px]">
                {['all', 'Sivakasi 3.0', 'Sivakasi 1.0', 'Srivilliputhur 2.0'].map(b => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBranchFilter(b)}
                    className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition-all ${
                      branchFilter === b
                        ? 'bg-[#0A2A8C] text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {b === 'all' ? 'All Staff' : b}
                  </button>
                ))}
              </div>

              {/* Staff grid */}
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {demoAccounts
                  .filter(acc => {
                    if (branchFilter === 'all') return true;
                    return acc.branch?.includes(branchFilter);
                  })
                  .map(acc => (
                    <button
                      type="button"
                      key={acc._id || acc.email}
                      onClick={() => handleDemoLogin(acc.email, acc.demoPassword || 'Vijay@2004')}
                      className="flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all group"
                      title={`Login as ${acc.name} (${acc.title || acc.designation || acc.role})`}
                    >
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold flex-none shadow-xs"
                        style={{ backgroundColor: acc.color || '#5B5FC7' }}
                      >
                        {acc.name?.substring(0, 2).toUpperCase() || 'WG'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {acc.title || acc.designation || acc.role}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Secure badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit encrypted enterprise connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
