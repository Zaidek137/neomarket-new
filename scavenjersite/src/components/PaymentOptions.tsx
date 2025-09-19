import React from 'react';

type Provider = "stripe" | "coinbase" | "transak";

interface PaymentOptionsProps {
  onSelect: (provider: Provider) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onSelect }) => {
  const paymentMethods: {
    provider: Provider;
    name: string;
    description: string;
    logo: string;
    fees: string;
    popular: boolean;
  }[] = [
    {
      provider: "stripe",
      name: "Stripe",
      description: "Credit Card, Apple Pay, Google Pay",
      logo: "💳",
      fees: "~3.5% + $0.30",
      popular: true,
    },
    {
      provider: "coinbase",
      name: "Coinbase Pay",
      description: "Bank Transfer, Debit Card",
      logo: "🟦",
      fees: "~1% (Bank) / 3.9% (Card)",
      popular: false,
    },
    {
      provider: "transak",
      name: "Transak",
      description: "Multiple Global Payment Options",
      logo: "🌐",
      fees: "Variable (0.99% - 5.5%)",
      popular: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Choose Payment Method
        </h3>
        <p className="text-sm text-gray-400">
          Select how you'd like to pay for your Eko.
        </p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <button
            key={method.provider}
            onClick={() => onSelect(method.provider)}
            className="w-full p-4 border border-gray-700 rounded-lg hover:border-cyan-500 hover:bg-gray-800 transition-all group relative text-left"
          >
            {method.popular && (
              <div className="absolute -top-3 left-4 bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-full">
                Most Popular
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl bg-gray-800 p-2 rounded-md">{method.logo}</div>
                <div>
                  <div className="font-semibold text-white">
                    {method.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {method.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Fees: {method.fees}
                  </div>
                </div>
              </div>
              <div className="text-cyan-400 group-hover:translate-x-1 transition-transform text-2xl font-light">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-green-500">🔒</span>
          <span className="font-medium text-sm text-white">
            Secure Payment Processing
          </span>
        </div>
        <p className="text-xs text-gray-400">
          All payments are processed securely. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default PaymentOptions; 