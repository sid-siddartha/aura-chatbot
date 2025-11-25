// Global session store
// Maps numeric chatid -> session code
const sessionMap = new Map();
let nextChatId = 1;

export function createSession(code) {
  const chatid = `${nextChatId++}`;
  sessionMap.set(chatid, code);
  
  // Keep map size manageable (max 1000 sessions)
  if (sessionMap.size > 1000) {
    const firstKey = sessionMap.keys().next().value;
    sessionMap.delete(firstKey);
  }
  
  return chatid;
}

export function getSessionCode(chatid) {
  return sessionMap.get(chatid);
}

export function deleteSession(chatid) {
  sessionMap.delete(chatid);
}
