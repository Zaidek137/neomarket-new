import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-cyan-400" size={32} />
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              NeoMarket collects minimal information to provide our services. This includes wallet addresses, 
              transaction data, and basic usage analytics to improve your experience.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">How We Protect Your Data</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We use industry-standard encryption and security measures to protect your personal information. 
              Your wallet data is never stored on our servers and remains under your complete control.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Data Usage</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We use collected data solely to provide and improve our marketplace services. 
              We do not sell, rent, or share your personal information with third parties without your consent.
            </p>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
            <p className="text-slate-300">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@scavenjer.com" className="text-cyan-400 hover:text-cyan-300">
                privacy@scavenjer.com
              </a>
            </p>
          </div>

          <div className="text-sm text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
