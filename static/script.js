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
            hoveredColumn = firstObjectClass($(this));
            let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
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
            hoveredColumn = firstObjectClass($(this));
            let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
            if (clickCounter % 2 == 0)
            {
                removeClassFromCell(hoveredColumn, lowestUnoccupiedRow, "rd-opaque");  
            }

            else
            {
                removeClassFromCell(hoveredColumn, lowestUnoccupiedRow, "blu-opaque");
            }
    })


    $(".cell").click(function() {

        selectedColumn = firstObjectClass($(this));

        let lowestUnoccupiedRow = findLowestUnoccupiedRow(selectedColumn);

        addClassToCell(selectedColumn, lowestUnoccupiedRow, "circle", 1);
        
        let currentLowestCell = $(".wrapper-row" + lowestUnoccupiedRow + " ." + selectedColumn);
        
        if (clickCounter % 2 == 0) {
            currentLowestCell.addClass("red");
            removeClassFromCell(selectedColumn, lowestUnoccupiedRow, "rd-opaque");
        }

        else 
        {
            currentLowestCell.addClass("blue");
            removeClassFromCell(selectedColumn, lowestUnoccupiedRow, "blu-opaque");
        }

        let table = Array();

        for (let i = 0; i < rowCount; i++)
        {
            table[i] = new Array(columnCount);
        }

        // Rewrites the entire table each click
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

        // Can be 1 variable :D
        var redWinningConditions = {...emptyCondidtions};
        var blueWinningConditions = {...emptyCondidtions};


        // Connect the two for's
        for (let i = 0; i < rowCount; i++)
        {
            for (let j = 0; j < columnCount; j++)
            {
                
                if (checkHorizontalTable("r", redWinningConditions, table, i, j))
                {
                    redWins();
                }

                if (checkHorizontalTable("b", blueWinningConditions, table, i, j))
                {
                    blueWins();
                }

                if (checkVerticalTable("r", redWinningConditions, table, j))
                {
                    redWins();
                }
    
                if (checkVerticalTable("b", blueWinningConditions, table, j))
                {
                    blueWins();
                }
                
                // Resets the vertical counters, so they are not carried over into the next column
                redWinningConditions.verticalCount = 0;
                blueWinningConditions.verticalCount = 0;
            }

            // Resets the horizontal counters, so they are not carried over into the next row
            blueWinningConditions.horizontalCount = 0;
            redWinningConditions.horizontalCount = 0;
        }

        // Could do recursion here?
        for (let i = 1; i < rowCount - (numberToWin - 1); i++)
        {
            if (checkDiagonal("r", redWinningConditions, table, i, 0, 1) || checkDiagonal("r", redWinningConditions, table, i, 6, -1)) 
            {
                redWins();
            }

            if (checkDiagonal("b", blueWinningConditions, table, i, 0, 1) || checkDiagonal("b", blueWinningConditions, table, i, 6, -1))
            {
                blueWins();
            }    
        }

        for (let j = 0; j < columnCount - (numberToWin - 1); j++)
        {
            if (checkDiagonal("r", redWinningConditions, table, 0, j, 1) || checkDiagonal("r", redWinningConditions, table, 0, columnCount - j, -1))
            {
                redWins();
            }

            if (checkDiagonal("b", blueWinningConditions, table, 0, j, 1) || checkDiagonal("b", blueWinningConditions, table, 0, columnCount - j, -1))
            {
                blueWins();
            }
        }

        drawCount = 0;

        for (let i = 0; i < columnCount; i++)
        {
            if(table[0][i] == "r" || table[0][i] == "b")
            {
                drawCount++;
            }
        }

        if (drawCount == 7)
        {
            $(".xWin").addClass("show");
            $(".winning-message").append("Draw!");
            $(".winning-message").css("color", "pink");
            sendIncrementAjax();
        }

        try 
        {
            if ($(".wrapper-row" + lowestUnoccupiedRow + " ." + selectedColumn).attr("class").includes("circle"))
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
            console.log(column);
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

    function findLowestUnoccupiedRow(selectedColumn)
    {
        let lowestUnoccupiedRow = 0;

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

    function firstObjectClass(itemObject)
    {
        return itemObject.attr("class").split(/\s+/)[0];
    }

    function addClassToCell (column, row, Class, modifier = 0)
    {
        $(".wrapper-row" + (row - modifier) + " ." + column).addClass(Class);
    }

    function removeClassFromCell (column, row, Class, modifier = 0)
    {
        $(".wrapper-row" + (row - modifier) + " ." + column).removeClass(Class);
    }

    function redWins()
    {   
        if (winCount == 0)
        {
            $(".xWin").addClass("show");
            $(".winning-message").append("Red wins!");
            $(".winning-message").css("color", "red");

            sendIncrementAjax();

            winCount++;
        }
    }

    function blueWins()
    {
        if (winCount == 0)
        {
            $(".xWin").addClass("show");
            $(".winning-message").append("Blue wins!");
            $(".winning-message").css("color", "blue");
    
            sendIncrementAjax();
    
            winCount++;    
        }
    }

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
