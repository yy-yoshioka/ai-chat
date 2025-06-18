import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
            <p className="text-gray-600">Unable to load user profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-4xl mx-auto py-16 px-6 text-center">
            {/* Avatar */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">{userProfile.name}</h1>
            <p className="text-xl text-blue-100 mb-4">{userProfile.email}</p>

            {/* Role Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {userProfile.isAdmin ? 'Administrator' : 'User'}
            </div>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-opacity-30 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg
                      className="w-6 h-6 mr-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Account Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        <p className="text-gray-900 font-medium">{userProfile.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p className="text-gray-900 font-medium">{userProfile.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Account Type
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${userProfile.isAdmin ? 'bg-purple-500' : 'bg-green-500'}`}
                        ></div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            userProfile.isAdmin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {userProfile.isAdmin ? 'Administrator' : 'Standard User'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Member Since
                      </label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-900 font-medium">
                          {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg
                      className="w-6 h-6 mr-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Quick Actions
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <Link
                    href="/chat"
                    className="group flex items-center w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg mr-4">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Start Chat</div>
                      <div className="text-sm text-blue-100">Begin a new conversation</div>
                    </div>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  <Link
                    href="/widgets"
                    className="group flex items-center w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg mr-4">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Manage Widgets</div>
                      <div className="text-sm text-green-100">Configure chat widgets</div>
                    </div>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  <Link
                    href="/faq"
                    className="group flex items-center w-full p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg mr-4">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">View FAQ</div>
                      <div className="text-sm text-purple-100">Get answers & help</div>
                    </div>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Stats Card */}
              <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"
                      />
                    </svg>
                    Account Stats
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">Active</div>
                      <div className="text-sm text-blue-600">Account Status</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(
                          (Date.now() - new Date(userProfile.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </div>
                      <div className="text-sm text-green-600">Days Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
