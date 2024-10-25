"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForms';  
import { useAuth } from '@/context/AuthContext';
import { login } from '@/lib/api';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/utils/toastMessage';
import styles from './Login.module.css'

export default function Login() {

    const [error, setError] = useState('');
    const router = useRouter();
    const { loginUser } = useAuth();

    const handleLogin = async (data) => {
        try {
            const apiResponse = await login(data);
            console.log('API Response:', apiResponse);
    
            if (apiResponse.authToken && apiResponse.user) {
                await loginUser(apiResponse);
                toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
                router.push('/');
            } else {
                console.log('API response does not contain expected data structure');
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Login error:', err);
            
                switch(err.message) {
                    case 'USER_NOT_FOUND':
                        setError('No account found with this email. Please sign up.');
                        toast.error(TOAST_MESSAGES.NO_USER);
                        break;
                    case 'INCORRECT_PASSWORD':
                        setError('Incorrect password. Please try again.');
                        toast.error(TOAST_MESSAGES.WRONG_PASSWORD);
                        break;
                    default:
                        setError(err.message || 'An error occurred during login. Please try again.');
                        toast.error(TOAST_MESSAGES.GENERIC_ERROR);
                }         
            }     
        };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h2 className={styles.title}>Log in your account</h2>
                {error && <p className={styles.error}>{error}</p>}
                <AuthForm onSubmit={handleLogin} isSignup={false} />
            </div>
        </div>
    );
}