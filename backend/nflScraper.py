import time
import requests
import pandas as pd

class Player:
    def __init__(self, name, position, draftYear):
        self.name = name
        self.position = position
        self.draftYear = draftYear

def scrape_vikings_players():
    # Set to store encountered players
    encountered_players = set()
    with open("vikingsPlayers.csv", "w") as file:
        for year in range(1990, 2024):
            time.sleep(6)
            url = 'https://www.pro-football-reference.com/teams/min/' + str(year) + '_roster.htm'
            response = requests.get(url)
            
            if response.status_code == 200:
                # Use pandas to directly read the HTML table into a DataFrame
                dfs = pd.read_html(response.text)
                
                # Check if any tables were found
                if len(dfs) > 0:
                    # Extract the first table (assuming it contains the roster)
                    roster_df = dfs[0]
                    
                    # Extract quarterback names
                    vikings = roster_df['Player'].tolist()
                    
                    # Add quarterbacks to the list, skipping duplicates
                    for _, row in roster_df.iterrows():
                        name = row['Player'].replace('*', '').replace('+', '') 
                        if name == "Defensive Starters" or name == "Offensive Starters":
                            continue
                        position = row['Pos'] if 'Pos' in roster_df.columns else None
                        experience = row['Yrs'] if 'Yrs' in roster_df.columns else None
                        if experience == "Rook":
                            experience = 0
                        draftYear = year - int(experience) if experience is not None else None
                        
                        player = Player(name, position, draftYear)
                        if player.name not in encountered_players:
                            encountered_players.add(player.name)
                            vikings.append([player.name, player.position, player.draftYear])
                            file.write(f"{player.name},{player.position},{player.draftYear}\n")
                        else:
                            continue
                else:
                    print("No tables found in the HTML content.")
            else:
                print("Failed to retrieve page")
        

    return list(encountered_players)

if __name__ == "__main__":
    nfl_quarterbacks = scrape_vikings_players()
    if nfl_quarterbacks:
        print("List of NFL vikings:")
        for idx, qb in enumerate(nfl_quarterbacks, start=1):
            print(f"{idx}. {qb}")
    else:
        print("Failed to fetch NFL vikings.")
