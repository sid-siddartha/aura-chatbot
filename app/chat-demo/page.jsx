'use client';

import { useState, useEffect, useRef } from 'react';
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
      setCurrentChatId(chatId);
      
      // Load existing messages
      const existingMessages = await getChatMessages(chatId);
      setMessages(existingMessages.reverse()); // Reverse to show chronological order
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const handleSendMessage = async (content) => {
    if (!currentChatId || isStreaming) return;

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
          setStreamingContent(prev => {
            const newContent = prev + text;
            streamingContentRef.current = newContent;
            return newContent;
          });
        },
        onSQL: (data) => {
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
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Chat
        </button>
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
    </div>
  );
}
