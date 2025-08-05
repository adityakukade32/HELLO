import assets from "../assets/assets";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  // ✅ Use correct camelCase field
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ If no image selected, just update name and bio
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    // ✅ Convert selected image to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>

          {/* ✅ Upload Avatar */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              className="w-12 h-12 rounded-full object-cover"
              alt="avatar"
            />
            Upload profile image
          </label>

          {/* ✅ Full Name Input */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* ✅ Bio Textarea */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="Write profile bio"
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>

          {/* ✅ Submit Button */}
          <button
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
            type="submit"
          >
            Save
          </button>
        </form>

        {/* ✅ Preview or Fallback Logo */}
        <img
          src={authUser?.profilePic || assets.logo_icon}
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover"
          alt="profile"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
