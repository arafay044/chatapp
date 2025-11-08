import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import bgImage from '/bgImage.svg'; // imported image

const App = () => {
  const { authUser, isLoading } = useContext(AuthContext); // assuming you can track loading

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat transition-all duration-500"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'bg-white shadow-lg text-gray-900 px-4 py-2 rounded-xl text-sm sm:text-base',
          duration: 3000,
        }}
      />

      {/* Page Routes */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 md:px-10 overflow-auto">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
