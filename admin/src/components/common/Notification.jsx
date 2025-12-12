// components/common/NotificationDropdown.jsx
import { useEffect, useRef } from 'react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Sample notification data
  const notifications = [
    {
      id: 1,
      title: "New Collection Created",
      message: "A new collection 'Digital Art' has been created",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "Transaction Completed",
      message: "Transaction #12345 has been completed successfully",
      time: "5 hours ago",
      read: false
    },
    {
      id: 3,
      title: "System Update",
      message: "The system will undergo maintenance tomorrow at 2 AM",
      time: "1 day ago",
      read: true
    },
    {
      id: 4,
      title: "New User Registration",
      message: "User 'John Doe' has registered on the platform",
      time: "2 days ago",
      read: true
    }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
      style={{ top: '100%' }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-gray-800 font-semibold">Notifications</h3>
          <button className="text-blue-500 text-sm hover:text-blue-600">
            Mark all as read
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-gray-800 font-medium text-sm">{notification.title}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.time}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        )}
      </div>
      
      <div className="p-2 bg-gray-50 text-center">
        <button className="text-blue-500 text-sm hover:text-blue-600">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;