'use client'

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateEmail, changePassword, deleteAccount } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from './page.module.css';
import { TOAST_MESSAGES } from '@/utils/toastMessage';
import { FaEye, FaEyeSlash } from 'react-icons/fa'


export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordError, setPasswordError] = useState('');


  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
        const result = await updateEmail(email);
        console.log('Update email result:', result);
        if (result.message === 'Email is unchanged') {
            toast.info(TOAST_MESSAGES.EMAIL_IN_USE);
        } else {
            toast.success(TOAST_MESSAGES.EMAIL_CHANGED_SUCCESS);
        }
      } catch (err) {
        console.error('Error updating email:', err);
        if (err.message === 'Email is already in use') {
            toast.error(TOAST_MESSAGES.EMAIL_IN_USE_OTHER);
        } else {
            toast.error(TOAST_MESSAGES.EMAIL_ERROR);
        }
    }
};

const validatePassword = (password) => {
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  return regex.test(password);
};

const handleNewPasswordChange = (e) => {
  const newPass = e.target.value;
  setNewPassword(newPass);
  setPasswordsMatch(newPass === confirmPassword);
  if (!validatePassword(newPass)) {
    setPasswordError('Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.');
  } else {
    setPasswordError('');
  }
};


const handleConfirmPasswordChange = (e) => {
  const confirmPass = e.target.value;
  setConfirmPassword(confirmPass);
  setPasswordsMatch(newPassword === confirmPass);
};

const handleChangePassword = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
    return toast.error(TOAST_MESSAGES.PASSWORDS_DO_NOT_MATCH);
  }
  if (!validatePassword(newPassword)) {
    return toast.error('Password does not meet the required criteria.');
  }
  
  try {
    const result = await changePassword(currentPassword, newPassword);
    console.log('Password change result:', result);
    toast.success(result.message || TOAST_MESSAGES.PASSWORD_CHANGE_SUCCESS);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  } catch (error) {
    console.error('Password change error:', error);
    if (error.message === 'Current password is incorrect') {
      toast.error(TOAST_MESSAGES.INCORRECT_CURRENT_PASSWORD);
    } else {
      toast.error(error.message || TOAST_MESSAGES.GENERIC_ERROR);
    }
  }
};

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        toast.success('Account deleted successfully');
        logout();
        router.push('/');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Profile</h1>
      
      <form onSubmit={handleUpdateEmail} className={styles.form}>
        <h2>Update Email</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New Email"
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Update Email</button>
      </form>

      <form onSubmit={handleChangePassword} className={styles.form}>
        <h2>Change Password</h2>
        <div className={styles.passwordInput}>
          <input
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            required
            className={styles.input}
          />
          <button 
            type="button" 
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className={styles.passwordToggle}
          >
            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className={styles.passwordInput}>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="New Password"
            required
            className={styles.input}
          />
          <button 
            type="button" 
            onClick={() => setShowNewPassword(!showNewPassword)}
            className={styles.passwordToggle}
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className={styles.passwordInput}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm New Password"
            required
            className={styles.input}
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.passwordToggle}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {!passwordsMatch && <p className={styles.errorText}>Passwords do not match</p>}
        {passwordError && <p className={styles.errorText}>{passwordError}</p>}
        <p className={styles.passwordRules}>
          Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.
        </p>
        <button type="submit" className={styles.button} disabled={!passwordsMatch || passwordError}>Change Password</button>
      </form>

      <div className={styles.deleteAccount}>
        <h2>Delete Account</h2>
        <p>This action cannot be undone.</p>
        <button onClick={handleDeleteAccount} className={styles.deleteButton}>Delete My Account</button>
      </div>
    </div>
  );
}