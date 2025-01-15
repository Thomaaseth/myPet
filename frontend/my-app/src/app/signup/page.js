"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForms';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/utils/toastMessage';
import styles from './page.module.css'

export default function Signup() {
    const [error, setError] = useState('');
    const router = useRouter();
    const { signupUser } = useAuth();
    
    const handleSignup = async (data) => {
        try {
            await signupUser(data);
            toast.success(TOAST_MESSAGES.SIGNUP_SUCCESS);
            router.push('/login');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'An error occurred during signup');
            if (err.message === 'User already exists.') {
                toast.error(TOAST_MESSAGES.ACCOUNT_EXISTS);
            } else {
                toast.error(TOAST_MESSAGES.GENERIC_ERROR);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Sign up for an account</h2>
                {error && <p className={styles.error}>{error}</p>}
                <AuthForm onSubmit={handleSignup} isSignup={true} />
            </div>
        </div>
    );
}