import { useState, useEffect } from 'react';
import { TeamScore, Player, Round, HistoryEditField, initialRoundState, initialPlayerState } from '../types';

export default function useSpadeGame() {
  const [team1Score, setTeam1Score] = useState<TeamScore>({
    score: 0,
    bags: 0,
    name: "Team A",
    player1Name: "Player 1",
    player2Name: "Player 2",
    penalizedYellowCards: 0
  });

  const [team2Score, setTeam2Score] = useState<TeamScore>({
    score: 0,
    bags: 0,
    name: "Team B",
    player1Name: "Player 3",
    player2Name: "Player 4",
    penalizedYellowCards: 0
  });

  const [currentRound, setCurrentRound] = useState<Round>(initialRoundState);
  const [history, setHistory] = useState<Round[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isShortGame, setIsShortGame] = useState(false);
  const [isTournamentRules, setIsTournamentRules] = useState(false);
  const [isFinalsGame, setIsFinalsGame] = useState(false);
  const [isDoubleNilAllowed, setIsDoubleNilAllowed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [totalBagsTeam1, setTotalBagsTeam1] = useState(0);
  const [totalBagsTeam2, setTotalBagsTeam2] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);

  useEffect(() => {
    setIsHydrated(true);
    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveToLocalStorage();
    }
  }, [
    team1Score,
    team2Score,
    history,
    isShortGame,
    isTournamentRules,
    isFinalsGame,
    totalBagsTeam1,
    totalBagsTeam2,
    roundNumber,
    isHydrated
  ]);

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('spadesGameState');
        if (savedState) {
          const {
            team1Score: savedTeam1Score,
            team2Score: savedTeam2Score,
            history: savedHistory,
            isShortGame: savedIsShortGame,
            isTournamentRules: savedIsTournamentRules,
            isFinalsGame: savedIsFinalsGame,
            totalBagsTeam1: savedTotalBagsTeam1,
            totalBagsTeam2: savedTotalBagsTeam2,
            roundNumber: savedRoundNumber
          } = JSON.parse(savedState);

          if (savedTeam1Score) setTeam1Score(savedTeam1Score);
          if (savedTeam2Score) setTeam2Score(savedTeam2Score);
          if (savedHistory) setHistory(savedHistory);
          if (savedIsShortGame !== undefined) setIsShortGame(savedIsShortGame);
          if (savedIsTournamentRules !== undefined) setIsTournamentRules(savedIsTournamentRules);
          if (savedIsFinalsGame !== undefined) setIsFinalsGame(savedIsFinalsGame);
          if (savedTotalBagsTeam1 !== undefined) setTotalBagsTeam1(savedTotalBagsTeam1);
          if (savedTotalBagsTeam2 !== undefined) setTotalBagsTeam2(savedTotalBagsTeam2);
          if (savedRoundNumber !== undefined) setRoundNumber(savedRoundNumber);
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      }
    }
  };

  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const gameState = {
          team1Score,
          team2Score,
          history,
          isShortGame,
          isTournamentRules,
          isFinalsGame,
          totalBagsTeam1,
          totalBagsTeam2,
          roundNumber
        };
        localStorage.setItem('spadesGameState', JSON.stringify(gameState));
      } catch (error) {
        console.error("Error saving game state:", error);
      }
    }
  };

  const getGameRules = (isShortGame: boolean, isTournamentRules: boolean, isFinalsGame: boolean) => {
    const baseRules = `General Rules: 
- The spade suit is always trump.
- A (high), K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2.
- There are 4 people per game and it is played in teams of 2.

The Deal:
The first dealer is chosen by a draw for high card, and thereafter the turn to deal proceeds clockwise. The entire deck is dealt one at a time, face down, beginning on the dealer's left. The players then pick up their cards and arrange them by suits and rank.

The Bidding:
Each player decides how many tricks (or hands) they will be able to win and the total number of tricks that need to be won by the team is the sum of what each player bid. The player to the dealer's left starts the bidding and, in turn, each player states how many tricks they expect to win. Any player can call 'nello' which implies that they are bidding 0 wins. The total number of tricks between all 4 players must be less than or equal to 13.

The Play:
The player to the dealer's left leads the first trick. They may lead with any card except a spade unless spades have already been 'broken' in a previous trick (i.e., played when another suit was led). Each player, in turn, must follow suit if able to. If unable to follow suit, the player may play any card (including a spade). The trick is won by the highest spade played, or if no spade was played, by the highest card of the suit led. The player who wins the trick leads the next one.
`;

    if (isShortGame && !isTournamentRules) {
      return baseRules + `\nShort Game Scoring:
The game ends when one team reaches 250 points or more.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 100 points is made every time a team accumulates 10 bags.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significan
`;
    } else if (!isShortGame && isTournamentRules && !isFinalsGame) {
      return baseRules + `\nTournament Regular Game Scoring:
Each round consists of 8 hands.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 50 points is made every time a team accumulates 10 bags.

Blind Nello is not allowed in regular tournament games.
`;
    } else if (!isShortGame && isTournamentRules && isFinalsGame) {
      return baseRules + `\nTournament Finals Game Scoring:
The finals consists of 12 hands.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 50 points is made every time a team accumulates 10 bags.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significan
`;
    } else {
      // Default: Long game, non-tournament rules
      return baseRules + `\nLong Game Scoring:
The game ends when one team reaches 500 points or more.

For making the contract (the number of tricks bid), the team scores 10 points for each trick bid. If a player called 'nello' and successfully didn't win a single trick, they gained 100 points, otherwise they lose 100 points. For each overtrick won, the team receives a 'bag' and a deduction of 100 points is made every time a team accumulates 10 bags.

When a team is behind by 250 points or more, their players have the option to call a 'blind nello'. A blind nello is worth 200 points if successful (no tricks won) but also loses 200 points if failed (any tricks won). This provides a strategic comeback mechanism for teams that are significan
`;
    }
  };

  const calculateTeamScore = (
    players: Player[], 
    tricks: number, 
    currentScore: TeamScore,
    yellowCards: number,
    isFinalCalculation: boolean = false
  ) => {
    // Start with current score
    let newScore = currentScore.score;
    let newBags = currentScore.bags;
    let penalizedYellowCards = currentScore.penalizedYellowCards;
    
    // Calculate if the team made their bid or not
    const nonNelloBids = players
      .filter(p => !p.isNello)
      .reduce((sum, p) => sum + p.bid, 0);

    const nelloPlayers = players.filter(p => p.isNello);
    
    if (tricks >= nonNelloBids) {
      // Made the bid
      newScore += nonNelloBids * 10;
      
      // Calculate bags (overtricks)
      const bags = tricks - nonNelloBids;
      newBags += bags;
      
      // Penalize for every 10 bags - only apply this for the finalizing of a round
      if (isFinalCalculation && Math.floor(newBags / 10) > Math.floor(currentScore.bags / 10)) {
        const bagPenalty = isTournamentRules ? 50 : 100;
        newScore -= bagPenalty;
      }
    } else {
      // Failed to make the bid
      newScore -= nonNelloBids * 10;
    }
    
    // Handle Nello bids
    for (const player of nelloPlayers) {
      if (player.nelloSuccess) {
        // Successful nello
        newScore += player.isBlindNello ? 200 : 100;
      } else {
        // Failed nello
        newScore -= player.isBlindNello ? 200 : 100;
      }
    }
    
    // Handle yellow cards
    if (isFinalCalculation && yellowCards > penalizedYellowCards) {
      const newYellowCardPenalty = (yellowCards - penalizedYellowCards) * 10;
      newScore -= newYellowCardPenalty;
      penalizedYellowCards = yellowCards;
    }
    
    return {
      score: newScore,
      bags: newBags,
      name: currentScore.name,
      player1Name: currentScore.player1Name,
      player2Name: currentScore.player2Name,
      penalizedYellowCards
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, team: 1 | 2, player: 1 | 2, field: keyof Player) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    let value: number | boolean;
    
    if (field === 'isNello' || field === 'isBlindNello') {
      // Prevent blind nellos in tournament mode regular games
      if (field === 'isBlindNello' && isTournamentRules && !isFinalsGame) {
        alert("Blind Nellos are not allowed in tournament regular games!");
        return;
      }
      value = e.target.checked;
    } else {
      // For bid field: handle empty input and invalid numbers
      const inputValue = e.target.value;
      if (inputValue === '' || isNaN(parseInt(inputValue))) {
        value = 0;
      } else {
        value = Math.max(0, Math.min(13, parseInt(inputValue)));
      }
    }
    
    setCurrentRound(prev => ({
      ...prev,
      [playerKey]: {
        ...(prev[playerKey] as Player),
        [field]: value,
        ...(field === 'isNello' && value ? { bid: 0, isBlindNello: false } : {}),
        ...(field === 'isBlindNello' && value ? { bid: 0, isNello: true } : {}),
      }
    }));
  };

  const handleTricksChange = (e: React.ChangeEvent<HTMLInputElement>, team: 1 | 2) => {
    const value = Math.max(0, Math.min(13, parseInt(e.target.value) || 0));
    setCurrentRound(prev => {
      // Calculate what the other team's tricks would be
      const otherTeam = team === 1 ? 2 : 1;
      const otherTeamTricks = team === 1 ? prev.team2Tricks : prev.team1Tricks;
      
      // If this would make total tricks exceed 13, adjust the other team's tricks
      const newOtherTeamTricks = Math.max(0, 13 - value);
      
      return {
        ...prev,
        [`team${team}Tricks`]: value,
        [`team${otherTeam}Tricks`]: newOtherTeamTricks
      };
    });
  };

  const submitBids = () => {
    const totalBids = 
      (currentRound.team1Player1.isNello ? 0 : currentRound.team1Player1.bid) +
      (currentRound.team1Player2.isNello ? 0 : currentRound.team1Player2.bid) +
      (currentRound.team2Player1.isNello ? 0 : currentRound.team2Player1.bid) +
      (currentRound.team2Player2.isNello ? 0 : currentRound.team2Player2.bid);

    if (totalBids > 13) {
      alert("Total bids cannot exceed 13!");
      return;
    }

    const team1Player1Bid = currentRound.team1Player1.isNello ? (currentRound.team1Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player1.bid;
    const team1Player2Bid = currentRound.team1Player2.isNello ? (currentRound.team1Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player2.bid;
    const team2Player1Bid = currentRound.team2Player1.isNello ? (currentRound.team2Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player1.bid;
    const team2Player2Bid = currentRound.team2Player2.isNello ? (currentRound.team2Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player2.bid;

    const confirmMessage = `Confirm bids:\n\n${team1Score.name}:\n${team1Score.player1Name}: ${team1Player1Bid}\n${team1Score.player2Name}: ${team1Player2Bid}\n\n${team2Score.name}:\n${team2Score.player1Name}: ${team2Player1Bid}\n${team2Score.player2Name}: ${team2Player2Bid}\n\nTotal regular bids: ${totalBids}`;

    if (window.confirm(confirmMessage)) {
      setCurrentRound(prev => ({
        ...prev,
        biddingComplete: true
      }));
    }
  };

  const submitTricks = () => {
    const totalTricks = currentRound.team1Tricks + currentRound.team2Tricks;

    if (totalTricks !== 13) {
      alert("Total tricks must equal 13!");
      return;
    }

    const team1Player1Bid = currentRound.team1Player1.isNello ? (currentRound.team1Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player1.bid;
    const team1Player2Bid = currentRound.team1Player2.isNello ? (currentRound.team1Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team1Player2.bid;
    const team2Player1Bid = currentRound.team2Player1.isNello ? (currentRound.team2Player1.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player1.bid;
    const team2Player2Bid = currentRound.team2Player2.isNello ? (currentRound.team2Player2.isBlindNello ? "Blind Nello" : "Nello") : currentRound.team2Player2.bid;
    
    const team1Bids = `${team1Player1Bid} + ${team1Player2Bid}`;
    const team2Bids = `${team2Player1Bid} + ${team2Player2Bid}`;

    const confirmMessage = `Confirm tricks:\n\n${team1Score.name}:\nBids: ${team1Bids}\nTricks Won: ${currentRound.team1Tricks}\n\n${team2Score.name}:\nBids: ${team2Bids}\nTricks Won: ${currentRound.team2Tricks}`;

    if (window.confirm(confirmMessage)) {
      setCurrentRound(prev => ({
        ...prev,
        tricksComplete: true
      }));
    }
  };

  const handleNelloResult = (team: 1 | 2, player: 1 | 2, success: boolean) => {
    const playerKey = `team${team}Player${player}` as keyof Round;
    setCurrentRound(prev => ({
      ...prev,
      [playerKey]: {
        ...(prev[playerKey] as Player),
        nelloSuccess: success
      }
    }));
  };

  const finalizeRound = () => {
    // Check if all nello bids have been confirmed
    if (!allNelloResultsSubmitted()) {
      alert("Please confirm all Nello results!");
      return;
    }

    // Check if yellow cards have been assigned
    // This assumes you have a way to assign yellow cards, which isn't included in these snippets
    // If you don't have this feature, you may remove this check
    
    // Calculate scores for team 1
    const team1Players = [currentRound.team1Player1, currentRound.team1Player2];
    const newTeam1Score = calculateTeamScore(
      team1Players, 
      currentRound.team1Tricks, 
      team1Score,
      currentRound.team1YellowCards,
      true
    );
    
    // Calculate scores for team 2
    const team2Players = [currentRound.team2Player1, currentRound.team2Player2];
    const newTeam2Score = calculateTeamScore(
      team2Players, 
      currentRound.team2Tricks, 
      team2Score,
      currentRound.team2YellowCards,
      true
    );
    
    // Calculate bags for the round and in total
    const newTotalBagsTeam1 = totalBagsTeam1 + Math.max(0, currentRound.team1Tricks - 
      (currentRound.team1Player1.isNello ? 0 : currentRound.team1Player1.bid) -
      (currentRound.team1Player2.isNello ? 0 : currentRound.team1Player2.bid));
    
    const newTotalBagsTeam2 = totalBagsTeam2 + Math.max(0, currentRound.team2Tricks - 
      (currentRound.team2Player1.isNello ? 0 : currentRound.team2Player1.bid) -
      (currentRound.team2Player2.isNello ? 0 : currentRound.team2Player2.bid));
    
    // Create confirmation message
    const confirmMessage = `Confirm round scores:

${team1Score.name}:
Bid: ${team1Players.filter(p => !p.isNello).reduce((sum, p) => sum + p.bid, 0)} + ${team1Players.filter(p => p.isNello).length > 0 ? `${team1Players.filter(p => p.isNello).length} Nello` : "0 Nello"}
Tricks: ${currentRound.team1Tricks}
Score: ${team1Score.score} -> ${newTeam1Score.score} (${newTeam1Score.score - team1Score.score > 0 ? "+" : ""}${newTeam1Score.score - team1Score.score})
Bags: ${team1Score.bags} -> ${newTeam1Score.bags}

${team2Score.name}:
Bid: ${team2Players.filter(p => !p.isNello).reduce((sum, p) => sum + p.bid, 0)} + ${team2Players.filter(p => p.isNello).length > 0 ? `${team2Players.filter(p => p.isNello).length} Nello` : "0 Nello"}
Tricks: ${currentRound.team2Tricks}
Score: ${team2Score.score} -> ${newTeam2Score.score} (${newTeam2Score.score - team2Score.score > 0 ? "+" : ""}${newTeam2Score.score - team2Score.score})
Bags: ${team2Score.bags} -> ${newTeam2Score.bags}`;

    if (window.confirm(confirmMessage)) {
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setTotalBagsTeam1(newTotalBagsTeam1);
      setTotalBagsTeam2(newTotalBagsTeam2);

      // Calculate bags for the round
      const team1RoundBags = Math.max(0, currentRound.team1Tricks - 
        (currentRound.team1Player1.isNello ? 0 : currentRound.team1Player1.bid) -
        (currentRound.team1Player2.isNello ? 0 : currentRound.team1Player2.bid));
      
      const team2RoundBags = Math.max(0, currentRound.team2Tricks - 
        (currentRound.team2Player1.isNello ? 0 : currentRound.team2Player1.bid) -
        (currentRound.team2Player2.isNello ? 0 : currentRound.team2Player2.bid));

      const roundWithBags = {
        ...currentRound,
        team1Bags: team1RoundBags,
        team2Bags: team2RoundBags
      };

      setHistory(prev => [...prev, roundWithBags]);
      setCurrentRound(initialRoundState);
      setRoundNumber(prev => prev + 1);
    }
  };

  const handleNameChange = (
    team: 1 | 2,
    field: 'name' | 'player1Name' | 'player2Name',
    value: string
  ) => {
    if (team === 1) {
      setTeam1Score(prev => ({ ...prev, [field]: value }));
    } else {
      setTeam2Score(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleHistoryEdit = (index: number, field: HistoryEditField, value: any) => {
    if (editingRound === null) return;
    
    setEditingRound(prev => {
      if (!prev) return prev;
      
      if (field.includes('_')) {
        // Handle player bid and nello updates
        const [team, player, subField] = field.split('_');
        const playerKey = `${team}Player${player}` as keyof Round;
        
        if (subField === 'bid') {
          const numValue = Math.max(0, Math.min(13, parseInt(value) || 0));
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              bid: numValue
            }
          };
        } else if (subField === 'isNello') {
          const boolValue = Boolean(value);
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              isNello: boolValue,
              bid: boolValue ? 0 : (prev[playerKey] as Player).bid, // Reset bid to 0 if Nello is checked
              // If isNello is unchecked, also uncheck isBlindNello
              isBlindNello: boolValue ? (prev[playerKey] as Player).isBlindNello : false
            }
          };
        } else if (subField === 'isBlindNello') {
          const boolValue = Boolean(value);
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              isBlindNello: boolValue,
              // If blind nello is checked, also set isNello to true
              isNello: boolValue ? true : (prev[playerKey] as Player).isNello,
              bid: 0 // Reset bid to 0 for blind nello
            }
          };
        } else if (subField === 'nelloSuccess') {
          return {
            ...prev,
            [playerKey]: {
              ...(prev[playerKey] as Player),
              nelloSuccess: value === "true"
            }
          };
        }
      } else {
        // Handle tricks updates
        const numValue = Math.max(0, Math.min(13, parseInt(value) || 0));
        return {
          ...prev,
          [field]: numValue
        };
      }
      
      return prev;
    });
  };

  const startHistoryEdit = (index: number) => {
    setEditingHistoryIndex(index);
    setEditingRound({...history[index]});
  };

  const cancelHistoryEdit = () => {
    setEditingHistoryIndex(null);
    setEditingRound(null);
  };

  const saveHistoryEdit = async () => {
    if (editingHistoryIndex === null || editingRound === null) return;

    // Validate the round data
    const totalTricks = editingRound.team1Tricks + editingRound.team2Tricks;
    if (totalTricks !== 13) {
      alert("Total tricks must equal 13!");
      return;
    }

    // Save the edited round
    const updatedHistory = [...history];
    updatedHistory[editingHistoryIndex] = editingRound;

    // Recalculate scores based on the updated history
    let newTeam1Score = { ...team1Score, score: 0, bags: 0, penalizedYellowCards: 0 };
    let newTeam2Score = { ...team2Score, score: 0, bags: 0, penalizedYellowCards: 0 };
    let newTotalBagsTeam1 = 0;
    let newTotalBagsTeam2 = 0;

    for (let i = 0; i < updatedHistory.length; i++) {
      const round = updatedHistory[i];
      
      // Calculate team 1 score for this round
      const team1Players = [round.team1Player1, round.team1Player2];
      newTeam1Score = calculateTeamScore(
        team1Players, 
        round.team1Tricks, 
        newTeam1Score,
        round.team1YellowCards,
        true
      );
      
      // Calculate team 2 score for this round
      const team2Players = [round.team2Player1, round.team2Player2];
      newTeam2Score = calculateTeamScore(
        team2Players, 
        round.team2Tricks, 
        newTeam2Score,
        round.team2YellowCards,
        true
      );
      
      // Update total bags
      newTotalBagsTeam1 += round.team1Bags;
      newTotalBagsTeam2 += round.team2Bags;
    }

    // Confirm the score changes
    const confirmMessage = `Confirm score changes:

${team1Score.name}: ${team1Score.score} -> ${newTeam1Score.score}
${team2Score.name}: ${team2Score.score} -> ${newTeam2Score.score}`;

    if (window.confirm(confirmMessage)) {
      setHistory(updatedHistory);
      setTeam1Score(newTeam1Score);
      setTeam2Score(newTeam2Score);
      setTotalBagsTeam1(newTotalBagsTeam1);
      setTotalBagsTeam2(newTotalBagsTeam2);
      setEditingHistoryIndex(null);
      setEditingRound(null);
    }
  };

  const calculateCumulativeBags = (roundIndex: number, team: 1 | 2) => {
    let total = 0;
    for (let i = 0; i <= roundIndex; i++) {
      total += team === 1 ? history[i].team1Bags : history[i].team2Bags;
    }
    return total;
  };

  const calculateCumulativeYellowCards = (roundIndex: number, team: 1 | 2) => {
    let total = 0;
    for (let i = 0; i <= roundIndex; i++) {
      total += team === 1 ? history[i].team1YellowCards : history[i].team2YellowCards;
    }
    return total;
  };

  const allNelloResultsSubmitted = () => {
    const checkPlayer = (player: Player) => {
      return !player.isNello || (player.isNello && typeof player.nelloSuccess === 'boolean');
    };
    
    return checkPlayer(currentRound.team1Player1) &&
           checkPlayer(currentRound.team1Player2) &&
           checkPlayer(currentRound.team2Player1) &&
           checkPlayer(currentRound.team2Player2);
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to reset the game? This will keep team names but reset all scores to 0.")) {
      setTeam1Score(prev => ({
        ...prev,
        score: 0,
        bags: 0,
        penalizedYellowCards: 0
      }));
      setTeam2Score(prev => ({
        ...prev,
        score: 0,
        bags: 0,
        penalizedYellowCards: 0
      }));
      setHistory([]);
      setCurrentRound(initialRoundState);
      setTotalBagsTeam1(0);
      setTotalBagsTeam2(0);
      setRoundNumber(1);
    }
  };

  const resetEverything = () => {
    if (window.confirm("This will reset EVERYTHING including team names. Are you sure?")) {
      setTeam1Score({
        score: 0,
        bags: 0,
        name: "Team A",
        player1Name: "Player 1",
        player2Name: "Player 2",
        penalizedYellowCards: 0
      });
      setTeam2Score({
        score: 0,
        bags: 0,
        name: "Team B",
        player1Name: "Player 3",
        player2Name: "Player 4",
        penalizedYellowCards: 0
      });
      setHistory([]);
      setCurrentRound(initialRoundState);
      setTotalBagsTeam1(0);
      setTotalBagsTeam2(0);
      setRoundNumber(1);
      setIsShortGame(false);
      setIsTournamentRules(false);
      setIsFinalsGame(false);
    }
  };

  const calculatePreviewScores = () => {
    // Team 1 score preview
    const team1Players = [currentRound.team1Player1, currentRound.team1Player2];
    const previewTeam1Score = calculateTeamScore(
      team1Players, 
      currentRound.team1Tricks, 
      team1Score,
      currentRound.team1YellowCards
    );
    
    // Team 2 score preview
    const team2Players = [currentRound.team2Player1, currentRound.team2Player2];
    const previewTeam2Score = calculateTeamScore(
      team2Players, 
      currentRound.team2Tricks, 
      team2Score,
      currentRound.team2YellowCards
    );
    
    return {
      team1: previewTeam1Score,
      team2: previewTeam2Score
    };
  };

  return {
    team1Score,
    team2Score,
    currentRound,
    history,
    isEditing,
    isShortGame,
    isTournamentRules,
    isFinalsGame,
    isDoubleNilAllowed,
    showRules,
    editingHistoryIndex,
    editingRound,
    totalBagsTeam1,
    totalBagsTeam2,
    roundNumber,
    setIsEditing,
    setIsShortGame,
    setIsTournamentRules,
    setIsFinalsGame,
    setIsDoubleNilAllowed,
    setShowRules,
    getGameRules,
    handleInputChange,
    handleTricksChange,
    submitBids,
    submitTricks,
    handleNelloResult,
    finalizeRound,
    handleNameChange,
    handleHistoryEdit,
    startHistoryEdit,
    cancelHistoryEdit,
    saveHistoryEdit,
    calculateCumulativeBags,
    calculateCumulativeYellowCards,
    allNelloResultsSubmitted,
    resetGame,
    resetEverything,
    calculatePreviewScores
  };
} 