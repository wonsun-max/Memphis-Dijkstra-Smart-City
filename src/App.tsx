import { useState } from 'react';
import AlgorithmView from './components/AlgorithmView';
import RealWorldView from './components/RealWorldView';

function App() {
  const [activeTab, setActiveTab] = useState<'algo' | 'real'>('algo');

  return (
    <div className="min-h-screen bg-memphis-polka font-sans text-black">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-6 md:mb-8 flex flex-col xl:flex-row items-center xl:items-start justify-between bg-white memphis-border memphis-shadow p-4 md:p-6 text-center xl:text-left gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-2">Memphis PathFinder</h1>
            <p className="text-base md:text-lg font-medium text-gray-700 font-mono">Dijkstra's Algorithm & Smart Routing</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3 md:gap-4 mt-2 xl:mt-0">
            <button 
              onClick={() => setActiveTab('algo')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-3 font-bold text-base md:text-lg uppercase transition-all memphis-border ${activeTab === 'algo' ? 'bg-[#00f0ff] memphis-shadow' : 'bg-white memphis-shadow-hover'}`}
            >
              알고리즘 모드
            </button>
            <button 
              onClick={() => setActiveTab('real')}
              className={`flex-1 sm:flex-none px-4 md:px-6 py-3 font-bold text-base md:text-lg uppercase transition-all memphis-border ${activeTab === 'real' ? 'bg-[#ff00a0] text-white memphis-shadow' : 'bg-white memphis-shadow-hover'}`}
            >
              실제 활용 모드
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'algo' ? <AlgorithmView /> : <RealWorldView />}
        </main>
      </div>
    </div>
  );
}

export default App;
