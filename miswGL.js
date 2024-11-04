var board = [];
var rows;
var columns;

var minesCount;
var minesLocation = [];  //2-2, 3-3.4-4.

var tilesClicked = 0; //goal is to click all the tiles except the ones containing mines
var flagEnabled = false;

var gameOver = false;
var firstClick = true;

function updateMineLimit() {
    const rows = parseInt(document.getElementById("rows-input").value);
    const columns = parseInt(document.getElementById("columns-input").value);
    const maxMines = (rows * columns) -1;

    // Set the max attribute for the mines input
    const minesInput = document.getElementById("mines-input");
    minesInput.max = maxMines;
    

    // If the current value exceeds the new max, adjust it
    if (parseInt(minesInput.value) > maxMines) {
        minesInput.value = maxMines;
    }
}
window.onload = function() {
    alert("Welcome to Minesweeper!\nTo start the game select the dimensions of the board \nand the number of mines and press the button: Start Game.\nYou can toggle the flag button with your right mouse button.");
    updateMineLimit();
    document.getElementById("rows-input").addEventListener("input", updateMineLimit);
    document.getElementById("columns-input").addEventListener("input", updateMineLimit);
    document.getElementById("mines-input").addEventListener("input", updateMineLimit);
    document.getElementById("start-button").addEventListener("click", startGame);;
}

function setMines(excludeTile) {
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id) && id !== excludeTile) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }

}

function startGame() {;
    // Clear previous game data
    board = [];
    minesLocation = [];
    tilesClicked = 0;
    gameOver = false;
    flagEnabled = false;
    firstClick = true;
    flagsPlaced = 0;
    document.getElementById("board").innerHTML = "";
    document.getElementById("flags-count").innerText = "0";
    // Read user inputs
    rows = parseInt(document.getElementById("rows-input").value);
    columns = parseInt(document.getElementById("columns-input").value);
    minesCount = parseInt(document.getElementById("mines-input").value);

    if (isNaN(rows) || rows <= 0) {
        rows = 8; // Default number of rows
        document.getElementById("rows-input").value = rows;
    }
    if (isNaN(columns) || columns <= 0) {
        columns = 8; // Default number of columns
        document.getElementById("columns-input").value = columns;
    }
    if (isNaN(minesCount) || minesCount < 0) {
        minesCount = 5; // Default number of mines
        document.getElementById("mines-input").value = minesCount;
    }

    // Ensure minesCount does not exceed the number of tiles minus one
    const maxMines = (rows * columns) - 1;
    if (minesCount > maxMines) {
        minesCount = maxMines;
        document.getElementById("mines-input").value = minesCount;
    }

    // Dynamically calculate tile size based on the board size
    const wid = columns;
    const hei = rows;

    // Dynamically adjust the zoom level based on the board size
    adjustZoomLevel(rows, columns);

    // Set CSS variables for dynamic sizing
    document.getElementById("board").style.setProperty('--wid', wid);
    document.getElementById("board").style.setProperty('--hei', hei);


    // Set the number of mines and start the game
    document.getElementById("mines-count").innerText = minesCount;
    document.getElementById("flag-button").addEventListener("click", setFlag);


    //Populate the board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0;c < columns; c++){
        //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.addEventListener('contextmenu', setFlag, false);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
    console.log(board);
}

function adjustZoomLevel(rows, columns) {
    const maxDimension = Math.max(rows, columns);
    let scale;

    if (maxDimension <= 10) {
        scale = 1;  // No scaling for small boards
    } else if (maxDimension <= 20) {
        scale = 0.8;  // Slightly smaller
    } else if (maxDimension <= 30) {
        scale = 0.6;  // Medium boards
    } else if (maxDimension <= 50) {
        scale = 0.4;  // Medium boards
    } else if (maxDimension <= 75) {
        scale = 0.3;  // Large boards
    } else {
        scale = 0.2;
    }
    document.getElementById("board").style.transform = `scale(${scale})`;
    document.getElementById("board").style.transformOrigin = 'top center';  // Anchor the scaling to the top-center
}

function setFlag(event) {
    event.preventDefault(); // Prevent the default context menu from appearing

    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
        showMessage("Flag Mode: OFF", event.clientX, event.clientY);
    }
    else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
        showMessage("Flag Mode: ON", event.clientX, event.clientY);
    }
}

function showMessage(message, x, y) {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.style.position = "fixed";
    messageElement.style.left = `${x}px`;
    messageElement.style.top = `${y}px`;
    messageElement.style.color = "black";
    messageElement.style.padding = "5px 10px";
    messageElement.style.borderRadius = "5px";
    messageElement.style.zIndex = "1000";
    messageElement.style.opacity = "1";
    messageElement.style.transition = "opacity 0.4s ease";

    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.opacity = "0";
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 300);
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    let tile = this;

    if (tile.innerText == "🚩" && flagEnabled == false) {
        return; // Do nothing if the tile is flagged
    }

    if (firstClick) {
        if (flagEnabled) {
            return; // Do nothing if the tile is flagged
        }
        else {// On the first click, set mines avoiding the clicked tile
        setMines(tile.id);
        firstClick = false;
        }
    }
    
    if (flagEnabled) {
        if (tile.innerText == "") {
            tile.innerText = "🚩";
            flagsPlaced += 1;
        }
        else if (tile.innerText == "🚩") {
            tile.innerText = "";
            flagsPlaced -= 1;
        }
        document.getElementById("flags-count").innerText =flagsPlaced;
        return;
    }

    
    if (minesLocation.includes(tile.id)) {
        gameOver = true;
        revealMines();
        setTimeout(() => {
            alert("GAME OVER \nTo start again press the button: Start Game");
        }, 400);
        return;

    }

    let coords = tile.id.split("-"); //"0-0" --> ["0","0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)){
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";

            }

        }
    }
    
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")){
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;
    // TOP 3
    minesFound += checkTile(r-1, c-1); //top Left
    minesFound += checkTile(r-1, c); //top 
    minesFound += checkTile(r-1, c+1); //top right

    // LEFT and RIGHT
    minesFound += checkTile(r, c-1); //Left
    minesFound += checkTile(r, c+1); //Right

    // Bottom 3
    minesFound += checkTile(r+1, c-1); //bottom Left
    minesFound += checkTile(r+1, c); //bottom 
    minesFound += checkTile(r+1, c+1); //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        board[r][c].innerText = "";
        //top 3
        checkMine(r-1, c-1);
        checkMine(r-1, c);
        checkMine(r-1, c+1);
        // left right
        checkMine(r, c-1);
        checkMine(r, c+1);
        //bottom 3
        checkMine(r+1, c-1);
        checkMine(r+1, c);
        checkMine(r+1, c+1);
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        if (!gameOver) { // Prevent multiple alerts
            gameOver = true;
            setTimeout(() => {
                alert("Congratulations, you cleared the board!\nTo start again press the button: Start Game");
            }, 400);
        }
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
       }
    if (minesLocation.includes(r.toString()+ "-" + c.toString())) {
        return 1;
    }
    return 0;
    
    
}