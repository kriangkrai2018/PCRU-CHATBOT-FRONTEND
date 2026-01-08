/**
 * WebSocket Configuration
 * Centralized configuration for WebSocket connections across the application
 */

/**
 * Get WebSocket base URL from axios instance or environment variables
 * @param {Object} axios - Axios instance (optional)
 * @returns {string} WebSocket base URL
 */
export function getWebSocketBaseUrl(axios = null) {
  const baseURL = axios?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL;
  // Remove trailing slash if present before converting to ws protocol
  const cleanUrl = baseURL.replace(/\/$/, '');
  return cleanUrl.replace(/^http/, 'ws');
}

/**
 * Get full WebSocket URL for a specific endpoint
 * @param {string} endpoint - WebSocket endpoint path (e.g., '/ws/feedbacks')
 * @param {Object} axios - Axios instance (optional)
 * @returns {string} Full WebSocket URL
 */
export function getWebSocketUrl(endpoint, axios = null) {
  const baseUrl = getWebSocketBaseUrl(axios);
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * WebSocket endpoints configuration
 */
export const WS_ENDPOINTS = {
  FEEDBACKS: '/ws/feedbacks',
  CHAT_LOGS: '/ws/chat-logs',
  CATEGORIES: '/ws/categories',
  KEYWORDS: '/ws/keywords',
  QUESTIONS_ANSWERS: '/ws/questions-answers',
  USERS: '/ws/users',
  ORGANIZATIONS: '/ws/organizations',
};

/**
 * WebSocket reconnection configuration
 */
export const WS_CONFIG = {
  RECONNECT_DELAY: 3000, // milliseconds
  MAX_RECONNECT_ATTEMPTS: 5, // -1 for unlimited
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
};

/**
 * Create a WebSocket connection with automatic reconnection
 * @param {string} endpoint - WebSocket endpoint
 * @param {Object} options - Configuration options
 * @param {Function} options.onMessage - Message handler
 * @param {Function} options.onOpen - Open handler
 * @param {Function} options.onClose - Close handler
 * @param {Function} options.onError - Error handler
 * @param {Object} options.axios - Axios instance
 * @param {boolean} options.autoReconnect - Enable auto-reconnect (default: true)
 * @returns {Object} WebSocket connection object with control methods
 */
export function createWebSocketConnection(endpoint, options = {}) {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    axios = null,
    autoReconnect = true,
  } = options;

  let ws = null;
  let reconnectAttempts = 0;
  let reconnectTimeout = null;
  let heartbeatInterval = null;
  let isIntentionallyClosed = false;

  let url = getWebSocketUrl(endpoint, axios);

  // Defensive scheme handling: if page is not secure but URL uses wss, downgrade to ws to avoid blocking.
  if (typeof window !== 'undefined') {
    if (url.startsWith('wss://') && window.location.protocol !== 'https:') {
      console.warn('WebSocket URL uses wss but page is not secure; downgrading to ws://', url);
      url = url.replace(/^wss:\/\//i, 'ws://');
    }
    // If page is secure but URL uses ws, try to upgrade to wss to match the page
    if (url.startsWith('ws://') && window.location.protocol === 'https:') {
      console.warn('WebSocket URL uses ws but page is secure; upgrading to wss://', url);
      url = url.replace(/^ws:\/\//i, 'wss://');
    }
  }

  function connect() {
    try {
      ws = new WebSocket(url);

      ws.onopen = (event) => {
        console.log(`WebSocket connected: ${endpoint}`);
        reconnectAttempts = 0;
        
        // Start heartbeat
        if (WS_CONFIG.HEARTBEAT_INTERVAL > 0) {
          heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, WS_CONFIG.HEARTBEAT_INTERVAL);
        }

        if (onOpen) onOpen(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong response
          if (data.type === 'pong') return;
          
          if (onMessage) onMessage(data, event);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error: ${endpoint}`, error);
        if (onError) onError(error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${endpoint}`);
        
        // Clear heartbeat
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }

        if (onClose) onClose(event);

        // Auto-reconnect if not intentionally closed
        if (!isIntentionallyClosed && autoReconnect) {
          const maxAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS;
          if (maxAttempts === -1 || reconnectAttempts < maxAttempts) {
            reconnectAttempts++;
            console.log(`Reconnecting... (attempt ${reconnectAttempts})`);
            reconnectTimeout = setTimeout(connect, WS_CONFIG.RECONNECT_DELAY);
          } else {
            console.log('Max reconnection attempts reached');
          }
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      if (onError) onError(error);
    }
  }

  function disconnect() {
    isIntentionallyClosed = true;
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    
    if (ws) {
      ws.close();
      ws = null;
    }
  }

  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }

  function getState() {
    return ws ? ws.readyState : WebSocket.CLOSED;
  }

  function isConnected() {
    return ws && ws.readyState === WebSocket.OPEN;
  }

  // Start connection
  connect();

  return {
    disconnect,
    send,
    getState,
    isConnected,
    get ws() { return ws; },
  };
}
