async function _ensureOk(response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}

export async function createNewChat() {
  const response = await fetch('/api/chat/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create new chat: ${error}`);
  }

  const data = await response.json();
  const chatid = data?.chatid;
  console.log('NEW CHATID =', chatid);

  // Use the chatid returned from the server
  if (chatid) {
    return chatid;
  }

  throw new Error('No chatid found in response');
}

export async function getChatMessages(chatid, debug = true, timestamp) {
  const params = new URLSearchParams({
    chatid,
    debug: debug.toString(),
  });

  if (timestamp) {
    params.append('timestamp', timestamp);
  }

  const response = await fetch(`/api/chat/messages?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get chat messages: ${error}`);
  }

  return await response.json();
}

export async function sendMessage(question, chatid, callbacks) {
  // Diagnostic: create a new chat and print it (for verification)
  let diagnosticChatId;
  try {
    diagnosticChatId = await createNewChat();
  } catch (e) {
    console.warn('Diagnostic createNewChat failed:', e?.message || e);
  }

  console.log('Diagnostic chat id:', diagnosticChatId);
  console.log('sendMessage called with saved chatid:', chatid);

  // Validate provided chatid
  if (!chatid || chatid === 'undefined' || chatid === 'null' || chatid === '') {
    console.error('❌ ERROR: chatid is missing — cannot ask questions');
    callbacks?.onError?.('chatid is missing — cannot ask questions');
    return;
  }

  // If diagnostic id exists, log whether it matches the saved chatid
  if (diagnosticChatId && diagnosticChatId !== chatid) {
    console.warn('Diagnostic chatid does not match saved chatid:', { diagnosticChatId, chatid });
  }

  // Helper that performs the ask request and returns { ok, status, text }
  async function performAsk(useChatId) {
    const resp = await fetch('/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chatid: useChatId, debug: true }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { ok: false, status: resp.status, text };
    }

    // stream response
    const reader = resp.body?.getReader();
    if (!reader) {
      return { ok: false, status: resp.status, text: 'No response body' };
    }

    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.isText) callbacks?.onText?.(data.content);
              else if (data.isSQL) callbacks?.onSQL?.(data);
              else if (data.isImage) callbacks?.onImage?.(data);
              else if (data.isExecutionStatus) callbacks?.onExecutionStatus?.(data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      callbacks?.onEnd?.();
      return { ok: true, status: resp.status, text: 'stream completed' };
    } catch (e) {
      callbacks?.onError?.(`Stream error: ${e}`);
      return { ok: false, status: resp.status, text: `Stream error: ${e}` };
    } finally {
      try { reader.releaseLock(); } catch (e) {}
    }
  }

  // First attempt
  let finalResult = await performAsk(chatid);

  // If failure indicates chat doesn't exist, try recovery once
  if (!finalResult.ok && typeof finalResult.text === 'string' && finalResult.text.includes('Chat does not exist')) {
    console.warn('Chat not found. Creating a new chat and retrying...');
    try {
      const newChatId = await createNewChat();
      console.log('Retrying with new chat id =', newChatId);
      finalResult = await performAsk(newChatId);
      // update chatid variable locally to reflect used id
      chatid = newChatId;
    } catch (e) {
      console.error('Failed to create new chat during recovery:', e?.message || e);
    }
  }

  // Final logging per requirement
  console.log('ChatID used:', chatid);
  console.log('Ask response:', finalResult);
}
