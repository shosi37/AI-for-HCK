import { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  MessageSquare,
  User,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Menu,
  X,
  Trash2,
  Mail,
  KeyRound,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { User as UserType } from '../types';
import {
  getUserChats,
  saveChat,
  updateChat,
  deleteChat as deleteFirebaseChat,
  subscribeToUserChats,
  subscribeToFAQs,
} from '../utils/firebase/db';
import ThemeToggle from '../components/common/ThemeToggle';
import EmailEditModal from '../components/modals/EmailEditModal';
import PasswordEditModal from '../components/modals/PasswordEditModal';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { showErrorToast, showSuccessToast } from '../utils/notifications';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  helpful?: boolean | null;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  userId: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface ChatPageProps {
  user: UserType;
  onLogout: () => void;
}

export default function ChatPage({ user, onLogout }: ChatPageProps) {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateUser = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Load chats from Firebase in real-time
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe = subscribeToUserChats(user.id, (loadedChats) => {
      setChats(loadedChats);
      // Update current chat if it exists
      if (currentChat) {
        const updated = loadedChats.find(c => c.id === currentChat.id);
        if (updated) {
          setCurrentChat(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Load FAQs from Firebase in real-time
  useEffect(() => {
    const unsubscribe = subscribeToFAQs((loadedFAQs) => {
      setFAQs(loadedFAQs);
    });

    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    const messagesEndRef = document.getElementById('messages-end');
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const createNewChat = () => {
    if (!user?.id) {
      return;
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New conversation',
      timestamp: new Date(),
      messages: [
        {
          id: '1',
          text: `Hello ${user.name}! 👋 I'm the HCK College AI Assistant. I'm here to help you with any questions about courses, admissions, campus facilities, events, and more. How can I assist you today?`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      userId: user.id,
    };
    setCurrentChat(newChat);
    // Save to Firebase
    saveChat(user.id, newChat);
  };

  const deleteChat = (chatId: string) => {
    if (!user?.id) {
      return;
    }

    if (currentChat?.id === chatId) {
      const remaining = chats.filter(c => c.id !== chatId);
      setCurrentChat(remaining.length > 0 ? remaining[0] : null);
    }
    // Delete from Firebase
    deleteFirebaseChat(user.id, chatId);
  };

  const clearAllChats = async () => {
    if (!user?.id) {
      return;
    }

    // Delete all chats from Firebase
    for (const chat of chats) {
      await deleteFirebaseChat(user.id, chat.id);
    }
    setChats([]);
    setCurrentChat(null);
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (!user?.id || !currentChat) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update local state first for immediate feedback
    const chatWithUserMessage: Chat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      title: currentChat.messages.length === 1 ? inputMessage.slice(0, 50) : currentChat.title,
      timestamp: new Date(),
    };

    setCurrentChat(chatWithUserMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare messages for OpenAI
      const apiMessages = chatWithUserMessage.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message.content,
        sender: 'ai',
        timestamp: new Date(),
        helpful: null,
      };

      const finalChat: Chat = {
        ...chatWithUserMessage,
        messages: [...chatWithUserMessage.messages, aiResponse],
      };

      setCurrentChat(finalChat);
      // Save to Firebase
      await updateChat(user.id, finalChat);
    } catch (error) {
      console.error('Chat Error:', error);
      showErrorToast('Chat Error', 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, isHelpful: boolean) => {
    if (!currentChat || !user?.id) return;

    const updatedChat: Chat = {
      ...currentChat,
      messages: currentChat.messages.map(msg =>
        msg.id === messageId ? { ...msg, helpful: isHelpful } : msg
      ),
    };

    // Update local state
    setCurrentChat(updatedChat);
    showSuccessToast('Feedback Received', 'Thanks for the feedback! It helps me provide better answers.');

    // Save to Firebase
    await updateChat(user.id, updatedChat);
  };

  const suggestions = [
    'When is the semester deadline?',
    'How do I apply for scholarships?',
    'Where can I find the timetable?',
    'How to contact IT support?',
  ];

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative md:translate-x-0 z-40 w-64 glass h-full transition-transform duration-300 ease-in-out flex flex-col border-r border-gray-200 dark:border-white/10`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <button
            onClick={createNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900 dark:text-white/90">Chat History</h3>
              {chats.length > 0 && (
                <button
                  onClick={clearAllChats}
                  className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-sm"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`group relative px-3 py-2 rounded-lg cursor-pointer transition-colors ${currentChat?.id === chat.id
                    ? 'bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white'
                    : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-gray-900 dark:text-white/90 mb-3">Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10">
            <h3 className="text-gray-900 dark:text-white/90 mb-3">FAQ</h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(faq.question)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center gap-3 px-3 py-3 text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">{getInitials(currentUser.name)}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm truncate">{currentUser.name}</div>
                <div className="text-xs text-gray-500 dark:text-white/40 truncate">{currentUser.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 glass rounded-lg shadow-xl">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 rounded-t-lg transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    setShowEmailModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Edit Email
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  Edit Password
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-b-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="glass border-b border-gray-200 dark:border-white/10 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-900 dark:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white">AI</span>
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white">College AI Assistant</h2>
                <p className="text-xs text-gray-600 dark:text-white/60">Helpful answers for students</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white text-xl mb-2">Start a new conversation</h3>
                <p className="text-gray-600 dark:text-white/60 mb-6">Click "New Chat" to begin</p>
                <button
                  onClick={createNewChat}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Chat</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentChat.messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[60%] ${message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-[#2d3748] text-gray-900 dark:text-white/90'
                        } rounded-2xl px-4 py-3`}
                    >
                      <p className="whitespace-pre-line">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${message.sender === 'user'
                          ? 'text-indigo-200'
                          : 'text-gray-600 dark:text-white/40'
                          }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Feedback buttons for AI messages */}
                  {message.sender === 'ai' && (
                    <div className="flex items-center gap-2 mt-2 ml-2">
                      <span className="text-xs text-gray-500 dark:text-white/40">Was this answer helpful?</span>
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${message.helpful === true
                          ? 'bg-green-100 dark:bg-green-500/20 border-green-500 text-green-700 dark:text-green-400'
                          : 'border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                      >
                        Helpful
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${message.helpful === false
                          ? 'bg-red-100 dark:bg-red-500/20 border-red-500 text-red-700 dark:text-red-400'
                          : 'border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                      >
                        Not helpful
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-[#2d3748] text-gray-900 dark:text-white/90 rounded-2xl px-4 py-3 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div id="messages-end" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="glass border-t border-gray-200 dark:border-white/10 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about college, deadlines, or services..."
              className="flex-1 bg-gray-100 dark:bg-[#1e2936] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-gray-500 dark:placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:text-gray-500 dark:disabled:text-white/30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Modals */}
      <EmailEditModal
        user={currentUser}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onUpdate={handleUpdateUser}
      />
      <PasswordEditModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}