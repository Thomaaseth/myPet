'use client'

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false)
 
    useEffect(() => {
      setIsLoggedIn(!!user);
    }, [user]);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        router.push('/');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Your App Name
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/" className={styles.navLink}>
                        Home
                    </Link>
                    {user ? (
                        <>
                            <Link href="/mypets" className={styles.navLink}>
                                My Pets
                            </Link>
                            <Link href="/myvets" className={styles.navLink}>My Vets</Link>

                            <Link href="/profile" className={styles.navLink}>
                                My Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className={styles.navLink}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.navLink}>
                                Log In
                            </Link>
                            <Link href="/signup" className={styles.navLink}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;