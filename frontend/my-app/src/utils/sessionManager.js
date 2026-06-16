/**
 * Session management utilities for conversation memory
 */

const SESSION_STORAGE_KEY = 'doc_sessions';
const USER_ID_KEY = 'user_id';

/**
 * Generate a unique user ID for this browser session
 */
function getOrCreateUserId() {
  let userId = sessionStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Generate a unique session ID for a document
 */
export function generateSessionId(documentId) {
  const userId = getOrCreateUserId();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${userId}_${documentId.substring(0, 8)}_${timestamp}_${random}`;
}

/**
 * Get session ID for a document, creating one if it doesn't exist
 */
export function getOrCreateSessionId(documentId) {
  try {
    const userId = getOrCreateUserId();
    const sessions = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
    const sessionKey = `${userId}_${documentId}`;

    if (sessions[sessionKey]) {
      return sessions[sessionKey];
    }

    // Create new session
    const newSessionId = generateSessionId(documentId);
    sessions[sessionKey] = newSessionId;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));

    console.log(`Created new session for user ${userId}, document ${documentId}: ${newSessionId}`);
    return newSessionId;
  } catch (error) {
    console.error('Error managing session:', error);
    // Fallback: generate session ID without localStorage
    return generateSessionId(documentId);
  }
}

/**
 * Clear session for a specific document and user
 */
export function clearSession(documentId) {
  try {
    const userId = getOrCreateUserId();
    const sessions = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
    const sessionKey = `${userId}_${documentId}`;

    if (sessions[sessionKey]) {
      delete sessions[sessionKey];
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
      console.log(`Cleared session for user ${userId}, document ${documentId}`);
      return true;
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
  return false;
}

/**
 * Get all active sessions (for debugging)
 */
export function getAllSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '{}');
  } catch (error) {
    console.error('Error getting sessions:', error);
    return {};
  }
}

/**
 * Clear all sessions (for debugging/reset)
 */
export function clearAllSessions() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(USER_ID_KEY);
    console.log('Cleared all sessions and user ID');
    return true;
  } catch (error) {
    console.error('Error clearing all sessions:', error);
    return false;
  }
}