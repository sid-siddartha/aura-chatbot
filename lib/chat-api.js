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
  return data.chatid;
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
  const response = await fetch('/api/chat/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      chatid,
      debug: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    callbacks?.onError?.(error);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    callbacks?.onError?.('No response body');
    return;
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.isText) {
              callbacks?.onText?.(data.content);
            } else if (data.isSQL) {
              callbacks?.onSQL?.(data);
            } else if (data.isImage) {
              callbacks?.onImage?.(data);
            } else if (data.isExecutionStatus) {
              callbacks?.onExecutionStatus?.(data);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }

    callbacks?.onEnd?.();
  } catch (error) {
    callbacks?.onError?.(`Stream error: ${error}`);
  } finally {
    reader.releaseLock();
  }
}
