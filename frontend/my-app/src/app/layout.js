import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}