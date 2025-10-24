import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { issuesAPI } from '../api/issues';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export function Chatbot() {
  const { user } = useAuth();
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

    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = await processMessage(userMessage);
    addMessage(response, true);
    setIsTyping(false);
  };

  const processMessage = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();

    // Check complaint status
    if (lowerMessage.includes('status') || lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      if (!user) {
        return "Please login to check your complaint status. You can login from the top right corner.";
      }

      try {
        const issues = await issuesAPI.getIssuesByUser(user.id);
        
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

    // Report new issue
    if (lowerMessage.includes('report') || lowerMessage.includes('new issue') || lowerMessage.includes('complaint')) {
      return "To report a new issue:\n1. Click on 'Report Issue' in the navigation\n2. Fill in the details (title, description, location)\n3. Add photos if available\n4. Submit your report\n\nWould you like me to guide you through anything else?";
    }

    // How it works
    if (lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('help')) {
      return "Here's how Improve My City works:\n\n1. 📝 Report issues in your community\n2. 📊 Track your reports in 'My Issues'\n3. 👍 Upvote issues you care about\n4. 💬 Comment and engage with others\n5. ✅ See resolved issues for transparency\n\nWhat else would you like to know?";
    }

    // Check all issues
    if (lowerMessage.includes('all issues') || lowerMessage.includes('community') || lowerMessage.includes('public')) {
      try {
        await issuesAPI.getAllIssues();
        const stats = await issuesAPI.getIssueStats();
        
        return `Community Overview:\n• Total Issues: ${stats.total}\n• Pending: ${stats.pending}\n• In Progress: ${stats.inProgress}\n• Resolved: ${stats.resolved}\n\nCheck the dashboard to explore all issues!`;
      } catch (error) {
        return "Sorry, I couldn't fetch community stats. Please try the dashboard page.";
      }
    }

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return user 
        ? `Hello ${user.name}! 👋 How can I assist you today? I can help you check your complaint status, guide you through reporting issues, or answer questions about the platform.`
        : "Hello! 👋 I'm here to help. You can ask me about:\n• Checking complaint status\n• Reporting new issues\n• How the platform works\n\nWhat would you like to know?";
    }

    // Default response
    return "I can help you with:\n• Checking your complaint status\n• Reporting new issues\n• Understanding how the platform works\n• Community statistics\n\nTry asking something like 'What's my complaint status?' or 'How do I report an issue?'";
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center z-50 hover:scale-110"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-128 z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">City Assistant</h3>
            <p className="text-xs text-blue-100">Online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.isBot
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-400' : 'text-blue-100'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
