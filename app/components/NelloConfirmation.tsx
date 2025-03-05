import React from 'react';
import { Player } from './types';

interface NelloConfirmationProps {
  players: Player[];
  updateNelloResult: (playerIndex: number, success: boolean) => void;
  allNelloResultsSubmitted: () => boolean;
}

const NelloConfirmation: React.FC<NelloConfirmationProps> = ({
  players,
  updateNelloResult,
  allNelloResultsSubmitted
}) => {
  const playersWithNello = players.filter(
    player => player.bid === 0 || player.blindNil
  );

  if (playersWithNello.length === 0) {
    return null;
  }

  return (
    <div className="card-style p-4 my-4">
      <h3 className="text-lg font-semibold mb-3">Nello Results</h3>
      
      {playersWithNello.map((player, idx) => {
        const playerIndex = players.findIndex(p => p.name === player.name);
        const nelloType = player.blindNil ? "Blind Nello" : "Nello";
        const isResultSet = player.nelloResult !== null;
        
        return (
          <div key={idx} className="mb-4 last:mb-0">
            <h4 className="font-medium">
              {player.name} ({nelloType})
            </h4>
            
            {isResultSet ? (
              <div className={`mt-1 text-sm ${player.nelloResult ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {player.nelloResult ? "Succeeded" : "Failed"}
                <button 
                  onClick={() => updateNelloResult(playerIndex, null)}
                  className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => updateNelloResult(playerIndex, true)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Success
                </button>
                <button
                  onClick={() => updateNelloResult(playerIndex, false)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Fail
                </button>
              </div>
            )}
          </div>
        );
      })}
      
      {allNelloResultsSubmitted() && playersWithNello.length > 0 && (
        <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
          All Nello results submitted. You can now submit tricks.
        </div>
      )}
    </div>
  );
};

export default NelloConfirmation; 