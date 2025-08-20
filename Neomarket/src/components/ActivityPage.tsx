import React from 'react';
import { Activity, TrendingUp, User, Clock } from 'lucide-react';

export default function ActivityPage() {
  const activities = [
    {
      id: 1,
      type: 'sale',
      user: 'ScavenjerFan',
      item: 'Eko #1234',
      price: '0.5 MATIC',
      time: '2 minutes ago',
      avatar: 'https://picsum.photos/40/40?random=1'
    },
    {
      id: 2,
      type: 'listing',
      user: 'CryptoCollector',
      item: 'Eko #5678',
      price: '1.2 MATIC',
      time: '5 minutes ago',
      avatar: 'https://picsum.photos/40/40?random=2'
    },
    {
      id: 3,
      type: 'bid',
      user: 'NeoTrader',
      item: 'Eko #9999',
      price: '2.1 MATIC',
      time: '8 minutes ago',
      avatar: 'https://picsum.photos/40/40?random=3'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="text-green-400" size={16} />;
      case 'listing':
        return <Activity className="text-blue-400" size={16} />;
      case 'bid':
        return <User className="text-purple-400" size={16} />;
      default:
        return <Activity className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="text-cyan-400" size={32} />
        <h1 className="text-3xl font-bold text-white">Activity</h1>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activity.avatar}
                  alt={activity.user}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <span className="text-white font-medium">{activity.user}</span>
                  <span className="text-slate-400">
                    {activity.type === 'sale' ? 'bought' : 
                     activity.type === 'listing' ? 'listed' : 'bid on'}
                  </span>
                  <span className="text-cyan-400 font-medium">{activity.item}</span>
                  <span className="text-slate-400">for</span>
                  <span className="text-white font-bold">{activity.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <Clock size={14} />
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-slate-400">No more activity to show</p>
      </div>
    </div>
  );
}
