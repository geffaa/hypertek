import React, { useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      text: "Hey Peter, we've got a new user research opportunity for you. Atom from The Mayor's Office is looking for people like you.",
      time: "1 month ago"
    },
    {
      id: 2,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      text: "Hey Peter, we've got a new user research opportunity for you. Nail is looking for people like you.",
      time: "1 month ago"
    },
    {
      id: 3,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
      text: "Hey Peter, we've got a new user research opportunity for you. Nail is looking for people like you.",
      time: "1 month ago"
    },
    {
      id: 4,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
      text: "Hey Peter, we've got a new user research opportunity for you. Nail is looking for people like you.",
      time: "1 month ago"
    },
    {
      id: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
      text: "Hey Peter, we've got a new user research opportunity for you. Nail is looking for people like you.",
      time: "1 month ago"
    },
    {
      id: 6,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
      text: "Hey Peter, we've got a new user research opportunity for you. Nail is looking for people like you.",
      time: "1 month ago"
    }
  ]);

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Notifications</h1>
      </header>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="relative  border-b border-gray-800 rounded-lg p-4 hover:bg-gray-850 transition-colors"
            >
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center overflow-hidden">
                    <img
                      src={notification.avatar}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">
                    {notification.text}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {notification.time}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-gray-500 hover:text-white transition-colors ml-2"
                  aria-label="Dismiss notification"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Dropdown */}


        {/* Mark All as Read Button */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={markAllAsRead}
            className="border border-gray-700 text-gray-300 text-sm px-6 py-2 rounded hover:bg-gray-900 transition-colors"
          >
            Mark all as read
          </button>

          {/* Arrow Button */}
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}