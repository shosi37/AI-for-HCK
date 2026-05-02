import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Search, 
  Filter, 
  ArrowLeft, 
  Download, 
  ExternalLink,
  BookOpen,
  Network,
  Cpu,
  Code
} from 'lucide-react';
import AnimatedBackground from '../components/common/AnimatedBackground';
import ThemeToggle from '../components/common/ThemeToggle';

interface EBook {
  id: string;
  title: string;
  author: string;
  category: 'Networking' | 'AI' | 'Programming';
  description: string;
  coverImage?: string;
  downloadUrl: string;
  websiteUrl?: string;
}

const EBOOKS: EBook[] = [
  {
    id: '1',
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James Kurose, Keith Ross',
    category: 'Networking',
    description: 'The standard for computer networking education, focusing on the Internet and the fundamental issues of networking.',
    downloadUrl: 'https://networking.harshkapadia.me/files/books/computer-networking-a-top-down-approach-8th-edition.pdf',
    websiteUrl: 'https://gaia.cs.umass.edu/kurose_ross/index.php',
  },
  {
    id: '2',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    category: 'AI',
    description: 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.',
    downloadUrl: 'https://api.pageplace.de/preview/DT0400.9781292401171_A41586057/preview-9781292401171_A41586057.pdf',
    websiteUrl: 'http://aima.cs.berkeley.edu/',
  },
  {
    id: '3',
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    category: 'Programming',
    description: 'A modern introduction to programming, JavaScript, and the wonders of the digital.',
    downloadUrl: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
    websiteUrl: 'https://eloquentjavascript.net/',
  },
  {
    id: '4',
    title: 'Python for Everybody',
    author: 'Charles Severance',
    category: 'Programming',
    description: 'An introduction to programming for everyone using Python.',
    downloadUrl: 'https://www.py4e.com/book.php',
    websiteUrl: 'https://www.py4e.com/',
  },
  {
    id: '5',
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    category: 'AI',
    description: 'The definitive text on Deep Learning, covering mathematical foundations and modern techniques.',
    downloadUrl: 'https://aikosh.indiaai.gov.in/static/Deep+Learning+Ian+Goodfellow.pdf',
    websiteUrl: 'https://www.deeplearningbook.org/',
  },
  {
    id: '6',
    title: 'Introduction to Networking',
    author: 'Charles Severance',
    category: 'Networking',
    description: 'A clear introduction to how the internet works.',
    downloadUrl: 'https://do1.dr-chuck.net/net-intro/EN_us/net-intro.pdf',
    websiteUrl: 'https://www.dr-chuck.com/net-intro/',
  },
];

export default function Library() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleDownload = async (book: EBook) => {
    // If it's a local file (starts with /ebooks), we can force download easily
    if (book.downloadUrl.startsWith('/ebooks')) {
      const link = document.createElement('a');
      link.href = book.downloadUrl;
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For external links, we try to fetch it as a blob
    try {
      const response = await fetch(book.downloadUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // If CORS fails, we open in new tab as final fallback
      window.open(book.downloadUrl, '_blank');
    }
  };

  const categories = ['All', 'Networking', 'AI', 'Programming'];

  const filteredBooks = useMemo(() => {
    return EBOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || book.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Networking': return <Network className="w-4 h-4" />;
      case 'AI': return <Cpu className="w-4 h-4" />;
      case 'Programming': return <Code className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 glass border-b border-gray-200 dark:border-white/10 sticky top-0 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all text-gray-500 dark:text-white/60"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">HCK Library</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-gray-500 dark:text-white/40">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredBooks.length}</span> eBooks
          </p>
        </div>

        {/* eBooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map(book => (
            <div 
              key={book.id}
              className="group glass rounded-3xl p-6 border border-gray-200 dark:border-white/10 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${
                  book.category === 'Networking' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                  book.category === 'AI' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' :
                  'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                }`}>
                  {getCategoryIcon(book.category)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {book.category}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-white/40 mb-4">by {book.author}</p>
              
              <p className="text-sm text-gray-600 dark:text-white/60 mb-6 line-clamp-3 flex-1">
                {book.description}
              </p>

              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => handleDownload(book)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button 
                  onClick={() => window.open(book.websiteUrl || book.downloadUrl, '_blank')}
                  className="p-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-500 dark:text-white/60"
                  title="Open official website"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No books found</h3>
            <p className="text-gray-500 dark:text-white/40">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
}
