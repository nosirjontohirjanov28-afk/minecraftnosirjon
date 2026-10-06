import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/minecraft';
import { Send, MessageSquare } from 'lucide-react';
import { sound } from '../services/soundEngine';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onToggleChat: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onToggleChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    sound.playChatPing();
  };

  return (
    <div className="absolute bottom-28 left-4 z-20 w-[360px] max-w-[85vw] pointer-events-auto">
      {/* Messages Scroll Area */}
      <div
        className={`p-2.5 space-y-1.5 transition-all rounded-sm overflow-y-auto max-h-[160px] ${
          isOpen
            ? 'bg-black/85 border border-stone-800 shadow-xl'
            : 'bg-black/40 hover:bg-black/60 pointer-events-none'
        }`}
      >
        {messages.slice(-10).map((msg) => (
          <div
            key={msg.id}
            className={`font-pixel text-xs leading-relaxed ${
              msg.isHorrorWarning
                ? 'text-red-400 font-bold animate-pulse'
                : msg.isSystem
                ? 'text-amber-400'
                : 'text-stone-200'
            }`}
          >
            <span className="text-stone-500 mr-1.5">[{msg.time}]</span>
            <span
              className={`font-bold mr-1.5 ${
                msg.isHorrorWarning
                  ? 'text-red-500'
                  : msg.rank === 'VIP'
                  ? 'text-emerald-400'
                  : msg.rank === 'ADMIN'
                  ? 'text-rose-400'
                  : 'text-cyan-400'
              }`}
            >
              &lt;{msg.sender}&gt;
            </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      {isOpen ? (
        <form onSubmit={handleSubmit} className="mt-1 flex items-center gap-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Xabar yoki buyruq yozing (/help, /lucky, /bloodmoon)..."
            className="flex-1 bg-black/90 border border-stone-700 px-3 py-1.5 font-pixel text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <button
            type="submit"
            className="mc-button mc-button-green p-1.5 text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <button
          onClick={onToggleChat}
          className="mt-1 mc-button px-2.5 py-1 font-pixel text-[11px] text-stone-300 flex items-center gap-1.5 opacity-70 hover:opacity-100"
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Chatni Ochish (T)</span>
        </button>
      )}
    </div>
  );
};
