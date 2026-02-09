import React, { useState, useEffect } from 'react';

const RepresentativeQuiz = () => {
  const [pool, setPool] = useState([]);
  const [currentRep, setCurrentRep] = useState(null);
  const [status, setStatus] = useState('loading');
  
  const [correctCount, setCorrectCount] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/representatives_metadata.json');
        if (!response.ok) throw new Error("Metadata JSON not found");
        const data = await response.json();
        
        setPool(data);
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrentRep(data[randomIndex]);
        setStatus('playing');
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    loadData();
  }, []);

  const handleGuess = (partyGuess) => {
    if (!currentRep) return;

    const isCorrect = partyGuess === currentRep.party;
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(curr => {
        const next = curr + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
    
    setTotalGuesses(prev => prev + 1);

    const newPool = pool.filter(r => r.bioguide_id !== currentRep.bioguide_id);
    
    if (newPool.length === 0) {
      setStatus('gameOver');
    } else {
      const nextIndex = Math.floor(Math.random() * newPool.length);
      setPool(newPool);
      setCurrentRep(newPool[nextIndex]);
    }
  };

  // Helper to calculate percentage safely
  const calculatePercent = () => {
    if (totalGuesses === 0) return "0";
    return ((correctCount / totalGuesses) * 100).toFixed(1);
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 font-mono">
        <div className="animate-pulse text-xl">Loading Congressional Data...</div>
      </div>
    );
  }

  if (status === 'gameOver') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-2xl text-center bg-white">
        <h2 className="text-4xl font-black mb-4 text-gray-900">FINAL SCORE</h2>
        <p className="text-3xl font-bold text-indigo-600 mb-2">{correctCount} / {totalGuesses}</p>
        <p className="text-xl text-gray-500 mb-6 font-bold">({calculatePercent()}%)</p>
        <p className="text-md text-orange-600 mb-8 uppercase tracking-widest font-black">Best Streak: {bestStreak} 🔥</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-bold shadow-lg transition-transform active:scale-95"
        >
          Restart Session
        </button>
      </div>
    );
  }

  if (!currentRep) return null;

  return (
    <div className="flex flex-col items-center p-6 border rounded-2xl shadow-2xl max-w-[420px] mx-auto bg-gray-50 mt-10">
      
      {/* HUD with Fractional and Percentage Scoring */}
      <div className="w-full grid grid-cols-3 gap-1 mb-6 px-2 font-mono font-bold">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-[10px] uppercase">Accuracy</span>
          <span className="text-indigo-600 text-sm whitespace-nowrap">
            {correctCount} / {totalGuesses} <span className="text-gray-500 text-[11px]">({calculatePercent()}%)</span>
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-[10px] uppercase">Streak</span>
          <span className="text-orange-500 text-lg">{streak} 🔥</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-[10px] uppercase">Remaining</span>
          <span className="text-blue-500 text-lg">{pool.length}</span>
        </div>
      </div>
      
      {/* 320x400 Image Box */}
      <div className="w-[320px] h-[400px] bg-white rounded-xl border-4 border-white shadow-xl overflow-hidden mb-6">
        <img 
          key={currentRep.bioguide_id} 
          src={`/representative_portraits/${currentRep.image_file}`} 
          alt={currentRep.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://via.placeholder.com/320x400?text=No+Photo+Found'; 
          }}
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-gray-900 leading-tight">{currentRep.name}</h1>
        <p className="text-gray-500 font-medium tracking-wide italic">
          {currentRep.state} — District {currentRep.district}
        </p>
      </div>

      <div className="flex gap-4 w-full px-2">
        <button 
          onClick={() => handleGuess('Republican')}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-xl shadow-lg active:translate-y-1 transition-all"
        >
          REPUBLICAN
        </button>
        <button 
          onClick={() => handleGuess('Democrat')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl shadow-lg active:translate-y-1 transition-all"
        >
          DEMOCRAT
        </button>
      </div>
    </div>
  );
};

export default RepresentativeQuiz;