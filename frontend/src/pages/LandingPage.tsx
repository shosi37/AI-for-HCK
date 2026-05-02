import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Book, 
  Shield, 
  ArrowRight, 
  Zap, 
  Globe, 
  Smartphone,
  Cpu,
  Users
} from 'lucide-react';
import AnimatedBackground from '../components/common/AnimatedBackground';
import ThemeToggle from '../components/common/ThemeToggle';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="relative z-20 glass border-b border-gray-200 dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              HCK AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-700 dark:text-white/80 hover:text-indigo-600 dark:hover:text-white font-medium transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium animate-bounce">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Student Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Empowering Your Education with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">AI Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-white/60 leading-relaxed max-w-2xl mx-auto">
              Welcome to the unified student ecosystem. Experience intelligent support, 
              seamless resource management, and a digital library at your fingertips.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                Join Now <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/20 dark:hover:bg-white/5 text-gray-900 dark:text-white rounded-2xl text-lg font-bold border border-gray-200 dark:border-white/10 transition-all"
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
            <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-indigo-500/50 transition-all hover:translate-y-[-8px] group">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Intelligent AI Chat</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed">
                Get instant answers to your academic queries. Our AI is trained to understand 
                the curriculum and provide precise guidance 24/7.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all hover:translate-y-[-8px] group">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Book className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Digital Library</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed">
                Access a curated collection of eBooks, slides, and research papers. 
                Download resources instantly or browse official external sources.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-gray-200 dark:border-white/10 hover:border-pink-500/50 transition-all hover:translate-y-[-8px] group">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Secure & Personalized</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed">
                Manage your academic profile with confidence. Your data is encrypted 
                and your experience is tailored to your year and department.
              </p>
            </div>
          </div>

          {/* About Us Section */}
          <div id="about" className="mt-32 glass p-12 rounded-[40px] border border-gray-200 dark:border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-gray-600 dark:text-white/70 leading-relaxed mb-6">
                  The HCK AI Assistant was born from a simple yet powerful goal: to provide every student 
                  at Herald College Kathmandu with a high-tier academic support system that never sleeps. 
                  We believe that technology should be an enabler, not a barrier, to excellence.
                </p>
                <p className="text-gray-600 dark:text-white/70 leading-relaxed mb-6 italic border-l-4 border-indigo-600 pl-4">
                  "This platform represents a Final Year Project (FYP) dedicated to enhancing the digital learning experience at HCK. Developed with a focus on AI integration and student accessibility."
                  <br />
                  <span className="font-bold text-gray-900 dark:text-white mt-2 block">— Shoaib Siddiqui, Level 6 CS Student</span>
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-gray-700 dark:text-white/80 text-sm">Empowering 1000+ students daily</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Globe className="w-3 h-3 text-blue-500" />
                    </div>
                    <span className="text-gray-700 dark:text-white/80 text-sm">24/7 Academic Assistance</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square glass rounded-3xl flex flex-col items-center justify-center text-center p-6 border-indigo-500/20">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">98%</div>
                  <div className="text-xs text-gray-500 dark:text-white/40">Accuracy Rate</div>
                </div>
                <div className="aspect-square glass rounded-3xl flex flex-col items-center justify-center text-center p-6 border-purple-500/20">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">Elite</div>
                  <div className="text-xs text-gray-500 dark:text-white/40">Resource Hub</div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
              <p className="text-gray-600 dark:text-white/60">A seamless journey from registration to academic excellence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connector Line (Desktop Only) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/50 to-indigo-500/10 -translate-y-1/2 z-0"></div>
              
              {[
                { step: '01', title: 'Create Profile', desc: 'Join with your student ID and HCK email.', icon: <Users className="w-6 h-6" /> },
                { step: '02', title: 'Consult AI', desc: 'Ask complex questions and get instant guidance.', icon: <MessageSquare className="w-6 h-6" /> },
                { step: '03', title: 'Access Resources', desc: 'Download eBooks and slides from the library.', icon: <Book className="w-6 h-6" /> },
                { step: '04', title: 'Excel Together', desc: 'Track progress and achieve your academic goals.', icon: <Zap className="w-6 h-6" /> }
              ].map((item, i) => (
                <div key={i} className="relative z-10 glass p-6 rounded-3xl border border-gray-200 dark:border-white/10 text-center hover:translate-y-[-8px] transition-all">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-500/30">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-tighter">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Showcase */}
          <div className="mt-32">
            <div className="glass p-12 rounded-[50px] border border-gray-200 dark:border-white/10 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] -ml-32 -mb-32"></div>
              <div className="text-center mb-16 relative z-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Powered by Modern Technology</h2>
                <p className="text-gray-600 dark:text-white/60">Built with the world's most advanced tools for speed and security.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                {[
                  { name: 'React 18', label: 'Frontend Engine', color: 'blue' },
                  { name: 'Firebase', label: 'Cloud Infrastructure', color: 'orange' },
                  { name: 'Rasa AI', label: 'Natural Language Engine', color: 'purple' },
                  { name: 'Tailwind CSS', label: 'Design System', color: 'teal' }
                ].map((tech, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{tech.name}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">{tech.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future Roadmap Section */}
          <div className="mt-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">The Future Vision</h2>
                <div className="space-y-6">
                  {[
                    { title: 'Predictive Analytics', desc: 'Predicting student performance trends using advanced ML algorithms.' },
                    { title: 'Global Resource Library', desc: 'Expanding to include 1000+ open-source textbooks and papers.' },
                    { title: 'Mobile Ecosystem', desc: 'Native iOS and Android applications for support on the go.' }
                  ].map((goal, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{goal.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-white/60">{goal.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass p-8 rounded-[40px] border border-gray-200 dark:border-white/10 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 relative group cursor-pointer">
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity rounded-[40px]"></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Admin Oversight</h3>
                    <p className="text-xs text-gray-500">Live monitoring & feedback</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-white/60 mb-6 leading-relaxed">
                  Administrators can monitor platform health, analyze student engagement trends, 
                  and refine the AI training data in real-time to ensure maximum accuracy.
                </p>
                <button 
                  onClick={() => navigate('/admin/login')}
                  className="w-full py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                >
                  Enter Admin Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Support Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <div id="privacy" className="glass p-10 rounded-[40px] border border-gray-200 dark:border-white/10">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed text-sm mb-6">
                Your trust is our most valuable asset. We are committed to protecting your personal 
                and academic data through rigorous security protocols.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="mt-1 text-indigo-500">✔</div>
                  <p className="text-xs text-gray-700 dark:text-white/80">
                    <span className="font-bold">Zero Data Sharing:</span> Your personal info and chat 
                    histories are never shared with external advertisers or third-party agencies.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 text-indigo-500">✔</div>
                  <p className="text-xs text-gray-700 dark:text-white/80">
                    <span className="font-bold">Encrypted Storage:</span> All profile data is encrypted 
                    using AES-256 standards, ensuring that your records remain strictly yours.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 text-indigo-500">✔</div>
                  <p className="text-xs text-gray-700 dark:text-white/80">
                    <span className="font-bold">Anonymous Insights:</span> We only analyze aggregated, 
                    anonymous data to improve the AI's accuracy for the entire community.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-white/40 italic">
                By using this platform, you agree to our fair usage policy and academic integrity guidelines.
              </p>
            </div>

            <div id="support" className="glass p-10 rounded-[40px] border border-gray-200 dark:border-white/10 bg-indigo-600/5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dedicated Support</h3>
              <p className="text-gray-600 dark:text-white/60 leading-relaxed text-sm mb-6">
                Need help with the platform or your academics? Our team and the AI 
                are here to ensure you have a smooth experience.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Email Support</div>
                    <div className="text-xs text-gray-500 dark:text-white/40">support@hck.edu.np</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">Live AI Chat</div>
                    <div className="text-xs text-gray-500 dark:text-white/40">Available 24/7 inside</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 glass border-t border-gray-200 dark:border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">HCK AI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-600 dark:text-white/60">
            <a href="#" className="hover:text-indigo-600 transition-colors">About Us</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            <a href="/admin/login" className="hover:text-indigo-600 transition-colors font-bold">Admin Portal</a>
          </div>
          <div className="text-sm text-gray-500 dark:text-white/40 text-center md:text-right">
            FYP Project by <span className="text-indigo-600 dark:text-indigo-400 font-bold">Shoaib Siddiqui</span>
            <br />
            Level 6 Student, Computer Science
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
