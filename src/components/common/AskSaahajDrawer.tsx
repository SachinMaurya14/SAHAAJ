import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  HelpCircle,
  Clock,
  ArrowRight,
  Bot
} from 'lucide-react';
import { GeminiService } from '../../services/geminiService';
import { UserRole } from '../../types';

interface AskSaahajDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextType: string;
  currentContext: Record<string, any>;
  userRole: UserRole;
  initialPrompt?: string;
}

export const AskSaahajDrawer: React.FC<AskSaahajDrawerProps> = ({
  isOpen,
  onClose,
  contextType,
  currentContext,
  userRole,
  initialPrompt
}) => {
  const [query, setQuery] = useState(initialPrompt || '');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'saahaj'; text: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts: Record<string, string[]> = {
    'Medical Report': [
      'Explain this laboratory report in simple terms.',
      'Which values are outside the normal reference range and why?',
      'What questions should I ask my physician about these findings?'
    ],
    'Risk Assessment': [
      'Why did the model give me this estimated risk score?',
      'Which factors had the greatest mathematical impact on the calculation?',
      'Is this score a clinical diagnosis or a population screening model?'
    ],
    'Health Timeline': [
      'What has changed in my biomarker trajectory over time?',
      'Summarize the events logged in my health history.',
      'What is the next recommended follow-up step?'
    ],
    'Appointment Prep': [
      'Generate 4 specific discussion questions for my upcoming consultation.',
      'How should I summarize my recent health changes to the doctor?',
      'What lab results should I ask about repeating?'
    ],
    'General': [
      'What is SAAHAJ health intelligence?',
      'How does SAAHAJ protect my biometric data privacy?',
      'How do I enter my vitals or upload a medical document?'
    ]
  };

  const currentPrompts = quickPrompts[contextType] || quickPrompts['General'];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await GeminiService.askSaahaj({
        contextType,
        currentContext,
        userQuery: text,
        userRole
      });

      const saahajMsg = {
        sender: 'saahaj' as const,
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, saahajMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'saahaj' as const,
          text: "I was unable to retrieve an answer at this moment. Please verify your connection or review the structured data directly on screen.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1A1A1A]/40 dark:bg-[#000000]/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#1A1916] h-full shadow-2xl border-l border-[#1A1A1A]/20 dark:border-[#EAE5DD]/15 flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 flex items-center justify-between bg-[#F5F2ED] dark:bg-[#201E1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl italic text-[#1A1A1A] dark:text-[#EAE5DD]">
                  Ask SAAHAJ
                </span>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-[#A38D7D]">
                  Context: {contextType}
                </span>
              </div>
              <span className="text-[10px] font-newsreader italic text-[#1A1A1A]/60 dark:text-[#EAE5DD]/60">
                Grounded Explanation Layer &bull; Gemini 3.7
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#ECE8E1] dark:hover:bg-[#2A2824] text-[#1A1A1A]/70 dark:text-[#EAE5DD]/70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Welcome / Context Bubble */}
          <div className="p-4 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-wider text-[#A38D7D]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded Contextual Safety</span>
            </div>
            <p className="font-newsreader italic text-[#1A1A1A]/80 dark:text-[#EAE5DD]/80 leading-relaxed">
              I explain laboratory parameters, translate clinical terminology, and interpret mathematical model contributions for the active <strong>{contextType}</strong> screen. I do not provide clinical diagnoses.
            </p>
          </div>

          {/* Quick Prompts if no conversation yet */}
          {messages.length === 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
                Suggested Contextual Inquiries:
              </span>
              <div className="space-y-1.5">
                {currentPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="w-full text-left p-2.5 bg-[#FFFFFF] dark:bg-[#151412] hover:bg-[#F5F2ED] dark:hover:bg-[#25231F] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#1A1A1A] dark:text-[#EAE5DD] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>&ldquo;{p}&rdquo;</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A38D7D] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[90%] p-3.5 text-xs ${
                  m.sender === 'user'
                    ? 'bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412]'
                    : 'bg-[#F5F2ED] dark:bg-[#201E1A] text-[#1A1A1A] dark:text-[#EAE5DD] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10'
                }`}
              >
                <div className="font-newsreader text-[13px] leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
              <span className="text-[9px] font-mono-code text-[#1A1A1A]/40 dark:text-[#EAE5DD]/40">
                {m.sender === 'user' ? 'You' : 'SAAHAJ Engine'} &bull; {m.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="p-3.5 bg-[#F5F2ED] dark:bg-[#201E1A] border border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 text-xs font-newsreader italic text-[#A38D7D] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing authorized context and generating grounded explanation...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t border-[#1A1A1A]/10 dark:border-[#EAE5DD]/10 bg-[#F5F2ED] dark:bg-[#201E1A] space-y-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask a question about this ${contextType}...`}
              className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFFFFF] dark:bg-[#151412] border border-[#1A1A1A]/20 dark:border-[#EAE5DD]/20 text-xs text-[#1A1A1A] dark:text-[#EAE5DD] focus:outline-none focus:border-[#A38D7D]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || isLoading}
              className="absolute right-1.5 top-1.5 p-1.5 bg-[#1A1A1A] dark:bg-[#EAE5DD] text-[#F5F2ED] dark:text-[#151412] disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-center font-newsreader italic text-[#1A1A1A]/50 dark:text-[#EAE5DD]/50">
            SAAHAJ synthesizes verified clinical knowledge and never hallucinates unrecorded medical data.
          </p>
        </div>

      </div>
    </div>
  );
};
