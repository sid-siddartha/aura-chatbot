'use client';

import { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { createNewChat, sendMessage, getChatMessages } from '@/lib/chat-api';

export default function ChatDemo() {
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [executingFunctions, setExecutingFunctions] = useState(new Set());
  const messagesEndRef = useRef(null);
  const streamingContentRef = useRef('');
  const [aydUrl, setAydUrl] = useState('');
  const [showAyd, setShowAyd] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const chatId = await createNewChat();
      console.log('Chat created with ID:', chatId);
      setCurrentChatId(chatId);
      
      // Load existing messages
      try {
        const existingMessages = await getChatMessages(chatId);
        console.log('Existing messages:', existingMessages);
        // Ensure messages is an array and reverse for chronological order
        const messagesArray = Array.isArray(existingMessages) ? existingMessages : (existingMessages?.messages || []);
        setMessages(messagesArray.reverse());
      } catch (error) {
        console.warn('Could not load existing messages:', error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const openAydChat = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/new', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.url) {
        setAydUrl(data.url);
        setShowAyd(true);
      } else {
        console.error('Failed to get AYD session URL', data);
        alert('Failed to open AYD chat session. See console.');
      }
    } catch (e) {
      console.error('Error opening AYD chat:', e);
      alert('Error opening AYD chat. See console.');
    }
  }, []);

  const handleSendMessage = async (content) => {
    if (!currentChatId || isStreaming) {
      console.log('Skipping send - currentChatId:', currentChatId, 'isStreaming:', isStreaming);
      return;
    }

    console.log('Sending message:', content, 'to chat:', currentChatId);

    // Add user message to UI
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';
    setExecutingFunctions(new Set());

    try {
      await sendMessage(content, currentChatId, {
        onText: (text) => {
          console.log('Received text:', text);
          setStreamingContent(prev => {
            const newContent = prev + text;
            streamingContentRef.current = newContent;
            return newContent;
          });
        },
        onSQL: (data) => {
          console.log('Received SQL:', data);
          const sqlMessage = {
            id: data.id || Date.now().toString(),
            role: 'system',
            content: '',
            timestamp: new Date().toISOString(),
            isSQL: true,
            sql: data.sql,
            result: data.result,
          };
          setMessages(prev => [...prev, sqlMessage]);
        },
        onImage: (data) => {
          console.log('Received image:', data);
          const imageMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isImage: true,
            url: data.url,
          };
          setMessages(prev => [...prev, imageMessage]);
        },
        onExecutionStatus: (data) => {
          console.log('Execution status:', data);
          if (data.status === 'started') {
            setExecutingFunctions(prev => new Set([...prev, data.functionName]));
          } else if (data.status === 'completed') {
            setExecutingFunctions(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.functionName);
              return newSet;
            });
          }
        },
        onEnd: () => {
          console.log('Stream ended');
          // 使用 ref 中的当前值，确保获取到最新的流式内容
          const currentContent = streamingContentRef.current;
          if (currentContent.trim()) {
            const assistantMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: currentContent,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
          setStreamingContent('');
          streamingContentRef.current = '';
          setIsStreaming(false);
          setExecutingFunctions(new Set());
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          setStreamingContent('');
          streamingContentRef.current = '';
          setIsStreaming(false);
          setExecutingFunctions(new Set());
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setStreamingContent('');
      streamingContentRef.current = '';
      setIsStreaming(false);
      setExecutingFunctions(new Set());
    }
  };

  const handleNewChat = async () => {
    await initializeChat();
    setMessages([]);
    setStreamingContent('');
    streamingContentRef.current = '';
    setIsStreaming(false);
    setExecutingFunctions(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Initializing chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          AskYourDatabase API Demo
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Chat
          </button>
          <button
            onClick={openAydChat}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Open AYD Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Streaming message */}
        {streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: new Date().toISOString(),
            }}
            isStreaming={isStreaming}
          />
        )}

        {/* Function execution indicators */}
        {executingFunctions.size > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>
              Executing: {Array.from(executingFunctions).join(', ')}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
        />
      </div>

      {/* AYD iframe modal */}
      {showAyd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-[90%] h-[80%] bg-white rounded shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
              <div className="text-sm font-medium">AskYourDatabase Chat</div>
              <div>
                <button
                  onClick={() => setShowAyd(false)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe src={aydUrl} className="w-full h-full border-0" />
          </div>
        </div>
      )}
    </div>
  );
}
