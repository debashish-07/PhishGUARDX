
// Privacy and Offline Mode Utilities

const OFFLINE_MODE_KEY = 'pd_offline_mode';

export function isOfflineMode(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(OFFLINE_MODE_KEY) === '1';
}

export function enableOfflineMode(enable: boolean): void {
    if (typeof window === 'undefined') return;
    if (enable) {
        localStorage.setItem(OFFLINE_MODE_KEY, '1');
    } else {
        localStorage.removeItem(OFFLINE_MODE_KEY);
    }
}

export function shouldBlockNetworkCall(): boolean {
    return isOfflineMode();
}
