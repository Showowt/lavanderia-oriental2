'use client';

import { useState, useEffect } from 'react';
import { useRealtimeNotifications, useNotificationPermission } from '@/hooks/useRealtime';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useRealtimeNotifications();
  const { permission, requestPermission } = useNotificationPermission();
  const [isOpen, setIsOpen] = useState(false);

  // Request notification permission on first interaction
  useEffect(() => {
    if (permission === 'default') {
      // Will request on first user interaction
    }
  }, [permission]);

  const handleBellClick = async () => {
    if (permission === 'default') {
      await requestPermission();
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      markAsRead();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-strong border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notificaciones</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-slate-500 hover:text-brand-600"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No hay notificaciones</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Las actualizaciones aparecerán aquí en tiempo real
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((notification, index) => (
                    <li
                      key={notification.id as string || index}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon based on type */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'escalation' ? 'bg-error-100 text-error-600' :
                          notification.type === 'order' ? 'bg-brand-100 text-brand-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {notification.type === 'escalation' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          {notification.type === 'order' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          )}
                          {notification.type === 'system' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {notification.title as string}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {notification.message as string}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Ahora
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {permission === 'default' && (
              <div className="px-4 py-3 bg-brand-50 border-t border-brand-100">
                <button
                  onClick={requestPermission}
                  className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Activar notificaciones del navegador
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
