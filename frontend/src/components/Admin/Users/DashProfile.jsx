import React from 'react';
import { Alert, Button, Modal, TextInput, Label, Select } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgressbar } from 'react-circular-progressbar';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

import { 
  deleteUser,
  signOut,
  updateUser
} from '../../../redux/user/userSlice';
import 'react-circular-progressbar/dist/styles.css';

const DeleteAccountModal = ({ showModal, setShowModal, handleDeleteUser, isLoading }) => (
  <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
    <Modal.Header />
    <Modal.Body>
      <div className="text-center">
        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
        <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
          Are you sure you want to delete your account?
        </h3>
        <div className="flex justify-center gap-4">
          <Button color="failure" onClick={handleDeleteUser} disabled={isLoading}>
            {isLoading ? 'Deleting...' : "Yes, I'm sure"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            No, cancel
          </Button>
        </div>
      </div>
    </Modal.Body>
  </Modal>
);

export default function DashProfile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(0);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  
  // Updated form data structure for Django backend
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    phoneNumber: currentUser?.phoneNumber || '',
    password: '',
  });
  
  const dispatch = useDispatch();
  const filePickerRef = useRef();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        phoneNumber: currentUser.phoneNumber || '',
        password: '',
      });
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!file) {
      setImageFileUploadError('No file selected.');
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setImageFileUploadError('Only JPG and PNG files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageFileUploadError('File size must be less than 5MB.');
      return;
    }
    setImageFile(file);
    setImageFileUrl(URL.createObjectURL(file));
    setImageFileUploadError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    try {
      const formDataToSend = new FormData();
      
      // Add profile picture if changed
      if (imageFile) formDataToSend.append('profile_picture', imageFile);
      
      // Map frontend camelCase to backend snake_case
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('phone_number', formData.phoneNumber);
      
      // Only include password if it's being changed
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      const resultAction = await dispatch(updateUser({
        userId: currentUser.id || currentUser._id,
        formData: formDataToSend,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setImageFileUploadProgress(progress);
        }
      }));

      if (updateUser.fulfilled.match(resultAction)) {
        setUpdateUserSuccess('Profile updated successfully');
        setImageFileUploadProgress(0);
        setFormData(prev => ({ ...prev, password: '' })); // Clear password field
      } else if (updateUser.rejected.match(resultAction)) {
        setUpdateUserError(resultAction.payload);
        setImageFileUploadProgress(0);
      }
    } catch (error) {
      setUpdateUserError(error.message);
      setImageFileUploadProgress(0);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      const resultAction = await dispatch(deleteUser(currentUser.id || currentUser._id));
      if (deleteUser.fulfilled.match(resultAction)) {
        // Successfully deleted
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSignout = async () => {
    try {
      const resultAction = await dispatch(signOut());
      if (signOut.fulfilled.match(resultAction)) {
        // Successfully signed out
      }
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Display user's full name
  const displayName = currentUser?.username || 
    `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
    currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress > 0 && (
            <CircularProgressbar
              value={imageFileUploadProgress}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser?.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress > 0 && imageFileUploadProgress < 100 && 'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && <Alert color="failure">{imageFileUploadError}</Alert>}
        
        {/* Name Section */}
        <div className="text-center mb-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{displayName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.userType || 'Reader'}</p>
        </div>
        
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" value="First Name" className="mb-2" />
            <TextInput
              type="text"
              id="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="lastName" value="Last Name" className="mb-2" />
            <TextInput
              type="text"
              id="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>
       
        <div>
          <Label htmlFor="email" value="Email" className="mb-2" />
          <TextInput
            type="email"
            id="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="phoneNumber" value="Phone Number" className="mb-2" />
          <TextInput
            type="tel"
            id="phoneNumber"
            placeholder="Phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="bio" value="Bio" className="mb-2" />
          <TextInput
            type="text"
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="password" value="New Password (leave blank to keep current)" className="mb-2" />
          <TextInput
            type="password"
            id="password"
            placeholder="New password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <Button
          type="submit"
          className="bg-brand-green hover:bg-green-700 text-white font-medium py-2 px-4 rounded-full transition duration-300 w-32"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Update'}
        </Button>
        {currentUser?.isAdmin && (
          <Link to={'/create-post'}>
            {/*<Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              Create a post
            </Button>*/}
          </Link>
        )}
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignout} className="cursor-pointer">
          Sign Out
        </span>
      </div>
      {[updateUserSuccess, updateUserError, error].map(
        (message, index) =>
          message && (
            <Alert
              key={index}
              color={message === updateUserSuccess ? 'success' : 'failure'}
              className="mt-5"
            >
              {message}
            </Alert>
          )
      )}
      <DeleteAccountModal
        showModal={showModal}
        setShowModal={setShowModal}
        handleDeleteUser={handleDeleteUser}
        isLoading={loading}
      />
    </div>
  );
}