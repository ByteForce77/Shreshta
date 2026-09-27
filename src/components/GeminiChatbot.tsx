import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MapPin,
  ExternalLink,
  Bot,
  User,
  Zap,
  Brain,
  Compass,
  Trash2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mapPlaces?: { title?: string; uri?: string }[];
  modelUsed?: string;
  timestamp: string;
}

export const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState<'fast' | 'general' | 'complex'>('general');
  const [enableMaps, setEnableMaps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Namaste! I am your Polumati's Shreshta™ AI Concierge. I can help you with traditional cold-pressed oil benefits, Navaratnalu grain nutrition, culinary smoke points, or find nearby agro stores & mills with Google Maps data. How can I assist your family today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Model name mapping based on prompt specification
  const getModelName = (type: 'fast' | 'general' | 'complex', maps: boolean) => {
    if (maps) return 'gemini-3.5-flash';
    if (type === 'complex') return 'gemini-3.1-pro-preview';
    if (type === 'fast') return 'gemini-3.1-flash-lite';
    return 'gemini-3.5-flash';
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || loading) return;

    // Auto-enable Maps Grounding if query is asking for locations/stores/mills
    const isLocationQuery =
      /store|shop|mill|market|near|nearby|location|bhimavaram|hyderabad|vijayawada|vizag|bangalore|address|outlet/i.test(
        promptToSend
      );

    const useMaps = enableMaps || isLocationQuery;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setErrorMessage(null);

    try {
      // Get user coordinates if available
      let userLocation: { latitude: number; longitude: number } | undefined;
      if (useMaps && 'geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          userLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch {
          // fallback to default coordinates
        }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          model: getModelName(modelType, useMaps),
          enableMaps: useMaps,
          userLocation,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'I could not generate an answer right now. Please try again.',
        mapPlaces: data.mapPlaces || [],
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setErrorMessage(err.message || 'Failed to reach AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: "Chat cleared. What else would you like to know about Polumati's Shreshta cold-pressed oils or Navaratnalu grains?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 rounded-full bg-[#0b301c] hover:bg-[#14482c] text-[#D4AF37] shadow-xl border-2 border-[#D4AF37]/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        title="Ask Shreshta AI Concierge & Store Finder"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-2">
          Ask Shreshta AI
        </span>
      </button>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[90vh] sm:h-[680px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            {/* Header */}
            <div className="bg-[#0b301c] text-white p-4 shrink-0 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/60 bg-[#072415] flex items-center justify-center text-[#D4AF37] shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold font-serif text-white">
                      Shreshta AI Concierge
                    </h3>
                    <span className="text-[9px] font-bold bg-[#D4AF37] text-[#0b301c] px-1.5 py-0.2 rounded-full">
                      Google Maps Grounded
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300">
                    Traditional Cold Pressed & Agro Nutrition Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Model & Tool Mode Selector Bar */}
            <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 flex items-center justify-between gap-2 text-xs">
              {/* Model Tabs */}
              <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg">
                <button
                  onClick={() => setModelType('fast')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    modelType === 'fast'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Uses gemini-3.1-flash-lite for rapid answers"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Fast (Lite)</span>
                </button>

                <button
                  onClick={() => setModelType('general')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    modelType === 'general'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Uses gemini-3.5-flash for general tasks and Maps"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>General (3.5 Flash)</span>
                </button>

                <button
                  onClick={() => setModelType('complex')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    modelType === 'complex'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Uses gemini-3.1-pro-preview for deep Ayurvedic nutrition"
                >
                  <Brain className="w-3 h-3 text-purple-600" />
                  <span>Ayurveda Pro</span>
                </button>
              </div>

              {/* Maps Grounding Toggle */}
              <button
                onClick={() => setEnableMaps(!enableMaps)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  enableMaps
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
                title="Uses Google Maps tool to retrieve real-world locations"
              >
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Maps Grounding</span>
              </button>
            </div>

            {/* Scrollable Chat Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#F8F9FA]">
              {messages.map((m) => {
                const isUser = m.role === 'user';

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isUser
                          ? 'bg-stone-800 text-white'
                          : 'bg-[#0b301c] text-[#D4AF37] border border-[#D4AF37]/40'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'text-right' : ''}`}>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed text-left whitespace-pre-line shadow-xs ${
                          isUser
                            ? 'bg-[#0b301c] text-white rounded-tr-xs'
                            : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                        }`}
                      >
                        {m.text}

                        {/* Interactive Google Maps Place Cards */}
                        {m.mapPlaces && m.mapPlaces.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5">
                            <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>Verified Google Maps Locations</span>
                            </div>
                            <div className="space-y-1">
                              {m.mapPlaces.map((place, idx) => (
                                <a
                                  key={idx}
                                  href={place.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100/70 text-blue-900 text-xs font-semibold flex items-center justify-between transition-colors group cursor-pointer"
                                >
                                  <span className="truncate max-w-[240px]">
                                    {place.title || 'View on Google Maps'}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-blue-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[9px] text-stone-400 px-1">
                        <span>{m.timestamp}</span>
                        {m.modelUsed && <span>• {m.modelUsed}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0b301c] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-white border border-stone-200 rounded-2xl rounded-tl-xs text-xs text-stone-500 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#0b301c] border-t-transparent rounded-full animate-spin" />
                    <span>
                      {enableMaps ? 'Searching Google Maps data & recipes...' : 'Consulting Shreshta knowledge...'}
                    </span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-1.5 bg-stone-100 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => handleSendMessage('Find cold pressed oil mills and organic stores in Bhimavaram')}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shrink-0 text-stone-700 font-medium transition-colors"
              >
                📍 Find Stores in Bhimavaram
              </button>
              <button
                onClick={() => handleSendMessage('What are the health benefits of Vaagai wood-pressed sesame oil?')}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shrink-0 text-stone-700 font-medium transition-colors"
              >
                🌿 Benefits of Sesame Oil
              </button>
              <button
                onClick={() => handleSendMessage('Explain the 9 sacred grains in the Navaratnalu family kit')}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shrink-0 text-stone-700 font-medium transition-colors"
              >
                🌾 Navaratnalu Grains
              </button>
              <button
                onClick={() => handleSendMessage('Which oil has the highest smoke point for deep frying?')}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg shrink-0 text-stone-700 font-medium transition-colors"
              >
                🍳 Best Oil for Frying
              </button>
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  enableMaps
                    ? 'Search stores, markets, or locations...'
                    : 'Ask about oils, nutrition, ayurveda, recipes...'
                }
                className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0b301c] focus:bg-white"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-[#0b301c] hover:bg-[#154c2d] disabled:opacity-40 text-[#D4AF37] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
