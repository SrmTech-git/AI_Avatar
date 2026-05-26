import { useState, useRef, useEffect } from 'react';
import { Face } from './Face';
import { chat } from './chat';
import type { ChatMessage, ExpressionCode, GazeCode } from './types';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expression, setExpression] = useState<ExpressionCode>('A1');
  const [gaze, setGaze] = useState<GazeCode>('G1');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // While the model thinks, the avatar visibly thinks too.
    setExpression('A3');
    setGaze('G2');

    try {
      const response = await chat(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.dialogue }]);
      setExpression(response.expression);
      setGaze(response.gaze);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setExpression('A14');
      setGaze('G1');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="face-area">
        <div className="face-breath" aria-hidden="true" />
        <div className="face-wrapper" key={`${expression}-${gaze}`}>
          <Face expression={expression} gaze={gaze} size={260} />
        </div>
      </div>
      <div className="chat-area">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-hint">Say something to start the conversation.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message message-${m.role}`}>
              {m.content}
            </div>
          ))}
          {error && <div className="error">{error}</div>}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="input-area"
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            ref={textareaRef}
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Talk to the avatar..."
            disabled={isLoading}
            rows={2}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
