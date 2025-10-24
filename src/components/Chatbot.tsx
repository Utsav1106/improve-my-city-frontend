import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect, useRef } from 'react';

// Mock API for demonstration
const issuesAPI = {
  getIssuesByUser: async () => [
    { status: 'Pending' },
    { status: 'In Progress' },
    { status: 'Resolved' }
  ],
  getAllIssues: async () => [],
  getIssueStats: async () => ({
    total: 42,
    pending: 12,
    inProgress: 15,
    resolved: 15
  })
};

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your city assistant. I can help you check the status of your complaints or guide you through reporting issues. Just ask me!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addMessage = (text: string, isBot: boolean) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage(userMessage, false);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = await processMessage(userMessage);
    addMessage(response, true);
    setIsTyping(false);
  };

  const processMessage = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('status') || lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      if (!user) {
        return "Please login to check your complaint status. You can login from the top right corner.";
      }

      try {
        const issues = await issuesAPI.getIssuesByUser();
        
        if (issues.length === 0) {
          return "You haven't reported any issues yet. Would you like to report one?";
        }

        const pending = issues.filter(i => i.status === 'Pending').length;
        const inProgress = issues.filter(i => i.status === 'In Progress').length;
        const resolved = issues.filter(i => i.status === 'Resolved').length;

        return `Here's your complaint status:\n• ${pending} Pending\n• ${inProgress} In Progress\n• ${resolved} Resolved\n\nYou can view details on the "My Issues" page.`;
      } catch (error) {
        return "Sorry, I couldn't fetch your complaint status. Please try again.";
      }
    }

    if (lowerMessage.includes('report') || lowerMessage.includes('new issue')) {
      return "To report a new issue:\n1. Click on 'Report Issue' in the navigation\n2. Fill in the details (title, description, location)\n3. Add photos if available\n4. Submit your report\n\nWould you like me to guide you through anything else?";
    }

    if (lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('help')) {
      return "Here's how Improve My City works:\n\n1. 📝 Report issues in your community\n2. 📊 Track your reports in 'My Issues'\n3. 👍 Upvote issues you care about\n4. 💬 Comment and engage with others\n5. ✅ See resolved issues for transparency\n\nWhat else would you like to know?";
    }

    if (lowerMessage.includes('all issues') || lowerMessage.includes('community') || lowerMessage.includes('public')) {
      try {
        await issuesAPI.getAllIssues();
        const stats = await issuesAPI.getIssueStats();
        
        return `Community Overview:\n• Total Issues: ${stats.total}\n• Pending: ${stats.pending}\n• In Progress: ${stats.inProgress}\n• Resolved: ${stats.resolved}\n\nCheck the dashboard to explore all issues!`;
      } catch (error) {
        return "Sorry, I couldn't fetch community stats. Please try the dashboard page.";
      }
    }

    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return user 
        ? `Hello ${user.name}! 👋 How can I assist you today? I can help you check your complaint status, guide you through reporting issues, or answer questions about the platform.`
        : "Hello! 👋 I'm here to help. You can ask me about:\n• Checking complaint status\n• Reporting new issues\n• How the platform works\n\nWhat would you like to know?";
    }

    return "I can help you with:\n• Checking your complaint status\n• Reporting new issues\n• Understanding how the platform works\n• Community statistics\n\nTry asking something like 'What's my complaint status?' or 'How do I report an issue?'";
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <svg 
          className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[650px] w-full h-full z-50 flex flex-col sm:rounded-3xl overflow-hidden transition-all duration-500 ease-out ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-8 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-card/95 backdrop-blur-xl" />
        
        {/* Content */}
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-primary-foreground/30">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">City Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-primary-foreground/90">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full p-2 transition-all duration-200"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 bg-muted/30">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  {message.isBot && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                        message.isBot
                          ? 'bg-card text-card-foreground rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm'
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    </div>
                    <p className={`text-xs mt-1 px-1 ${message.isBot ? 'text-muted-foreground' : 'text-muted-foreground text-right'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-end space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="bg-card text-card-foreground rounded-2xl rounded-tl-sm px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all duration-200 placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary shadow-sm hover:shadow-md active:scale-95"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI • Always here to help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}