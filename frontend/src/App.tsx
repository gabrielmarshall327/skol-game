import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaLongArrowAltUp, FaLongArrowAltDown } from "react-icons/fa";

// Define the Player type based on the structure of your API data
interface Player {
  _id: string;
  Name: string;
  Position: string;
  DraftYear: number;
  arrowDirection?: number;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [listVisible, setListVisible] = useState<boolean>(false);
  const [guessedPlayers, setGuessedPlayers] = useState<Player[]>([]);
  const [randomPlayer, setRandomPlayer] = useState<Player>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const listRef = useRef<HTMLUListElement>(null);

  //fetch all players for search
  useEffect(() => {
    axios
      .get<Player[]>("http://localhost:5000/players")
      .then((response) => {
        setPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching player data:", error);
      });
  }, []);

  //fetch random player to guess once site loaded
  useEffect(() => {
    axios
      .get<Player>("http://localhost:5000/players/random")
      .then((response) => {
        setRandomPlayer({
          ...response.data,
          Position: simplifyPosition(response.data.Position),
        });
      })
      .catch((error) => {
        console.error("Error fetching random player:", error);
      });
  }, []);

  const newRandomPlayer = () => {
    axios
      .get<Player>("http://localhost:5000/players/random")
      .then((response) => {
        setModalVisible(false);
        setGuessedPlayers([]);
        setRandomPlayer({
          ...response.data,
          Position: simplifyPosition(response.data.Position),
        });
      })
      .catch((error) => {
        console.error("Error fetching random player:", error);
      });
  };

  //arrow direction
  const arrowDirection = (difference: number): number => {
    if (difference > 0) {
      //guessed year is higher
      return 1;
    } else if (difference < 0) {
      //guessed year is lower
      return 2;
    }
    return 0;
  };

  //filter players based on the search term
  const filteredPlayers = players.filter((player) =>
    player.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //click out of dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setListVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //when option is selected from dropdown
  const handlePlayerClick = (player: Player) => {
    if (randomPlayer) {
      let difference = player.DraftYear - randomPlayer.DraftYear;
      difference = arrowDirection(difference);

      setGuessedPlayers((prevGuessedPlayers) => [
        ...prevGuessedPlayers,
        {
          ...player,
          Position: simplifyPosition(player.Position),
          arrowDirection: difference,
        },
      ]);
    }

    setSearchTerm("");
    setListVisible(false);
    if (randomPlayer && player._id === randomPlayer._id) {
      setModalVisible(true);
    }

    console.log(randomPlayer);
  };

  //if player is close or matches guess for draft year
  const getPlayerTextColorYear = (playerDraftYear: number) => {
    if (!randomPlayer) return "";
    const randomDraftYear = randomPlayer.DraftYear;

    if (playerDraftYear === randomDraftYear) {
      //match
      return "bg-green-500";
    } else if (Math.abs(playerDraftYear - randomDraftYear) <= 3) {
      //close
      return "bg-yellow-500";
    } else {
      return "";
    }
  };

  //if player is close or matches guess for draft year
  const getPlayerTextColorPosition = (playerPosition: string) => {
    if (!randomPlayer) {
      return "";
    }
    if (playerPosition == randomPlayer.Position) {
      //match
      return "bg-green-500";
    } else if (
      (["CB", "S", "DT", "DE", "LB", "MLB"].includes(playerPosition) &&
        ["CB", "S", "DT", "DE", "LB", "MLB"].includes(randomPlayer.Position)) ||
      (["WR", "QB", "RB", "FB", "TE", "C", "OT", "OG"].includes(
        playerPosition
      ) &&
        ["WR", "QB", "RB", "FB", "TE", "C", "OT", "OG"].includes(
          randomPlayer.Position
        ))
    ) {
      //close (same group)
      return "bg-yellow-500";
    } else {
      return "";
    }
  };

  //easier for players to guess
  const simplifyPosition = (position: string) => {
    switch (position) {
      case "LDE":
      case "RDE":
        return "DE";
      case "LDT":
      case "RDT":
        return "DT";
      case "LCB":
      case "RCB":
        return "CB";
      case "FS":
      case "SS":
        return "S";
      case "LLB":
      case "RLB":
        return "LB";
      case "LT":
      case "RT":
        return "OT";
      case "LG":
      case "RG":
        return "OG";
      default:
        return position;
    }
  };

  return (
    <div className=" min-h-screen">
      <button
        className="px-4 py-2 bg-purple-500 text-white rounded mx-4 mt-8"
        onClick={() => newRandomPlayer()}
      >
        Restart
      </button>
      <div className="flex-col justify-center center max-w-3xl m-auto">
        <h1 className="text-center text-violet-700 text-5xl font-bold py-24">
          SKOL Game
        </h1>
        <div className="justify-center flex-col content-center max-w-[90%] m-auto relative">
          <input
            type="text"
            placeholder="Search players by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setListVisible(true)}
            className="border-4 w-[100%] p-2"
          />
          {listVisible && (
            <ul
              className="border border-y-2 overflow-y-auto max-h-96 h-auto absolute w-full bg-white z-10"
              ref={listRef}
            >
              {filteredPlayers.map((player: Player) => (
                <li
                  key={player._id}
                  onClick={() => handlePlayerClick(player)}
                  className="p-2 bg-white hover:bg-gray-400 hover:cursor-pointer"
                >
                  {player.Name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {guessedPlayers.length >= 1 && (
          <div className=" grid grid-cols-3 text-center mt-4 p-4 border-b-2">
            <div>Name</div>
            <div>Position</div>
            <div>Draft Year</div>
          </div>
        )}
        <ul>
          {guessedPlayers.map((player: Player, index: number) => (
            <li className="m-4 bg-gray-100 border border-gray-300" key={index}>
              <div className="grid grid-cols-3 items-center">
                <div className="flex items-center justify-center border-r-2 border-gray-500 h-20 px-4 font-bold">
                  {player.Name}
                </div>
                <div
                  className={`flex items-center justify-center text-center border-r-2 border-gray-500 h-20 ${getPlayerTextColorPosition(
                    player.Position
                  )}`}
                >
                  {player.Position}
                </div>
                <div
                  className={`flex items-center justify-center text-center h-20 ${getPlayerTextColorYear(
                    player.DraftYear
                  )}`}
                >
                  {player.DraftYear}
                  {player.arrowDirection == 1 && (
                    <FaLongArrowAltDown></FaLongArrowAltDown>
                  )}
                  {player.arrowDirection == 2 && (
                    <FaLongArrowAltUp></FaLongArrowAltUp>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {modalVisible && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-20">
            <div className="bg-white p-8 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <p className="mb-6">You guessed the correct player!</p>
              <div className=" flex justify-between">
                <button
                  onClick={() => newRandomPlayer()}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setModalVisible(false)}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
