import React from 'react';

interface GameControlsProps {
  isEditing: boolean;
  isShortGame: boolean;
  isTournamentRules: boolean;
  isFinalsGame: boolean;
  currentRound: {
    biddingComplete: boolean;
    tricksComplete: boolean;
  };
  showRules: boolean;
  setIsEditing: (value: boolean) => void;
  setIsShortGame: (value: boolean) => void;
  setIsTournamentRules: (value: boolean) => void;
  setIsFinalsGame: (value: boolean) => void;
  setShowRules: (value: boolean) => void;
  submitBids: () => void;
  submitTricks: () => void;
  finalizeRound: () => void;
  resetGame: () => void;
  resetEverything: () => void;
  allNelloResultsSubmitted: () => boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  isEditing,
  isShortGame,
  isTournamentRules,
  isFinalsGame,
  currentRound,
  showRules,
  setIsEditing,
  setIsShortGame,
  setIsTournamentRules,
  setIsFinalsGame,
  setShowRules,
  submitBids,
  submitTricks,
  finalizeRound,
  resetGame,
  resetEverything,
  allNelloResultsSubmitted
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`button-card ${isEditing ? 'bg-blue-500 text-white' : ''}`}
        >
          {isEditing ? 'Done Editing' : 'Edit Names'}
        </button>
        
        {!currentRound.biddingComplete ? (
          <button
            onClick={submitBids}
            className="button-card hover:bg-green-500 hover:text-white"
          >
            Submit Bids
          </button>
        ) : !currentRound.tricksComplete ? (
          <button
            onClick={submitTricks}
            className="button-card hover:bg-green-500 hover:text-white"
          >
            Submit Tricks
          </button>
        ) : (
          <button
            onClick={finalizeRound}
            disabled={!allNelloResultsSubmitted()}
            className={`button-card ${
              allNelloResultsSubmitted()
                ? 'hover:bg-green-500 hover:text-white'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Finalize Round
          </button>
        )}
        
        <button
          onClick={resetGame}
          className="button-card hover:bg-red-500 hover:text-white"
        >
          Reset Scores
        </button>
        
        <button
          onClick={resetEverything}
          className="button-card hover:bg-red-500 hover:text-white"
        >
          Reset All
        </button>
        
        <button
          onClick={() => setShowRules(!showRules)}
          className={`button-card ${showRules ? 'bg-purple-500 text-white' : ''}`}
        >
          {showRules ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isShortGame}
            onChange={(e) => setIsShortGame(e.target.checked)}
            className="mr-2"
          />
          Short Game (250 pts)
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isTournamentRules}
            onChange={(e) => setIsTournamentRules(e.target.checked)}
            className="mr-2"
          />
          Tournament Rules
        </label>
        
        {isTournamentRules && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isFinalsGame}
              onChange={(e) => setIsFinalsGame(e.target.checked)}
              className="mr-2"
            />
            Finals Game
          </label>
        )}
      </div>
    </div>
  );
};

export default GameControls; 