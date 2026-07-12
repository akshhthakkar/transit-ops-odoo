import { useAuthStore } from '../../store/auth.store';

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-sm font-medium text-gray-400">
        Fleet Operations Management
      </h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-gray-300">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
