import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  User,
  AlertCircle,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

interface AskSaahajModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentView: (view: string) => void;
}

interface AssistantSource {
  id: string;
  title: string;
  date?: string;
  type?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingStatus?: 'grounded' | 'general' | 'insufficient_evidence';
  sources?: AssistantSource[];
  factsUsed?: string[];
  limitations?: string[];
  safetyNotice?: string | null;
  suggestedAction?: {
    label: string;
    view: string;
  };
}

export const AskSaahajModal: React.FC<AskSaahajModalProps> = ({ 
  isOpen, 
  onClose,
  setCurrentView 
}) => {
  const { userProfile } = useHealthData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "How does SAAHAJ work?",
    "What can I upload?",
    "What can SAAHAJ analyze?",
    "How is my health data handled?"
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextLoaded, setContextLoaded] = useState(false);

  // Fetch real authorized context on initial load
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function loadAssistantContext() {
      try {
        const res = await fetch('/api/v1/assistant/context', {
          headers: {
            'x-user-id': 'patient-user-primary',
            'x-user-role': 'patient'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (messages.length === 0) {
              setMessages([
                {
                  id: 'init-msg',
                  sender: 'assistant',
                  text: data.greeting || "Hello. I'm SAAHAJ. I can help explain your health records, reports, and supported assessments once you add or upload them.",
                  timestamp: 'Just now',
                  groundingStatus: data.has_data ? 'grounded' : 'general'
                }
              ]);
            }

            if (data.suggested_prompts && data.suggested_prompts.length > 0) {
              setSuggestedPrompts(data.suggested_prompts);
            }
            setContextLoaded(true);
          }
        } else {
          throw new Error('Context request failed');
        }
      } catch {
        if (isMounted && messages.length === 0) {
          setMessages([
            {
              id: 'init-msg',
              sender: 'assistant',
              text: "Hello. I'm SAAHAJ. I can help explain your health records, reports, and supported assessments once you add or upload them.",
              timestamp: 'Just now',
              groundingStatus: 'general'
            }
          ]);
          setContextLoaded(true);
        }
      }
    }

    loadAssistantContext();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isGenerating) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/v1/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'patient-user-primary',
          'x-user-role': 'patient'
        },
        body: JSON.stringify({
          message: text,
          scope: 'patient'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingStatus: data.grounding_status,
          sources: data.sources || [],
          factsUsed: data.facts_used || [],
          limitations: data.limitations || [],
          safetyNotice: data.safety_notice,
          suggestedAction: data.suggested_action
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(`Query failed: ${response.statusText}`);
      }
    } catch {
      // Deterministic fallback message
      const fallbackMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: "I was unable to retrieve a response from the service. If you have uploaded documents or vitals, you can also view them directly in your Health Overview or Workspace.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingStatus: 'insufficient_evidence'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#1A1916] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/15 shadow-2xl overflow-hidden flex flex-col h-[640px]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 flex items-center justify-between bg-[#F5F2ED] dark:bg-[#201E1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#1A1A1A] dark:border-[#EAE5DD] bg-[#FFFFFF] dark:bg-[#151412] flex items-center justify-center text-[#1A1A1A] dark:text-[#EAE5DD]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-lg italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                  SAAHAJ Health Intelligence
                </h3>
                <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-2 py-0.5 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 bg-[#ECE8E1] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#EAE5DD]">
                  EVIDENCE-GROUNDED
                </span>
              </div>
              <p className="text-[11px] font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Grounded strictly in your authorized medical records & reference clinical literature
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 hover:bg-[#ECE8E1] dark:hover:bg-[#282622] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Pane */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FFFFFF] dark:bg-[#1A1916]">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 border border-[#1A1A1A] dark:border-[#EAE5DD] bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 text-xs sm:text-sm space-y-2.5 leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-[#1A1A1A] text-[#F5F2ED] border-[#1A1A1A] dark:bg-[#EAE5DD] dark:text-[#151412] dark:border-[#EAE5DD]'
                    : 'bg-[#F5F2ED] dark:bg-[#201E1A] border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 text-[#1A1A1A] dark:text-[#EAE5DD]'
                }`}
              >
                {/* Grounding Status Header for Assistant */}
                {msg.sender === 'assistant' && msg.groundingStatus && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10">
                    <span className={`text-[8.5px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                      msg.groundingStatus === 'grounded'
                        ? 'border-[#2D5A27]/30 bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#88B04B]'
                        : msg.groundingStatus === 'general'
                        ? 'border-[#A38D7D]/30 bg-[#A38D7D]/10 text-[#A38D7D]'
                        : 'border-[#A63A26]/30 bg-[#A63A26]/10 text-[#A63A26]'
                    }`}>
                      {msg.groundingStatus === 'grounded' ? 'RECORD-GROUNDED' : msg.groundingStatus === 'general' ? 'GENERAL HEALTH INFORMATION' : 'INSUFFICIENT RECORD DATA'}
                    </span>
                  </div>
                )}

                <p className="font-newsreader text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Evidence Citations - ONLY rendered if sources exist */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 space-y-1">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#A38D7D] dark:text-[#B5A191] block">
                      VERIFIED SOURCES:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <span key={idx} className="text-[10px] font-mono-code px-2 py-0.5 border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 bg-[#FFFFFF] dark:bg-[#151412] text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80">
                          &bull; {src.title}{src.date ? ` (${new Date(src.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limitations */}
                {msg.limitations && msg.limitations.length > 0 && (
                  <div className="pt-1 text-[10.5px] font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                    {msg.limitations.map((lim, idx) => (
                      <p key={idx}>&bull; {lim}</p>
                    ))}
                  </div>
                )}

                {/* Suggested Action Link */}
                {msg.suggestedAction && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        setCurrentView(msg.suggestedAction!.view);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#151412] hover:bg-[#ECE8E1] dark:hover:bg-[#25231F] text-[#1A1A1A] dark:text-[#EAE5DD] text-[11px] font-sans font-bold uppercase tracking-wider border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 transition-colors cursor-pointer"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 border border-[#1A1A1A]/30 dark:border-[#EAE5DD]/30 bg-[#ECE8E1] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#EAE5DD] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 items-center text-xs font-mono-code text-[#A38D7D]">
              <div className="w-7 h-7 border border-[#1A1A1A] dark:border-[#EAE5DD] bg-[#F5F2ED] text-[#1A1A1A] flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Evaluating authorized records & medical knowledge base...</span>
            </div>
          )}

        </div>

        {/* Suggested Quick Prompts */}
        {messages.length < 3 && suggestedPrompts.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 bg-[#F5F2ED] dark:bg-[#1E1D19] flex items-center gap-2 overflow-x-auto">
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#A38D7D] shrink-0">Suggested:</span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-2.5 py-1 border border-[#1A1A1A]/15 dark:border-[#EAE5DD]/15 bg-[#FFFFFF] dark:bg-[#151412] hover:bg-[#ECE8E1] text-[10px] text-[#1A1A1A] dark:text-[#EAE5DD] transition-colors cursor-pointer shrink-0 font-newsreader italic"
              >
                "{p}"
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1A1A1A]/15 dark:border-[#EAE5DD]/12 bg-[#FFFFFF] dark:bg-[#1A1916]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your records, medical terms, or consultation prep..."
              className="flex-1 px-3.5 py-2 bg-[#F5F2ED] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs sm:text-sm text-[#1A1A1A] dark:text-[#EAE5DD] placeholder-[#1A1A1A]/40 dark:placeholder-[#EAE5DD]/40 focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#EAE5DD]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="px-5 py-2 bg-[#1A1A1A] dark:bg-[#EAE5DD] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] disabled:opacity-50 text-[#F5F2ED] dark:text-[#151412] font-sans font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer border border-[#1A1A1A] dark:border-[#EAE5DD]"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>

          <p className="text-[10px] font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50 text-center mt-2">
            SAAHAJ provides grounded health intelligence. All recommendations require clinical confirmation by your physician.
          </p>
        </div>

      </div>
    </div>
  );
};
