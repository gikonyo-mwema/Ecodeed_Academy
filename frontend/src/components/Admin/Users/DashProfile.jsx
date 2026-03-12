import React from 'react';
import { Alert, Button, Modal, TextInput } from 'flowbite-react';
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
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    bio: '',
  });
  const dispatch = useDispatch();
  const filePickerRef = useRef();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        password: '',
        bio: currentUser.bio || '',
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
      if (imageFile) formDataToSend.append('profile_picture', imageFile);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('bio', formData.bio);
      // Removed password from here as it's not supported by UserProfileUpdateSerializer
      // If password update is needed, use a separate endpoint or update the serializer

      const resultAction = await dispatch(updateUser({
        formData: formDataToSend,
      }));

      if (updateUser.fulfilled.match(resultAction)) {
        setUpdateUserSuccess('Profile updated successfully');
        setImageFileUploadProgress(0);
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
    } catch {
      // Handled by Redux error state
    }
  };

  const handleSignout = async () => {
    try {
      const resultAction = await dispatch(signOut());
      if (signOut.fulfilled.match(resultAction)) {
        // Successfully signed out
      }
    } catch {
      // Handled by Redux error state
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-bold text-3xl text-gray-800 dark:text-gray-100">
        Profile Settings
      </h1>
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
            src={imageFileUrl || currentUser?.profile_picture}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress > 0 && imageFileUploadProgress < 100 && 'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && <Alert color="failure">{imageFileUploadError}</Alert>}
        <TextInput
          type="text"
          id="first_name"
          placeholder="First Name"
          value={formData.first_name || ''}
          onChange={handleChange}
        />
        <TextInput
          type="text"
          id="last_name"
          placeholder="Last Name"
          value={formData.last_name || ''}
          onChange={handleChange}
        />
        <TextInput
          type="text"
          id="bio"
          placeholder="Bio"
          value={formData.bio || ''}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          value={formData.email || ''}
          disabled
          readOnly
        />
        <Button
          type="submit"
          color="none"
          className="bg-gradient-to-r from-brand-green to-brand-yellow hover:from-brand-green/90 hover:to-brand-yellow/90 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md w-full sm:w-auto self-center mt-4 border-0"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
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
      <div className="flex flex-row justify-between w-full mt-4">
        <Button 
          color="failure" 
          outline 
          onClick={() => setShowModal(true)} 
          className="w-40 transition-transform hover:scale-105"
        >
          Delete Account
        </Button>
        <Button 
          color="gray" 
          outline 
          onClick={handleSignout} 
          className="w-40 transition-transform hover:scale-105"
        >
          Sign Out
        </Button>
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