'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertSystem } from '../utils/alertSystem';

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setAlerts(AlertSystem.getAlerts(20));
    
    const unsubscribe = AlertSystem.subscribe((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClear = () => {
    if (confirm('Clear all alerts?')) {
      AlertSystem.clearAlerts();
      setAlerts([]);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default: return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] border border-cyan-500/30 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-cyan-400">🔔 Alert Center</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No alerts yet
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold uppercase">
                        {alert.type.replace('-', ' ')}
                      </span>
                      <span className="text-xs">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <p className="text-xs font-mono truncate">{alert.url}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
