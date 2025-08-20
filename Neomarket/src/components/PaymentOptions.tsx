import React from 'react';
import { CreditCard, Wallet, Coins } from 'lucide-react';

interface PaymentOptionsProps {
  onSelectPayment: (method: string) => void;
}

export default function PaymentOptions({ onSelectPayment }: PaymentOptionsProps) {
  const paymentMethods = [
    {
      id: 'wallet',
      name: 'Crypto Wallet',
      description: 'Pay with your connected wallet',
      icon: <Wallet className="w-6 h-6" />,
      recommended: true
    },
    {
      id: 'card',
      name: 'Credit Card',
      description: 'Pay with credit/debit card',
      icon: <CreditCard className="w-6 h-6" />,
      recommended: false
    },
    {
      id: 'crypto',
      name: 'Other Crypto',
      description: 'Pay with other cryptocurrencies',
      icon: <Coins className="w-6 h-6" />,
      recommended: false
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">Choose Payment Method</h3>
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelectPayment(method.id)}
          className="w-full p-4 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-cyan-400 group-hover:text-cyan-300">
                {method.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{method.name}</span>
                  {method.recommended && (
                    <span className="bg-cyan-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{method.description}</p>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
