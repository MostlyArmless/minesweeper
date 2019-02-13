/* Ideas and planning
grid size 10x10
rows indexed by letters
columns indexed by numbers
cli program => user enters the (row,col) coordinate they want to "click" next to reveal the contents of that square

grid class
    methods:
        generateNewGrid(numBombs) - 
        render() - prints revealed contents of grid to screen, including the row/col number/letter indices for human reference
        revealSquare(row, col)

game class
    get user input, manipulate grid class to cause the game to proceed from turn to turn
    methods:
        getUserInput() - prompt that validates input until we get a valid (row,col)
        advanceTurn() - primary game loop. 
*/
import { GameState, Coords } from './interfaces';

function RandIntBetween(min: number, max: number): number {
    return (Math.random() * (max - min + 1)) << 0;
}

function Index2Letter(rowIndex: number): string {
    // Starting at a = 0;
    return String.fromCharCode(97 + rowIndex);
}

function Letter2Index(letter: string): number {
    return letter.charCodeAt(0) - 97;
}

class MinesweeperGrid {
    m_grid;
    m_gridSize;
    m_gameChars;
    m_gridRevealed;
    m_bombLocations;

    constructor(numBombs) {        
        this.m_gridSize = 10;
        this.m_gameChars = {
            "blank": " ",
            "bomb": "X"
        };
        let { grid, bombLocations } = this.GenerateNewGrid(this.m_gridSize, numBombs);
        this.m_grid = grid;
        this.m_bombLocations = bombLocations;
        this.m_gridRevealed = this.CreateBlankSquareGrid(this.m_gridSize);
    }

    CreateBlankSquareGrid(gridSize) {
        // Don't need to initialize the columns, just the rows since they're the outer layer
        var arr = [];

        for (let iRow = 0; iRow < gridSize; iRow++) {
            arr[iRow] = [];
            for (let iCol = 0; iCol < gridSize; iCol++) {
                arr[iRow][iCol] = this.m_gameChars.blank;
            }
        }

        return arr;
    }

    GenerateNewGrid(gridSize, numBombs) {
        let grid = this.CreateBlankSquareGrid(10);
        // Randomly distribute the bombs throughout the rows and columns

        let bombLocations = new Set();
        let numBombsPlaced = 0;
        while (numBombsPlaced < numBombs) {
            // Place this bomb at a random location that isn't already occupied
            bombLocations.add([RandIntBetween(0, gridSize - 1), RandIntBetween(0, gridSize - 1)]);
            numBombsPlaced = bombLocations.size;
        }
        
        
        // Place the bombs in the grid
        for (const item of bombLocations) {
            grid[item[0]][item[1]] = this.m_gameChars.bomb;
        }

        return { grid, bombLocations };
    }

    Render() {
        // Print a blank at the start to leave room for the row indices
        console.log(this.m_gameChars.blank);

        // Print the top row which is the column headers (which are numbers)
        let colHeader = [];
        for (let i = 0; i < this.m_gridSize; i++) {
            colHeader[i] = i;
        }
        console.log(' |' + colHeader.join('|') + '|');

        // Print the row headers followed by the grid contents
        for (let iRow = 0; iRow < this.m_gridSize; iRow++) {
            console.log(`${Index2Letter(iRow)}|${this.m_gridRevealed[iRow].join('|')}|`);
            // console.log('--------------------');
        }
    }

    RevealSquare(xy: Coords): GameState {
        // If there's a bomb there, game over
        if (this.m_bombLocations.has(xy)) {
            return GameState.gameOver;
        }
        // Otherwise, we reveal this square and continue
        this.m_gridRevealed[xy.row,xy.col] = this.m_grid[xy.row][xy.col];
        return GameState.playing;
    }

}

class MinesweeperGame {
    m_grid: MinesweeperGrid;
    m_gameState: GameState;
    m_prompt;

    constructor(numBombs) {
        this.m_grid = new MinesweeperGrid(numBombs);
        this.m_gameState = GameState.starting;
        this.m_prompt = require('prompts');
    }

    async GetNextMoveFromUser(): Promise<Coords> {
        // Prompt user for input
        let nextMove: string = await this.m_prompt({
            type: 'text',
            name: 'coordinates',
            message: 'Enter the coordinates of your next guess',
            validate: (res: string) => {
                let matchResult = res.match(/[a-j]{1}[0-9]{1}/i);
                return matchResult === null;
            }
        });

        const nextMoveCoords: Coords = {
            row: Letter2Index(nextMove[0]),
            col: parseInt(nextMove[1])
        }

        return nextMoveCoords;
    }

    async Play() {
        while (this.m_gameState !== GameState.gameOver) {
            console.log(`Game state = ${this.m_gameState}`);
            this.m_grid.Render();
            let nextMove: Coords = await this.GetNextMoveFromUser();
            this.m_gameState = this.m_grid.RevealSquare(nextMove);
        }
    }
}

async function Minesweeper() {
    let game = new MinesweeperGame(10);
    await game.Play();
    console.log('\nDONE');
}

Minesweeper();