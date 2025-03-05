import React from 'react';
import { TeamScore } from './types';

interface ScorePreviewProps {
  team1Score: TeamScore;
  team2Score: TeamScore;
  previewScores: {
    team1: TeamScore;
    team2: TeamScore;
  };
}

const ScorePreview: React.FC<ScorePreviewProps> = ({
  team1Score,
  team2Score,
  previewScores
}) => {
  return (
    <div className="card-style p-4 mt-4">
      <h3 className="text-base font-semibold mb-3">Score Preview</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">{team1Score.name}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{previewScores.team1.score}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({previewScores.team1.score - team1Score.score > 0 ? "+" : ""}
              {previewScores.team1.score - team1Score.score})
            </span>
          </div>
          <div className="text-xs">
            Bags: {previewScores.team1.bags} 
            ({previewScores.team1.bags - team1Score.bags > 0 ? "+" : ""}
            {previewScores.team1.bags - team1Score.bags})
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">{team2Score.name}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{previewScores.team2.score}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({previewScores.team2.score - team2Score.score > 0 ? "+" : ""}
              {previewScores.team2.score - team2Score.score})
            </span>
          </div>
          <div className="text-xs">
            Bags: {previewScores.team2.bags}
            ({previewScores.team2.bags - team2Score.bags > 0 ? "+" : ""}
            {previewScores.team2.bags - team2Score.bags})
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePreview; 