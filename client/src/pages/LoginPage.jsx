import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import AuthContext from '../../context/AuthContext';

const LoginPage = () => {
  const [currentState, setCurrentState] = useState('Sign Up');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currentState === 'Sign Up' && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    if (currentState === 'Sign Up' && !agreeTerms) {
      alert('Please agree to the terms & privacy policy.');
      return;
    }
    login(currentState === 'Sign Up' ? 'signup' : 'login', {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-4 py-10 sm:px-8">
      {/* -------- Left (Logo) -------- */}
      <div className="flex flex-col items-center text-center text-white">
        <img
          src={assets.logo_big}
          alt="Logo"
          className="w-[min(40vw,240px)] object-contain drop-shadow-2xl mb-4"
        />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-md">
          Welcome to ChatVerse 💬
        </h1>
        <p className="text-sm sm:text-base mt-2 opacity-80">
          Connect, chat, and share instantly with friends worldwide.
        </p>
      </div>

      {/* -------- Right (Auth Form) -------- */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-sm bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-white p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col gap-5 transition-all duration-500"
      >
        <h2 className="font-semibold text-2xl sm:text-3xl text-center flex items-center justify-center gap-2">
          {currentState}
          {isDataSubmitted && currentState === 'Sign Up' && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
            />
          )}
        </h2>

        {currentState === 'Sign Up' && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
            />
          </>
        )}

        {currentState === 'Sign Up' && isDataSubmitted && (
          <textarea
            rows={4}
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
          />
        )}

        <button
          type="submit"
          className="mt-2 py-3 rounded-md bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300"
        >
          {currentState === 'Sign Up' ? 'Create Account' : 'Login Now'}
        </button>

        {currentState === 'Sign Up' && (
          <label className="flex items-center gap-2 text-xs text-gray-300 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="accent-indigo-500"
            />
            <span>Agree to the terms & privacy policy</span>
          </label>
        )}

        <div className="text-center text-sm mt-3">
          {currentState === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span
                onClick={() => {
                  setCurrentState('Login');
                  setIsDataSubmitted(false);
                }}
                className="text-indigo-300 font-semibold cursor-pointer hover:text-white transition"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don’t have an account?{' '}
              <span
                onClick={() => {
                  setCurrentState('Sign Up');
                  setIsDataSubmitted(false);
                }}
                className="text-indigo-300 font-semibold cursor-pointer hover:text-white transition"
              >
                Sign up now
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
