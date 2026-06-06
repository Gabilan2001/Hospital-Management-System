import { useAuth } from '../../hooks/useAuth';

const ReceptionProfile = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="card space-y-3">
        <p><span className="text-gray-500">Name:</span> {user?.name}</p>
        <p><span className="text-gray-500">Email:</span> {user?.email}</p>
        <p><span className="text-gray-500">Role:</span> Receptionist</p>
      </div>
    </div>
  );
};

export default ReceptionProfile;
