"use client";

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-sm text-gray-900">{session.user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
        </div>
        {session.user.company && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <p className="mt-1 text-sm text-gray-900">{session.user.company}</p>
          </div>
        )}
        {session.user.subscriptionPlan && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Subscription Plan</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{session.user.subscriptionPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
} 