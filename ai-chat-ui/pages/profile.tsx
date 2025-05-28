import { withAuth } from '../lib/withAuth';
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {user && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">User Information</h2>
            <p className="mt-2">
              <span className="font-medium">ID:</span> {user.id}
            </p>
            <p>
              <span className="font-medium">Name:</span> {user.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Protect this page with authentication
export default withAuth(ProfilePage);
