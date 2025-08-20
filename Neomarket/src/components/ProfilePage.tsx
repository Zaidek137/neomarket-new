
import { useParams } from 'react-router-dom';

export default function ProfilePage() {
  const { address } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">User Profile</h1>
              <p className="text-slate-400 font-mono text-sm">{address}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-20">
          <h2 className="text-xl text-slate-400">Profile page coming soon...</h2>
        </div>
      </div>
    </div>
  );
}
