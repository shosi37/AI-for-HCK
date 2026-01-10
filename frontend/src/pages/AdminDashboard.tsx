import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  LogOut,
  Shield,
  Search,
  Eye,
  Trash2,
  X,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  RefreshCw,
  Download,
  FileText,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import {
  getAllUsers,
  getUserChats,
  deleteUser as deleteFirebaseUser,
  getAllFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  importFAQs,
  subscribeToAllUsers,
  subscribeToFAQs,
  getAnalyticsData,
} from '../utils/firebase/db';
import type { User } from '../types';
import FirebaseSetupGuide from '../components/modals/FirebaseSetupGuide';
import ThemeToggle from '../components/common/ThemeToggle';
import AnimatedBackground from '../components/common/AnimatedBackground';
import { notify, showErrorToast, showSuccessToast } from '../utils/notifications';



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
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'chats' | 'faq'>('overview');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  // FAQ State
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [currentFAQ, setCurrentFAQ] = useState<FAQ>({ id: '', question: '', answer: '' });
  const [faqSearchTerm, setFaqSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(false);

  useEffect(() => {
    // Subscribe to real-time users updates
    const unsubscribeUsers = subscribeToAllUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setPermissionError(false); // Clear error on success
    }, (error) => {
      console.error('Users subscription error:', error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
        showErrorToast('Permission Denied', 'You do not have the required role to view system users.');
      }
    });

    // Subscribe to real-time FAQs updates
    const unsubscribeFAQs = subscribeToFAQs((updatedFAQs) => {
      setFAQs(updatedFAQs);
    }, (error) => {
      console.error('FAQs subscription error:', error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeUsers();
      unsubscribeFAQs();
    };
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const loadedUsers = await getAllUsers();
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadFAQs = async () => {
    setIsLoadingFAQs(true);
    try {
      const loadedFAQs = await getAllFAQs();
      setFAQs(loadedFAQs);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      alert('Failed to load FAQs');
    } finally {
      setIsLoadingFAQs(false);
    }
  };

  const handleAddFAQ = async () => {
    if (!currentFAQ.question || !currentFAQ.answer) {
      alert('Please fill in both question and answer');
      return;
    }
    try {
      await addFAQ({
        question: currentFAQ.question,
        answer: currentFAQ.answer,
      });
      setCurrentFAQ({ id: '', question: '', answer: '' });
      showSuccessToast('FAQ Created', 'The new system directive has been added to our records.');
    } catch (error) {
      console.error('Error adding FAQ:', error);
      showErrorToast('Creation Failed', 'System was unable to archive the new FAQ. Please verify data.');
    }
  };

  const handleUpdateFAQ = async () => {
    if (!currentFAQ.id) {
      handleAddFAQ();
      return;
    }
    try {
      await updateFAQ(currentFAQ.id, {
        question: currentFAQ.question,
        answer: currentFAQ.answer,
      });
      showSuccessToast('FAQ Updated', 'The system knowledge base has been refreshed with new information.');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showErrorToast('Update Failed', 'An error occurred during the synchronization of FAQ protocols.');
    }
  };

  const handleRemoveFAQ = async (faqId: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFAQ(faqId);
        if (currentFAQ.id === faqId) {
          setCurrentFAQ({ id: '', question: '', answer: '' });
        }
        showSuccessToast('Entry Deleted', 'System entry removed successfully.');
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        showErrorToast('Deletion Failed', 'System was unable to purge the specified FAQ entry.');
      }
    }
  };

  const handleExportFAQsJSON = () => {
    const dataStr = JSON.stringify(faqs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hck_faqs.json';
    link.click();
  };

  const handleImportFAQsJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const imported = JSON.parse(event.target.result);
          await importFAQs(imported);
          showSuccessToast('Batch Import Complete', 'Multiple system directives have been successfully integrated.');
        } catch (error) {
          console.error('Error importing FAQs:', error);
          showErrorToast('Import Failed', 'The data stream format is invalid. Please check the JSON structure.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportUsersCSV = () => {
    const headers = ['Name', 'Email', 'Student ID', 'Department', 'Year'];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.studentId || '',
      u.department || '',
      u.year || '',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hck_users.csv';
    link.click();
  };

  const loadUserChats = async (userId: string) => {
    try {
      const chats = await getUserChats(userId);
      setUserChats(chats);
    } catch (error) {
      console.error('Error loading user chats:', error);
      setUserChats([]);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    loadUserChats(user.id);
    setActiveTab('chats');
  };

  useEffect(() => {
    // Reload user chats when chats tab is active and a user is selected
    if (activeTab === 'chats' && selectedUser) {
      loadUserChats(selectedUser.id);
    }
  }, [activeTab, selectedUser]);

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This will also delete all their chats.')) {
      try {
        await deleteFirebaseUser(userId);
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setUserChats([]);
        }
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    feedback: { helpful: 0, notHelpful: 0 },
  });

  useEffect(() => {
    // Load analytics data
    const loadAnalytics = async () => {
      const analyticsData = await getAnalyticsData();
      setStats(analyticsData);
    };

    loadAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question?.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(faqSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Animated Background */}
      <AnimatedBackground />
      {/* Sidebar */}
      <div className="w-64 glass border-r border-gray-200 dark:border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white">Admin Panel</h2>
              <p className="text-xs text-gray-600 dark:text-white/60">HCK College</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Activity className="w-5 h-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'chats'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'faq'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <FileText className="w-5 h-5" />
              <span>FAQ Manager</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="glass border-b border-gray-200 dark:border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 dark:text-white text-2xl">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'chats' && 'Chat Analytics'}
                {activeTab === 'faq' && 'FAQ Manager'}
              </h1>
              <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
                {activeTab === 'overview' && 'Monitor system performance and user activity'}
                {activeTab === 'users' && 'View and manage all registered users'}
                {activeTab === 'chats' && 'Analyze conversations and feedback'}
                {activeTab === 'faq' && 'Manage frequently asked questions'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => {
                  loadUsers();
                  loadFAQs();
                  alert('Data refreshed successfully');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Permission Error Banner */}
          {permissionError && (
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white mb-2">Firebase Security Rules Not Configured</h3>
                  <p className="text-gray-700 dark:text-white/80 text-sm mb-4">
                    The admin dashboard requires Firebase Firestore security rules to be set up. Follow these steps to configure them:
                  </p>
                  <ol className="text-gray-600 dark:text-white/70 text-sm space-y-2 mb-4 list-decimal list-inside">
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline">Firebase Console</a></li>
                    <li>Select your project: <span className="text-gray-900 dark:text-white">ai-chatbot-for-hck</span></li>
                    <li>Navigate to <span className="text-gray-900 dark:text-white">Firestore Database → Rules</span></li>
                    <li>Copy the security rules from <span className="text-gray-900 dark:text-white font-mono">/FIREBASE_SECURITY_RULES.md</span> file in this project</li>
                    <li>Click <span className="text-gray-900 dark:text-white">Publish</span></li>
                  </ol>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPermissionError(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-colors text-sm"
                    >
                      Dismiss
                    </button>
                    <a
                      href="https://console.firebase.google.com/project/ai-chatbot-for-hck/firestore/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Open Firebase Console
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-gray-600 dark:text-white/60 text-sm mb-1">Total Users</h3>
                  <p className="text-gray-900 dark:text-white text-3xl">{stats.totalUsers}</p>
                </div>

                <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-gray-600 dark:text-white/60 text-sm mb-1">Total Chats</h3>
                  <p className="text-gray-900 dark:text-white text-3xl">{stats.totalChats}</p>
                </div>

                <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-gray-600 dark:text-white/60 text-sm mb-1">Total Messages</h3>
                  <p className="text-gray-900 dark:text-white text-3xl">{stats.totalMessages}</p>
                </div>

                <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-white/60 text-sm mb-1">Helpful Feedback</h3>
                  <p className="text-gray-900 dark:text-white text-3xl">{stats.feedback.helpful}</p>
                  <p className="text-gray-500 dark:text-white/40 text-xs mt-1">
                    {stats.feedback.notHelpful} not helpful
                  </p>
                </div>
              </div>

              {/* Recent Users */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                <h3 className="text-gray-900 dark:text-white text-lg mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1e2936] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white">{user.name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white">{user.name || 'Unknown'}</p>
                          <p className="text-gray-600 dark:text-white/60 text-sm">{user.email || 'No email'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewUser(user)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Accuracy Graph Section */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6 mt-6">
                <div className="mb-6">
                  <h3 className="text-gray-600 dark:text-white/60 text-sm mb-2">
                    AI Answer Accuracy (last 30 days)
                  </h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white text-4xl mb-2">
                        {stats.feedback.helpful + stats.feedback.notHelpful > 0
                          ? Math.round(
                            (stats.feedback.helpful /
                              (stats.feedback.helpful + stats.feedback.notHelpful)) *
                            100
                          )
                          : 0}
                        %
                      </p>
                      <p className="text-gray-600 dark:text-white/60 text-sm mb-1">
                        Based on {stats.feedback.helpful + stats.feedback.notHelpful} feedback
                        entries
                      </p>
                      <p className="text-gray-700 dark:text-white/80 text-sm">
                        Daily accuracy for the last 30 days (helpful vs total feedback).
                      </p>
                    </div>
                    <div className="w-96 h-20">
                      <svg width="100%" height="100%" viewBox="0 0 384 80" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <polyline
                          points="0,60 32,55 64,50 96,30 128,25 160,20 192,40 224,35 256,30 288,45 320,40 352,35 384,30"
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900 dark:text-white text-lg mb-1">Per-FAQ accuracy</h3>
                      <p className="text-gray-600 dark:text-white/60 text-sm">
                        Accuracy breakdown for each FAQ question based on user feedback
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        loadUsers();
                        loadFAQs();
                        alert('Data refreshed');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* No feedback yet */}
                    {stats.feedback.helpful + stats.feedback.notHelpful === 0 && (
                      <div>
                        <p className="text-gray-600 dark:text-white/60 text-sm mb-2">
                          0 feedback • 0% accurate
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Other feedback */}
                    {stats.feedback.helpful + stats.feedback.notHelpful > 0 && (
                      <div>
                        <h4 className="text-gray-700 dark:text-white/80 text-sm mb-2">Other</h4>
                        <p className="text-gray-600 dark:text-white/60 text-xs mb-2">
                          {stats.feedback.helpful + stats.feedback.notHelpful} feedback •{' '}
                          {Math.round(
                            (stats.feedback.helpful /
                              (stats.feedback.helpful + stats.feedback.notHelpful)) *
                            100
                          )}
                          % accurate
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.round(
                                (stats.feedback.helpful /
                                  (stats.feedback.helpful + stats.feedback.notHelpful)) *
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {/* Search and Export */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users by name, email, or student ID..."
                    className="w-full bg-gray-50 dark:bg-[#252f3f] text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-white/40"
                  />
                </div>
                <button
                  onClick={handleExportUsersCSV}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Users Table */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#1e2936]">
                      <tr>
                        <th className="text-left text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Name</th>
                        <th className="text-left text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Email</th>
                        <th className="text-left text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Student ID</th>
                        <th className="text-left text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Department</th>
                        <th className="text-left text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Year</th>
                        <th className="text-right text-gray-600 dark:text-white/80 px-6 py-4 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-t border-gray-200 dark:border-white/10">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">{user.name?.charAt(0) || '?'}</span>
                              </div>
                              <span className="text-gray-900 dark:text-white">{user.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-white/70">{user.email || 'No email'}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-white/70">{user.studentId || '-'}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-white/70">{user.department || '-'}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-white/70">{user.year || '-'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                title="View chats"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === 'chats' && (
            <div>
              {selectedUser ? (
                <div>
                  {/* User Header */}
                  <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">{selectedUser.name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <h3 className="text-gray-900 dark:text-white text-lg">{selectedUser.name || 'Unknown'}</h3>
                          <p className="text-gray-600 dark:text-white/60 text-sm">{selectedUser.email || 'No email'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setUserChats([]);
                          setSelectedChat(null);
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Back to Users
                      </button>
                    </div>
                  </div>

                  {/* Chat List */}
                  {selectedChat ? (
                    <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-gray-900 dark:text-white text-lg">{selectedChat.title}</h3>
                        <button
                          onClick={() => setSelectedChat(null)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {selectedChat.messages.map(message => (
                          <div key={message.id}>
                            <div
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                              <div
                                className={`max-w-[80%] ${message.sender === 'user'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-[#1e2936] text-white/90'
                                  } rounded-2xl px-4 py-3`}
                              >
                                <p className="whitespace-pre-line">{message.text}</p>
                                <p
                                  className={`text-xs mt-1 ${message.sender === 'user'
                                    ? 'text-indigo-200'
                                    : 'text-white/40'
                                    }`}
                                >
                                  {new Date(message.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {message.sender === 'ai' && message.helpful !== undefined && message.helpful !== null && (
                              <div className="flex items-center gap-2 mt-2 ml-2">
                                <span className="text-xs text-gray-600 dark:text-white/60">
                                  Feedback: {message.helpful ? '👍 Helpful' : '👎 Not helpful'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userChats.map(chat => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-indigo-500 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-5 h-5 text-indigo-400 mt-1" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-gray-900 dark:text-white mb-2 truncate">{chat.title}</h4>
                              <p className="text-gray-600 dark:text-white/60 text-sm">
                                {chat.messages.length} messages
                              </p>
                              <p className="text-gray-500 dark:text-white/40 text-xs mt-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(chat.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white text-xl mb-2">No User Selected</h3>
                  <p className="text-gray-600 dark:text-white/60 mb-6">
                    Select a user from the Users tab to view their chats
                  </p>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                  >
                    Go to Users
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              {/* FAQ Editor */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-gray-900 dark:text-white text-lg mb-4">FAQ Editor</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-600 dark:text-white/80 text-sm mb-2 block">Question</label>
                    <input
                      type="text"
                      value={currentFAQ.question}
                      onChange={e => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                      placeholder="Enter question..."
                      className="w-full bg-gray-50 dark:bg-[#1e2936] text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 dark:text-white/80 text-sm mb-2 block">Answer</label>
                    <textarea
                      value={currentFAQ.answer}
                      onChange={e => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                      placeholder="Enter answer..."
                      rows={5}
                      className="w-full bg-gray-50 dark:bg-[#1e2936] text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-white/40 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddFAQ}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Add FAQ
                    </button>
                    {currentFAQ.id && (
                      <>
                        <button
                          onClick={handleUpdateFAQ}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                          Update FAQ
                        </button>
                        <button
                          onClick={() => handleRemoveFAQ(currentFAQ.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Delete FAQ
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCurrentFAQ({ id: '', question: '', answer: '' })}
                      className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Import/Export */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-gray-900 dark:text-white text-lg mb-4">Import/Export</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportFAQsJSON}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                  <button
                    onClick={handleImportFAQsJSON}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import JSON
                  </button>
                </div>
              </div>

              {/* FAQ List */}
              <div className="glass border border-gray-200 dark:border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 dark:text-white text-lg">All FAQs ({faqs.length})</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="text"
                      value={faqSearchTerm}
                      onChange={(e) => setFaqSearchTerm(e.target.value)}
                      placeholder="Search FAQs..."
                      className="w-full bg-gray-50 dark:bg-[#1e2936] text-gray-900 dark:text-white pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-white/40"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredFAQs.map(faq => (
                    <div
                      key={faq.id}
                      onClick={() => setCurrentFAQ(faq)}
                      className={`p-4 bg-gray-50 dark:bg-[#1e2936] rounded-lg cursor-pointer transition-colors border ${currentFAQ.id === faq.id
                        ? 'border-indigo-500'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-white/20'
                        }`}
                    >
                      <div className="text-gray-900 dark:text-white mb-2">{faq.question}</div>
                      <div className="text-gray-600 dark:text-white/60 text-sm">{faq.answer}</div>
                    </div>
                  ))}
                  {filteredFAQs.length === 0 && (
                    <div className="text-center py-8 text-gray-600 dark:text-white/60">
                      No FAQs found. Add one to get started.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}