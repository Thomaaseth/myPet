"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './AuthForms.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please provide a valid email address.')
    .required('Email is required.'),
  password: yup
    .string()
    .matches(
      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
      'Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.'
    )
    .required('Password is required.'),
  firstName: yup.string().when('isSignup', {
    is: true,
    then: yup.string().required('First name is required.'),
  }),
  lastName: yup.string().when('isSignup', {
    is: true,
    then: yup.string().required('Last name is required.'),
  }),
});

export default function AuthForm({ onSubmit, isSignup }) {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        context: { isSignup },
    });

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {isSignup && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={styles.input}
              />
              {errors.firstName && <p className={styles.error}>{errors.firstName.message}</p>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={styles.input}
              />
              {errors.lastName && <p className={styles.error}>{errors.lastName.message}</p>}
            </div>
          </>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register('password')}
                className={styles.input}
              />
              <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className={styles.passwordToggle}
              >
                 {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}
            {isSignup && (
              <p className={styles.passwordRules}>
                Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.
              </p>
            )}
        </div>
        <button type="submit" className={styles.button}>
          {isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>
    );
}