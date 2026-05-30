import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 400);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      transition-all duration-400 ease-out
      ${isVisible
        ? 'bg-black bg-opacity-50 backdrop-blur-sm'
        : 'bg-black bg-opacity-0 backdrop-blur-0'
      }
    `}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`
        relative bg-gradient-to-br from-[#1c1c1c] to-[#2d2d2d] 
        text-white p-6 md:p-8 rounded-2xl max-w-[90%] sm:max-w-sm w-full mx-auto
        transform transition-all duration-500 ease-out
        border border-gray-700 shadow-2xl
        ${isVisible
          ? 'scale-100 opacity-100 translate-y-0 rotate-0'
          : 'scale-0 opacity-0 translate-y-8 rotate-2'
        }
      `}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 w-8 h-8 rounded-full 
            bg-gray-700 hover:bg-gray-600 flex items-center justify-center
            transition-all duration-200 ease-in-out
            transform hover:scale-110 active:scale-95
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {/* Animated Icon */}
          <div className={`
            w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 
            rounded-full flex items-center justify-center mx-auto mb-6
            transform transition-all duration-700 ease-out
            shadow-lg
            ${isVisible
              ? 'scale-100 rotate-0'
              : 'scale-0 rotate-45'
            }
          `}>
            <svg
              className="w-8 h-8 text-white transform transition-transform duration-300 hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold mb-3 text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {t("dashboard.logout.title","Confirm Logout")}
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            {t("dashboard.logout.message","Are you sure you want to logout from your account?")}
          </p>

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onClose}
              className="
                px-8 py-3 bg-gray-600 rounded-xl hover:bg-gray-500
                transition-all duration-300 ease-out
                transform hover:scale-105 active:scale-95
                border border-gray-500 font-medium
                shadow-lg hover:shadow-xl
              "
            >
              {t("dashboard.logout.cancel","Cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="
                px-8 py-3 bg-gradient-to-r from-red-600 to-red-700
                rounded-xl hover:from-red-500 hover:to-red-600
                transition-all duration-300 ease-out
                transform hover:scale-105 active:scale-95
                border border-red-500 font-medium
                shadow-lg hover:shadow-xl
              "
            >
              {t("dashboard.logout.confirm","Logout")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;