import { useState } from "react";

export function ChatMessage({ message, isStreaming = false }) {
  const [showSQLResult, setShowSQLResult] = useState(false);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatSQLResult = (result) => {
    if (!result) return "No result";

    if (result.result && Array.isArray(result.result)) {
      return JSON.stringify(result.result, null, 2);
    }

    if (result.msg) {
      return result.msg;
    }

    return JSON.stringify(result, null, 2);
  };

  // SQL MESSAGE
  if (message.isSQL) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">SQL Query</span>
          <span className="text-xs text-gray-500">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="bg-black rounded p-3 mb-3">
          <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
            {message.sql}
          </code>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSQLResult(!showSQLResult)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSQLResult ? "Hide Result" : "Show Result"}
          </button>

          {message.result?.viewLink && (
            <a
              href={message.result.viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View Full Result
            </a>
          )}
        </div>

        {showSQLResult && (
          <div className="mt-3 bg-white rounded p-3 border">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {formatSQLResult(message.result)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // IMAGE MESSAGE
  if (message.isImage) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <img
              src={message.url}
              alt="Generated output"
              className="w-full h-auto rounded"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            <div className="text-xs text-gray-500 mt-2">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEXT MESSAGE  
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? "order-1" : "order-2"}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 border shadow-sm"
          }`}
        >
          <div className="whitespace-pre-wrap">
            {message.content}

            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
            )}
          </div>
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
