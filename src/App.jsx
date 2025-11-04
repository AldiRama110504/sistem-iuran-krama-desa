import React from 'react';
import { KramaProvider } from './context/KramaContext';
import BillingDashboard from './components/BillingDashboard';

function App() {
  return (
    <KramaProvider>
      <div className="min-h-screen bg-gray-50">
        <BillingDashboard />
      </div>
    </KramaProvider>
  );
}

export default App;