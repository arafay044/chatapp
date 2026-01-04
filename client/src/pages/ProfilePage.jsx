import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import AuthContext from '../../context/AuthContext';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { fullName: name, bio };
    if (selectedImage) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onload = async () => {
        payload.profilePic = reader.result;
        await updateProfile(payload);
        navigate('/');
      };
      return;
    }
    await updateProfile(payload);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-4 py-10">
      <div className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 gap-10 text-white transition-all duration-300">
        
        {/* --- Form Section --- */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full md:flex-1"
        >
          <h2 className="text-3xl font-semibold text-center md:text-left">
            Edit Profile
          </h2>

          {/* Upload Avatar */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-4 cursor-pointer hover:scale-[1.03] transition-transform"
            aria-label="Upload new profile image"
          >
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={(e) => setSelectedImage(e.target.files[0])}
            />
            <img
              src={previewUrl || authUser?.profilePic || assets.avatar_icon}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
            />
            <span className="text-sm text-gray-300 hover:text-white transition">
              Upload new profile image
            </span>
          </label>

          {/* Input Fields */}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
          />

          <textarea
            rows={4}
            placeholder="Write a short bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className="p-3 rounded-md bg-gray-700/30 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
          />

          <button
            type="submit"
            className="mt-2 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Save Changes
          </button>
        </form>

        {/* --- Profile Preview --- */}
        <div className="flex flex-col items-center md:items-end md:w-1/3 text-center md:text-right">
          <img
            src={previewUrl || authUser?.profilePic || assets.logo_icon}
            alt="Profile Preview"
            className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500 shadow-lg transition-all duration-300"
          />
          <h3 className="mt-4 text-2xl font-semibold">{name}</h3>
          <p className="mt-1 text-gray-300 text-sm max-w-xs">{bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
