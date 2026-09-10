import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, User, Trash2, Plus, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivities } from '@/hooks/useActivities';
import { LoadingSpinner } from '@/components/ui/Common';
import { AddActivityModal } from '@/components/AddActivityModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateFitAIResponse, QUICK_QUESTIONS, type FitAIActivitySuggestion } from '@/services/fitAIService';
import type { ActivityType, ChatMessage } from '@/types';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestion?: FitAIActivitySuggestion;
  isSafetyWarning?: boolean;
}

const WELCOME_MESSAGE: DisplayMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm FitAI, your friendly AI companion for fitness, sports and healthy activity habits. I can suggest workouts, help with sports practice, track your progress, and keep you motivated. How can I help you today?",
};

export function FitAIPage() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { activities, saveActivity } = useActivities();
  const [messages, setMessages] = useState<DisplayMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<{ type?: ActivityType; duration?: number }>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Load chat history from Supabase
  useEffect(() => {
    if (!profile || !isSupabaseConfigured) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data && data.length > 0) {
        const loaded: DisplayMessage[] = (data as ChatMessage[]).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.message,
        }));
        setMessages(loaded);
        historyRef.current = loaded.map((m) => ({ role: m.role, content: m.content }));
      }
    })();
  }, [profile]);

  const saveChatMessage = async (role: 'user' | 'assistant', message: string) => {
    if (!profile || !isSupabaseConfigured) return;
    await supabase.from('chat_messages').insert({
      user_id: profile.id,
      role,
      message,
    });
  };

  const handleSend = async (text?: string) => {
    const message = text ?? input.trim();
    if (!message || loading) return;

    setInput('');
    const userMsg: DisplayMessage = { id: `u-${Date.now()}`, role: 'user', content: message };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: message });
    await saveChatMessage('user', message);

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const response = generateFitAIResponse(message, { profile, recentActivities: activities }, historyRef.current);
    const assistantMsg: DisplayMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.text,
      suggestion: response.suggestion,
      isSafetyWarning: response.isSafetyWarning,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    historyRef.current.push({ role: 'assistant', content: response.text });
    await saveChatMessage('assistant', response.text);
    setLoading(false);
  };

  const handleClearChat = async () => {
    if (!profile || !isSupabaseConfigured) {
      setMessages([WELCOME_MESSAGE]);
      historyRef.current = [];
      return;
    }
    await supabase.from('chat_messages').delete().eq('user_id', profile.id);
    setMessages([WELCOME_MESSAGE]);
    historyRef.current = [];
  };

  const handleAddToPlan = (suggestion: FitAIActivitySuggestion) => {
    setModalDefaults({ type: suggestion.activityType, duration: suggestion.durationMinutes });
    setShowAddModal(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-8">
        <div className="card p-8 text-center">
          <Bot className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Complete your profile first</h2>
          <button onClick={() => navigate('/profile-setup')} className="btn-primary mt-2">
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">FitAI Assistant</h1>
            <p className="text-gray-500 text-sm">Your friendly AI companion for fitness, sports and healthy activity habits.</p>
          </div>
        </div>
        <span className="badge-pill bg-secondary-100 text-secondary-700">FitAI • General Fitness Assistant</span>
      </div>

      {/* Chat container */}
      <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex flex-col gap-2'}`}>
                <div className={`rounded-2xl p-3.5 text-sm whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : msg.isSafetyWarning
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                }`}>
                  {msg.isSafetyWarning && <AlertTriangle className="w-5 h-5 mb-2 text-red-500" />}
                  {msg.content}
                </div>
                {/* Add to My Plan button */}
                {msg.suggestion && msg.role === 'assistant' && (
                  <button
                    onClick={() => handleAddToPlan(msg.suggestion!)}
                    className="btn-primary text-xs flex items-center gap-1.5 self-start px-3 py-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to My Plan
                    <span className="flex items-center gap-0.5 ml-1 opacity-80">
                      <Zap className="w-3 h-3" />{msg.suggestion.pointsEstimate}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions — tap to ask:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 p-3 flex gap-2 items-center">
          <button
            onClick={handleClearChat}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about fitness activities, plans, tips..."
            className="input-field flex-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-3 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        FitAI provides general fitness guidance only — not medical advice. Consult a healthcare professional for specific health concerns.
      </p>

      <AddActivityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={saveActivity}
        defaultType={modalDefaults.type}
        defaultDuration={modalDefaults.duration}
      />
    </div>
  );
}
