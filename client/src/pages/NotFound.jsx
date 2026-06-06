import { Link } from 'react-router-dom';
import { Hospital } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Hospital size={64} className="mx-auto text-primary-700 mb-4" />
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-2">Page not found</p>
      <Link to="/login" className="btn-primary inline-block mt-6">Go to Login</Link>
    </div>
  </div>
);

export default NotFound;
