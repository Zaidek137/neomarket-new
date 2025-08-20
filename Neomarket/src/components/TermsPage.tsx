import React from 'react';
import { FileText, Gavel, AlertTriangle, Users } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="text-cyan-400" size={32} />
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Acceptance of Terms</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              By accessing and using NeoMarket, you accept and agree to be bound by the terms and provision 
              of this agreement. These terms govern your use of the marketplace and all related services.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">User Responsibilities</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Users are responsible for maintaining the security of their wallet and private keys. 
              NeoMarket is not liable for any losses resulting from unauthorized access to user accounts.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Risk Disclaimer</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Trading digital assets involves substantial risk. The value of NFTs can be volatile and 
              unpredictable. You should carefully consider whether trading is suitable for you.
            </p>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Prohibited Activities</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• Using the platform for illegal activities</li>
              <li>• Manipulating market prices</li>
              <li>• Infringing on intellectual property rights</li>
              <li>• Creating fake or misleading listings</li>
            </ul>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Contact Information</h3>
            <p className="text-slate-300">
              For questions regarding these Terms of Service, contact us at{' '}
              <a href="mailto:legal@scavenjer.com" className="text-cyan-400 hover:text-cyan-300">
                legal@scavenjer.com
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
