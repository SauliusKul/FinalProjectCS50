var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function() {
    const columnCount = 7;
    const rowCount = 6;
    // Counts clicks on the game board, which result in a move being made
    var clickCounter = 0;
    const numberToWin = 4;
    // Counts wins to identify duplicate win conditions (as in a column and a
    // diagonal being connected with a single move)
    var winCount = 0;

    // Connects the user to a socket
    var socket = io();

    // On connecting to a socket, sends a welcome message to the server
    socket.on('connect', function() {
        socket.emit('message', {data: 'I\'m connected!'});
    });

    // On clicking a form button, sends the username of the challenged player to the
    // server and invokes the invite function
    $(".challenge-button").click(function(event) {
        event.preventDefault();
        var challengedName = $(".challengeInput").val();

        socket.emit("invite", challengedName);
    })

    // On receiving a callback from the server, adds flashed message to the html of the
    // javascript-based message flashing 
    socket.on('enableHTML', function(data) {
        console.log("works");
        $(".flash-message.challenge").empty();
        $(".flash-message.challenge").append(data);
    })

    // Creates an object spread template for win condition counters
    const emptyCondidtions = {horizontalCount:0, verticalCount:0, diagonalCount:0};

        $(".cell").hover(function() {
            let hoveredColumn = firstObjectClass($(this));
            let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
            // Adds a "colour"-opaque css class to the lowest unoccupied row of the column, which is being hovered.
            // Colour is decided based on the clickCounter variable, which is incremented every time a player
            // makes a move (starting from red).
            if (clickCounter % 2 == 0)
            {
                addClassToCell(hoveredColumn, lowestUnoccupiedRow, "rd-opaque");  
            }

            else
            {
                addClassToCell(hoveredColumn, lowestUnoccupiedRow, "blu-opaque");
            }
        },

        function() {
            let hoveredColumn = firstObjectClass($(this));
            let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
            // Removes the "colour"-opaque css class of the lowest unoccupied row of the column, which is 
            // no longer being hovered.
            if (clickCounter % 2 == 0)
            {
                removeClassFromCell(hoveredColumn, lowestUnoccupiedRow, "rd-opaque");  
            }

            else
            {
                removeClassFromCell(hoveredColumn, lowestUnoccupiedRow, "blu-opaque");
            }
    })

    // Executes game logic to add a token to the column on which the player has clicked 
    // and checks for win conditions.
    $(".cell").click(function() {

        let selectedColumn = firstObjectClass($(this));
        let lowestUnoccupiedRow = findLowestUnoccupiedRow(selectedColumn);        
        let currentLowestCell = $(".wrapper-row" + lowestUnoccupiedRow + " ." + selectedColumn);

        // Adds css class "red" if it's red player's turn, removes hovered cell class
        if (clickCounter % 2 == 0) {
            currentLowestCell.addClass("red");
            removeClassFromCell(selectedColumn, lowestUnoccupiedRow, "rd-opaque");
        }

        // Adds css class "blue" if it's blue player's turn, removes hovered cell class
        else 
        {
            currentLowestCell.addClass("blue");
            removeClassFromCell(selectedColumn, lowestUnoccupiedRow, "blu-opaque");
        }

        let table = Array();

        for (let i = 0; i < rowCount; i++)
        {
            table[i] = new Array();
        }

        // BAD CODE Rewrites the entire table each click
        // Creates a 2D array of the game from the html tags
        for (let i = 0; i < rowCount; i++)
        {
            for (let j = 0; j < columnCount; j++)
            {   
                // Unnecessary
                table[i][j] = 0;

                let rowString = ".wrapper-row" + (i + 1) + " .col" + (j + 1);

                if ($(rowString).attr("class").includes("red"))
                {
                    table[i][j] = "r";
                }

                if ($(rowString).attr("class").includes("blue"))
                {
                    table[i][j] = "b";
                }
            }
        }

        // Initializes the winning conditions objects, since the values are to be passed by reference
        var redWinningConditions = {...emptyCondidtions};
        var blueWinningConditions = {...emptyCondidtions};


        // Checks for horizontal and vertical win conditions
        for (let i = 0; i < rowCount; i++)
        {
            for (let j = 0; j < columnCount; j++)
            {
                
                if (checkHorizontalTable("r", redWinningConditions, table, i, j))
                {
                    winner("Red wins!", "red");
                }

                if (checkHorizontalTable("b", blueWinningConditions, table, i, j))
                {
                    winner("Blue wins!", "blue");
                }

                if (checkVerticalTable("r", redWinningConditions, table, j))
                {
                    winner("Red wins!", "red");
                }
    
                if (checkVerticalTable("b", blueWinningConditions, table, j))
                {
                    winner("Blue wins!", "blue");
                }
                
                // Resets the vertical counters, so they are not carried over into the next column
                redWinningConditions.verticalCount = 0;
                blueWinningConditions.verticalCount = 0;
            }

            // Resets the horizontal counters, so they are not carried over into the next row
            blueWinningConditions.horizontalCount = 0;
            redWinningConditions.horizontalCount = 0;
        }

        // Checks diagonal win conditions for the two diagonals, which do not initiate on the top row 
        for (let i = 1; i < rowCount - (numberToWin - 1); i++)
        {
            // checkDiagonal structure: Colour, winning counter object, 2D table, starting row, starting column,
            // checking direction where 1 = left to right; -1 = right to left
            if (checkDiagonal("r", redWinningConditions, table, i, 0, 1) || checkDiagonal("r", redWinningConditions, table, i, 6, -1)) 
            {
                winner("Red wins!", "red");
            }

            if (checkDiagonal("b", blueWinningConditions, table, i, 0, 1) || checkDiagonal("b", blueWinningConditions, table, i, 6, -1))
            {
                winner("Blue wins!", "blue");
            }    
        }

        // Checks diagonal win conditions for the remaining diagonals, which initiate on the top row         
        for (let i = 0; i < columnCount - (numberToWin - 1); i++)
        {
            if (checkDiagonal("r", redWinningConditions, table, 0, i, 1) || checkDiagonal("r", redWinningConditions, table, 0, columnCount - i, -1))
            {
                winner("Red wins!", "red");
            }

            if (checkDiagonal("b", blueWinningConditions, table, 0, i, 1) || checkDiagonal("b", blueWinningConditions, table, 0, columnCount - i, -1))
            {
                winner("Blue wins!", "blue");
            }
        }

        // Checks if the top of the board is filled and noone has won yet (since the 
        // winning functions have not been invoked above)
        let drawCount = 0;

        for (let i = 0; i < columnCount; i++)
        {
            if(table[0][i] == "r" || table[0][i] == "b")
            {
                drawCount++;
            }
        }

        if (drawCount == 7)
        {
            winner("Draw!", "pink");
        }

        // Checks if the cell is an actual cell and not outside of the bounds, increments the click counter by 1
        // if true. Catches errors, so they don't show up in the console.
        try
        {
            if (currentLowestCell.attr("class").includes("red") || currentLowestCell.attr("class").includes("blue"))
            {
                clickCounter++;
            }            
        }

        catch(err) {}

    })

    // checks if the cell of a given row or column is of the provided colour
    // if yes, then increments counter by 1, if no, resets the counter and returns false,
    // if counter reaches the count required to win the game, returns true
    function checkHorizontalTable(colour, winningConditions, table, row, column)
    {

        // Could create a new function
        if (table[row][column] == colour)
        {
            winningConditions.horizontalCount++;
            
            if (winningConditions.horizontalCount == numberToWin)
            {   
                return true;
            }
        }

        else 
        {
            winningConditions.horizontalCount = 0;
            return false;
        }
    }

    // Checks if the cells of a given column have the colour in question,
    // returns true if there are 4 cells of the same colour in the given column.
    // Returns false otherwise and rests the counter
    function checkVerticalTable(colour, winningConditions, table, column)
    {
        for (let i = 0; i < rowCount; i++)
        {   
            // Could call checkHorizontalTable here instead, but don't know how to pass 
            // winningConditions.verticalCount reference
            if (table[i][column] == colour)
            {
                winningConditions.verticalCount++;                
                if (winningConditions.verticalCount == numberToWin)
                {   
                    return true;
                }
            }
    
            else 
            {
                winningConditions.verticalCount = 0;
            }
        }
        
        return false;
    }

    // Recursivelly traverses the diagonal cells from top to bottom, and increments the counter
    // by 1 for every match of the colour given, resets the counter at the end if neither player
    // has 4 tokens in a diagonal orientation
    function checkDiagonal(colour, winningConditions, table, row, column, modifier) 
    {
        // Checks if the recursion is out of bounds on the base of the table, 
        // on the right side of the table, or on the left side of the table
        if (row == rowCount || column == columnCount || column == -1)
        {
            winningConditions.diagonalCount = 0;
            return false;
        }

        // Calls the function recursively, with an incremented row and an modified (+1 or -1 depending
        // on the direction) column. Returns true, if there are 4 tokens connected diagonally
        if (checkDiagonal(colour, winningConditions, table, row + 1, column + modifier, modifier)) 
        {
            return true;
        }

        // Checks if the current cell is of the colour in question returns true if 
        // 4 tokens of the same colour are connected diagonally.
        if (table[row][column] == colour)
        {
            winningConditions.diagonalCount++;

            if (winningConditions.diagonalCount == numberToWin)
            {
                return true;
            }
        }

        // Resets the counter if the cell is of a different colour than specified.
        else 
        {
            winningConditions.diagonalCount = 0;
            return false;
        }
    }

    // Identifies and returns the lowest unoccupied row in a given column based on if the cell 
    // has css classes "red" or "blue". 
    function findLowestUnoccupiedRow(selectedColumn)
    {
        let lowestUnoccupiedRow = 0;

        // Iterates through all of the rows (rowCount being the lowest row)
        for (i = 1; i <= rowCount; i++)
        {   
            lowestUnoccupiedCellAttributes = $(".wrapper-row" + i + " ." + selectedColumn).attr("class");
            if (! (lowestUnoccupiedCellAttributes.includes("red") || lowestUnoccupiedCellAttributes.includes("blue")))
            {
                if (i > lowestUnoccupiedRow)
                {
                    lowestUnoccupiedRow = i;
                }
            }
        }

        return lowestUnoccupiedRow;
    }

    // Returns the first css class of an html tag as a string
    function firstObjectClass(itemObject)
    {
        return itemObject.attr("class").split(/\s+/)[0];
    }

    // Adds a specified class to the cell of a given row and column
    function addClassToCell (column, row, Class, modifier = 0)
    {
        $(".wrapper-row" + (row - modifier) + " ." + column).addClass(Class);
    }

    // Removes a specified class from the cell of a given row and column
    function removeClassFromCell (column, row, Class, modifier = 0)
    {
        $(".wrapper-row" + (row - modifier) + " ." + column).removeClass(Class);
    }

    // Shows HTML div with the winning message if the player who had blue tokens wins
    function winner(winningMessage, colour)
    {
        if (winCount == 0)
        {
            $(".xWin").addClass("show");
            $(".winning-message").append(winningMessage);
            $(".winning-message").css("color", colour);

            // Sends an ajax object to the server in order to increment the player's games played count
            sendIncrementAjax();
    
            winCount++;    
        }
    }

    // Invokes server side route /gameover and sends an increment object to the function
    function sendIncrementAjax()
    {
        $.ajax({
            url: "/gameOver",
            type: "POST",
            data: {"increment":1}
        });
    }
})


/*
TODO: Create an invisible circle 1 for each colour
TODO: Create an AI to play against
*/
