import React from 'react';
import useSpadesGame from './hooks/useSpadesGame';
import TeamCard from './TeamCard';
import PlayerInput from './PlayerInput';
import NelloConfirmation from './NelloConfirmation';
import GameControls from './GameControls';
import GameHistory from './GameHistory';
import ScorePreview from './ScorePreview';

export default function SpadesGame() {
  const {
    // State
    team1Score,
    team2Score,
    history,
    currentRound,
    isShortGame,
    isTournamentRules,
    isFinalsGame,
    isEditing,
    showRules,
    previewScores,
    
    // State setters
    setIsShortGame,
    setIsTournamentRules,
    setIsFinalsGame,
    setIsEditing,
    setShowRules,
    
    // Game rules
    getGameRules,
    
    // Player input handlers
    updateBid,
    updateBlindNil,
    updateTricks,
    updateNelloResult,
    
    // Team and player name handlers
    updateTeamName,
    updatePlayerName,
    
    // Game action handlers
    submitBids,
    submitTricks,
    finalizeRound,
    resetGame,
    resetEverything,
    
    // Helper functions
    allNelloResultsSubmitted,
    
    // Accessor functions
    getTeam1Players,
    getTeam2Players
  } = useSpadesGame();

  // Get players arrays for teams
  const team1Players = getTeam1Players();
  const team2Players = getTeam2Players();

  // Get players with nello bids for NelloConfirmation
  const playersWithNello = [
    ...team1Players.filter(p => p.bid === 0 || p.blindNil),
    ...team2Players.filter(p => p.bid === 0 || p.blindNil)
  ];

  // Determine current stage of the game
  const showBidInputs = !currentRound.biddingComplete;
  const showTricksInputs = currentRound.biddingComplete && !currentRound.tricksComplete;
  const showNelloConfirmation = currentRound.tricksComplete && !currentRound.roundComplete && playersWithNello.length > 0;
  const showScorePreview = currentRound.tricksComplete && !currentRound.roundComplete;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Spades Scorecard</h1>
      
      {/* Game Controls */}
      <GameControls
        isEditing={isEditing}
        isShortGame={isShortGame}
        isTournamentRules={isTournamentRules}
        isFinalsGame={isFinalsGame}
        currentRound={currentRound}
        showRules={showRules}
        setIsEditing={setIsEditing}
        setIsShortGame={setIsShortGame}
        setIsTournamentRules={setIsTournamentRules}
        setIsFinalsGame={setIsFinalsGame}
        setShowRules={setShowRules}
        submitBids={submitBids}
        submitTricks={submitTricks}
        finalizeRound={finalizeRound}
        resetGame={resetGame}
        resetEverything={resetEverything}
        allNelloResultsSubmitted={allNelloResultsSubmitted}
      />
      
      {/* Game Rules */}
      {showRules && (
        <div className="card-style p-4 my-4">
          <h2 className="text-lg font-semibold mb-2">Game Rules</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {getGameRules(isShortGame, isTournamentRules, isFinalsGame)}
          </pre>
        </div>
      )}
      
      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <TeamCard
          teamName={team1Score.name}
          teamScore={team1Score}
          players={team1Players}
          isEditing={isEditing}
          updateTeamName={(name) => updateTeamName(1, name)}
          updatePlayerName={(index, name) => updatePlayerName(index, name)}
        />
        
        <TeamCard
          teamName={team2Score.name}
          teamScore={team2Score}
          players={team2Players}
          isEditing={isEditing}
          updateTeamName={(name) => updateTeamName(2, name)}
          updatePlayerName={(index, name) => updatePlayerName(index + 2, name)}
        />
      </div>
      
      {/* Player Inputs for Bids or Tricks */}
      {!isEditing && (showBidInputs || showTricksInputs) && (
        <div className="card-style p-4 my-4">
          <h2 className="text-lg font-semibold mb-4">
            {showBidInputs ? 'Enter Bids' : 'Enter Tricks'}
          </h2>
          
          {/* Team 1 Players */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">{team1Score.name}</h3>
            <PlayerInput
              playerIndex={0}
              player={team1Players[0]}
              roundNumber={history.length + 1}
              showTricks={showTricksInputs}
              maxBid={13}
              updateBid={updateBid}
              updateBlindNil={updateBlindNil}
              updateTricks={updateTricks}
            />
            <PlayerInput
              playerIndex={1}
              player={team1Players[1]}
              roundNumber={history.length + 1}
              showTricks={showTricksInputs}
              maxBid={13}
              updateBid={updateBid}
              updateBlindNil={updateBlindNil}
              updateTricks={updateTricks}
            />
          </div>
          
          {/* Team 2 Players */}
          <div>
            <h3 className="font-medium mb-2">{team2Score.name}</h3>
            <PlayerInput
              playerIndex={2}
              player={team2Players[0]}
              roundNumber={history.length + 1}
              showTricks={showTricksInputs}
              maxBid={13}
              updateBid={updateBid}
              updateBlindNil={updateBlindNil}
              updateTricks={updateTricks}
            />
            <PlayerInput
              playerIndex={3}
              player={team2Players[1]}
              roundNumber={history.length + 1}
              showTricks={showTricksInputs}
              maxBid={13}
              updateBid={updateBid}
              updateBlindNil={updateBlindNil}
              updateTricks={updateTricks}
            />
          </div>
        </div>
      )}
      
      {/* Nello Confirmation */}
      {showNelloConfirmation && (
        <NelloConfirmation
          players={playersWithNello}
          updateNelloResult={updateNelloResult}
          allNelloResultsSubmitted={allNelloResultsSubmitted}
        />
      )}
      
      {/* Score Preview */}
      {showScorePreview && (
        <ScorePreview
          team1Score={team1Score}
          team2Score={team2Score}
          previewScores={previewScores}
        />
      )}
      
      {/* Game History */}
      {history.length > 0 && (
        <GameHistory
          history={history}
          team1Name={team1Score.name}
          team2Name={team2Score.name}
        />
      )}
    </div>
  );
} 