import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const ProtectedRoute = (WrappedComponent) => {
  return (props) => {
    const { user } = useAuth();
    const router = useRouter();

    if (typeof window !== 'undefined') {
      if (!user) {
        router.replace('/login');
        return null;
      }
      return <WrappedComponent {...props} />;
    }

    // Return null if we're on server-side
    return null;
  };
};

export default ProtectedRoute;