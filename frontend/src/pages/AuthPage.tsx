import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  FileBadge,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  LogIn,
} from 'lucide-react';

const DEFAULT_DEPARTMENTS = [
  { _id: '6adf7cc49164fd9f5ea574cb', code: 'CSE', name: 'Computer Science and Engineering' },
  { _id: '6adf7cc49164fd9f5ea574cc', code: 'ECE', name: 'Electronics and Communication Engineering' },
  { _id: '6adf7cc49164fd9f5ea574cd', code: 'IT', name: 'Information Technology' },
  { _id: '6adf7cc49164fd9f5ea574ce', code: 'MECH', name: 'Mechanical Engineering' },
];

const DEFAULT_CLASSES = [
  { _id: '6adf7cc59164fd9f5ea574d3', name: 'CSE-A', semester: 6, department: '6adf7cc49164fd9f5ea574cb' },
  { _id: '6adf7cc59164fd9f5ea574d4', name: 'CSE-B', semester: 6, department: '6adf7cc49164fd9f5ea574cb' },
  { _id: 'ece_sec_a', name: 'ECE-A', semester: 6, department: '6adf7cc49164fd9f5ea574cc' },
  { _id: 'ece_sec_b', name: 'ECE-B', semester: 6, department: '6adf7cc49164fd9f5ea574cc' },
  { _id: 'it_sec_a', name: 'IT-A', semester: 6, department: '6adf7cc49164fd9f5ea574cd' },
  { _id: 'it_sec_b', name: 'IT-B', semester: 6, department: '6adf7cc49164fd9f5ea574cd' },
  { _id: 'mech_sec_a', name: 'MECH-A', semester: 6, department: '6adf7cc49164fd9f5ea574ce' },
  { _id: 'mech_sec_b', name: 'MECH-B', semester: 6, department: '6adf7cc49164fd9f5ea574ce' },
];

export const AuthPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign In State
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'hod' | 'admin'>('student');
  const [email, setEmail] = useState('student@campusflow.edu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register State
  const [regRole, setRegRole] = useState<'student' | 'faculty' | 'hod'>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('6adf7cc49164fd9f5ea574cb');
  const [regClassSection, setRegClassSection] = useState('6adf7cc59164fd9f5ea574d3');
  const [regRegisterNumber, setRegRegisterNumber] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Metadata for Registration dropdowns (with instant robust fallbacks)
  const [departments, setDepartments] = useState<any[]>(DEFAULT_DEPARTMENTS);
  const [classes, setClasses] = useState<any[]>(DEFAULT_CLASSES);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  // Load registration metadata from API
  const loadMeta = () => {
    authApi
      .getRegisterMeta()
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const apiDepts = res.data.data.departments;
          const apiClasses = res.data.data.classes;
          if (apiDepts && apiDepts.length > 0) {
            setDepartments(apiDepts);
            setRegDepartment((prev) => {
              if (prev && apiDepts.some((d: any) => String(d._id) === String(prev))) {
                return prev;
              }
              return apiDepts[0]._id;
            });
          }
          if (apiClasses && apiClasses.length > 0) {
            setClasses(apiClasses);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch registration metadata:', err);
      });
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (mode === 'register') {
      loadMeta();
    }
  }, [mode]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/approvals');
      else if (user.role === 'hod') navigate('/hod/approvals');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleRoleSelect = (role: 'student' | 'faculty' | 'hod' | 'admin') => {
    setSelectedRole(role);
    setError('');
    setPassword('');
    if (role === 'student') setEmail('student@campusflow.edu');
    else if (role === 'faculty') setEmail('faculty@campusflow.edu');
    else if (role === 'hod') setEmail('hod@campusflow.edu');
    else if (role === 'admin') setEmail('jayashree140906@gmail.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (regRole === 'student') {
      if (!regRegisterNumber.trim()) {
        setError('Student register number is required.');
        return;
      }
      if (!regClassSection) {
        setError('Class & section is required for students.');
        return;
      }
    } else {
      if (!regStaffId.trim()) {
        setError('Staff ID is required.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole,
        department: regDepartment,
        phone: regPhone.trim(),
      };

      if (regRole === 'student') {
        payload.registerNumber = regRegisterNumber.trim().toUpperCase();
        payload.classSection = regClassSection;
      } else {
        payload.staffId = regStaffId.trim().toUpperCase();
      }

      const res = await authApi.register(payload);
      if (res.data?.success) {
        setRegSuccessMsg(
          res.data.message ||
            'Registration submitted successfully! Your account is pending verification before you can sign in.'
        );
        // Reset form fields
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegRegisterNumber('');
        setRegStaffId('');
        setRegPhone('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.forgotPassword({ email: forgotEmail });
      setForgotMsg(res.data.message || 'Reset token generated');
      if (res.data.data?.token) {
        setResetToken(res.data.data.token);
        setResetStep(2);
      }
    } catch (err: any) {
      setForgotMsg(err.response?.data?.message || 'Error sending reset token');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.resetPassword({ token: resetToken, newPassword });
      setForgotMsg('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setShowForgot(false);
        setResetStep(1);
        setForgotMsg('');
      }, 2000);
    } catch (err: any) {
      setForgotMsg(err.response?.data?.message || 'Error resetting password');
    }
  };

  const filteredClasses = classes.filter((c) => {
    const deptId = String(c.department?._id || c.department || '');
    const deptCode = String(c.department?.code || '');
    const currentDept = String(regDepartment || '');
    return deptId === currentDept || (deptCode && deptCode === currentDept);
  });

  const displayClasses =
    filteredClasses.length > 0
      ? filteredClasses
      : (() => {
          const dept = departments.find(
            (d) => String(d._id) === String(regDepartment) || d.code === regDepartment
          );
          const prefix = dept?.code || 'SEC';
          return [
            { _id: `${prefix}-A-sem6`, name: `${prefix}-A`, semester: 6 },
            { _id: `${prefix}-B-sem6`, name: `${prefix}-B`, semester: 6 },
          ];
        })();

  // Keep regClassSection in sync whenever department or available classes change
  useEffect(() => {
    if (displayClasses.length > 0) {
      const match = displayClasses.some((c: any) => String(c._id) === String(regClassSection));
      if (!match) {
        setRegClassSection(displayClasses[0]._id);
      }
    }
  }, [regDepartment, displayClasses, regClassSection]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative backdrop gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-500/30 mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">CampusFlow</h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Student OD & Leave Management System with Automatic Attendance Integration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Main Mode Toggle: Sign In vs Register */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setRegSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setRegSuccessMsg('');
              }}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Registration</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {regSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Registration Request Submitted!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed">{regSuccessMsg}</p>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="mt-2 inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
              >
                Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ===================== SIGN IN VIEW ===================== */}
          {mode === 'signin' && (
            <div>
              {/* Role Portal Selection Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mb-1" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('faculty')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'faculty'
                        ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mb-1" />
                    <span>Faculty</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('hod')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'hod'
                        ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1" />
                    <span>HOD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="w-4 h-4 mb-1" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Institutional Email
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="mt-1 relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : `Sign In as ${selectedRole.toUpperCase()}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* ===================== REGISTRATION VIEW ===================== */}
          {mode === 'register' && (
            <div>
              {/* Role to Register as */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Register As
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      regRole === 'student'
                        ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mb-1" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('faculty')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      regRole === 'faculty'
                        ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 mb-1" />
                    <span>Faculty</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('hod')}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      regRole === 'hod'
                        ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-500/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mb-1" />
                    <span>HOD</span>
                  </button>
                </div>

                {/* Hierarchy Verification Policy Notice */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
                  <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Verification Hierarchy: </span>
                    {regRole === 'student' &&
                      'Newly registered Students are verified and approved by their Class Faculty Advisor before signing in.'}
                    {regRole === 'faculty' &&
                      'Newly registered Faculty members are verified and approved by the Head of Department (HOD) before signing in.'}
                    {regRole === 'hod' &&
                      'Newly registered HOD accounts are verified and approved by the System Administrator before signing in.'}
                  </div>
                </div>
              </div>

              <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Kishore M"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Institutional Email
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. kishore@college.edu"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      required
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {regRole === 'student' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Class / Section
                      </label>
                      <select
                        required
                        value={regClassSection}
                        onChange={(e) => setRegClassSection(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        {displayClasses.map((c: any) => (
                          <option key={c._id} value={c._id}>
                            {c.name} (Sem {c.semester})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Staff ID
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <FileBadge className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={regStaffId}
                          onChange={(e) => setRegStaffId(e.target.value)}
                          placeholder="e.g. FAC-CSE-101"
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {regRole === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Register Number
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <FileBadge className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={regRegisterNumber}
                          onChange={(e) => setRegRegisterNumber(e.target.value)}
                          placeholder="e.g. 21CSR042"
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="mt-1 relative rounded-lg shadow-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {regRole !== 'student' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Submitting Registration...' : `Register as ${regRole.toUpperCase()}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError('');
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Account Password Reset</h3>
            <p className="text-xs text-slate-500 mt-1">
              {resetStep === 1
                ? 'Enter your institutional email to generate a secure reset token.'
                : 'Enter your new password to complete the reset.'}
            </p>

            {forgotMsg && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="student@campusflow.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Generate Reset Token
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Reset Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-xs bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
