import React, { useState, useEffect } from 'react';

const RepresentativeQuiz = () => {
  const [pool, setPool] = useState([]);
  const [currentRep, setCurrentRep] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isRevealed, setIsRevealed] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState(null);
  
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
        pickRandomRep(data);
        setStatus('playing');
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    loadData();
  }, []);

  const pickRandomRep = (currentPool) => {
    const randomIndex = Math.floor(Math.random() * currentPool.length);
    setCurrentRep(currentPool[randomIndex]);
    setIsRevealed(false);
    setLastGuessCorrect(null);
  };

  const handleGuess = (partyGuess) => {
    if (!currentRep || isRevealed) return;

    const isCorrect = partyGuess === currentRep.party;
    setLastGuessCorrect(isCorrect);
    setIsRevealed(true);
    
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
  };

  const nextRepresentative = () => {
    const newPool = pool.filter(r => r.bioguide_id !== currentRep.bioguide_id);
    if (newPool.length === 0) {
      setStatus('gameOver');
    } else {
      setPool(newPool);
      pickRandomRep(newPool);
    }
  };

  const calculatePercent = () => {
    if (totalGuesses === 0) return "0";
    return ((correctCount / totalGuesses) * 100).toFixed(1);
  };

  if (status === 'loading') return <div className="flex h-screen items-center justify-center font-mono">Loading...</div>;

  if (status === 'gameOver') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 border rounded-2xl shadow-2xl text-center bg-white">
        <h2 className="text-4xl font-black mb-4">FINAL SCORE</h2>
        <p className="text-3xl font-bold text-indigo-600">{correctCount} / {totalGuesses} ({calculatePercent()}%)</p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-full font-bold">Restart</button>
      </div>
    );
  }

  if (!currentRep) return null;

  return (
    <div className="flex flex-col items-center p-6 border rounded-2xl shadow-2xl max-w-[420px] mx-auto bg-gray-50 mt-10 transition-all">
      
      {/* HUD */}
      <div className="w-full grid grid-cols-3 gap-1 mb-6 px-2 font-mono font-bold">
        <div className="flex flex-col items-start">
          <span className="text-gray-400 text-[10px] uppercase">Accuracy: </span>
          <span className="text-indigo-600 text-sm">{correctCount}/{totalGuesses} ({calculatePercent()}%)</span>
        </div>
        <div className="flex flex-col items-center text-orange-500">
          <span className="text-gray-400 text-[10px] uppercase">Streak: </span>
          <span>{streak}</span>
        </div>
        <div className="flex flex-col items-end text-blue-500">
          <span className="text-gray-400 text-[10px] uppercase">Remaining: </span>
          <span>{pool.length}</span>
        </div>
      </div>
      
      {/* Portrait */}
      <div className={`w-[320px] h-[400px] bg-white rounded-xl border-4 shadow-xl overflow-hidden mb-6 transition-colors ${isRevealed ? (lastGuessCorrect ? 'border-green-500' : 'border-red-500') : 'border-white'}`}>
        <img 
          key={currentRep.bioguide_id} 
          src={`/representative_portraits/${currentRep.image_file}`} 
          alt="Representative"
          className="w-full h-full object-cover object-top"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/320x400?text=No+Photo'; }}
        />
      </div>

      {/* Conditional Info Reveal */}
      <div className="text-center min-h-[100px] flex flex-col items-center justify-center w-full mb-4">
        {isRevealed ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-2xl font-black text-gray-900">{currentRep.name}</h1>
            <p className="text-gray-600 font-bold">{currentRep.party}</p>
            <p className="text-gray-400 text-sm">{currentRep.state} — District {currentRep.district}</p>
          </div>
        ) : null}
      </div>

      {/* Controls */}
      <div className="w-full px-2">
        {!isRevealed ? (
          <div className="flex gap-4">
            <button onClick={() => handleGuess('Republican')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-xl shadow-lg transition-transform active:scale-95">REPUBLICAN</button>
            <button onClick={() => handleGuess('Democrat')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-xl shadow-lg transition-transform active:scale-95">DEMOCRAT</button>
          </div>
        ) : (
          <button 
            onClick={nextRepresentative} 
            className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-xl shadow-lg animate-bounce-short"
          >
            NEXT REPRESENTATIVE →
          </button>
        )}
      </div>
    </div>
  );
};

export default RepresentativeQuiz;