import { X, CheckCircle, AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface FirebaseSetupGuideProps {
  onClose: () => void;
}

export default function FirebaseSetupGuide({ onClose }: FirebaseSetupGuideProps) {
  const [copied, setCopied] = useState(false);

  const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read and write their own chats
      match /chats/{chatId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Allow everyone to read FAQs
    match /faqs/{faqId} {
      allow read: if true;
      // Only authenticated admin can write FAQs
      allow write: if request.auth != null && request.auth.token.email == 'admin@hck.edu';
    }
    
    // Admin can read all users and chats
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.token.email == 'admin@hck.edu';
      
      match /chats/{chatId} {
        allow read: if request.auth != null && request.auth.token.email == 'admin@hck.edu';
      }
    }
  }
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(securityRules);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white text-xl">Firebase Setup Required</h2>
              <p className="text-white/60 text-sm">Configure Firestore security rules to enable the application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Why This Is Needed */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              Why is this needed?
            </h3>
            <p className="text-white/80 text-sm">
              Firebase Firestore requires security rules to control who can read and write data.
              Without these rules, all database operations will be denied for security reasons.
            </p>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-white mb-4">Follow these steps:</h3>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-2">Open Firebase Console</h4>
                  <a
                    href="https://console.firebase.google.com/project/ai-chatbot-for-hck/firestore/rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Open Firebase Console
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-white/60 text-sm mt-2">
                    This will open the Firestore Rules page for your project: <span className="text-white">ai-chatbot-for-hck</span>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-2">Copy the security rules</h4>
                  <div className="relative">
                    <pre className="bg-[#1e2936] text-white/90 p-4 rounded-lg text-xs overflow-x-auto border border-white/10">
                      <code>{securityRules}</code>
                    </pre>
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy Rules
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-2">Paste and publish</h4>
                  <ul className="text-white/70 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>In the Firebase Console, you'll see the Rules editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Delete all existing content in the editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Paste the copied rules</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Click the <span className="text-white font-medium">"Publish"</span> button</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-2">Refresh this page</h4>
                  <p className="text-white/70 text-sm">
                    After publishing the rules, refresh this page and the application should work normally.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What These Rules Do */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              What these rules enable:
            </h3>
            <ul className="text-white/80 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Users can read and write their own profile data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Users can read and write their own chats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Everyone can read FAQs (so the AI can answer questions)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Only admin@hck.edu can manage FAQs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Admin can view all users and chats in the dashboard</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass border-t border-white/10 p-6 flex items-center justify-between">
          <p className="text-white/60 text-sm">
            Need help? Check the Firebase documentation or contact support.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
