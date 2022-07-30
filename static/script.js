var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function() {
    var columnCount = 7;
    var rowCount = 6;
    var clickCounter = 0;
    var numberToWin = 4;
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
            }

            blueWinningConditions.horizontalCount = 0;
            redWinningConditions.horizontalCount = 0;
        }

        for (let i = 0; i < columnCount; i++)
        {    
            if (checkVerticalTable("r", redWinningConditions, table, i))
            {
                redWins();
            }

            if (checkVerticalTable("b", blueWinningConditions, table, i))
            {
                blueWins();
            }

            redWinningConditions.verticalCount = 0;
            blueWinningConditions.verticalCount = 0;
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

    function checkVerticalTable(colour, winningConditions, table, column)
    {
        for (let i = 0; i < rowCount; i++)
        {   
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

    function checkDiagonal(colour, winningConditions, table, row, column, modifier) 
    {
        if (row == rowCount || column == columnCount || column == -1)
        {
            winningConditions.diagonalCount = 0;
            return false;
        }

        if (checkDiagonal(colour, winningConditions, table, row + 1, column + modifier, modifier)) 
        {
            return true;
        }

        if (table[row][column] == colour)
        {
            winningConditions.diagonalCount++;
            if (winningConditions.diagonalCount == numberToWin)
            {
                debugger;
                return true;
            }
        }

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
        $(".xWin").addClass("show");
        $(".winning-message").append("Red wins!");
        $(".winning-message").css("color", "red");
    }

    function blueWins()
    {
        $(".xWin").addClass("show");
        $(".winning-message").append("Blue wins!");
        $(".winning-message").css("color", "blue");
    }
})


/*
TODO: Create an invisible circle 1 for each colour
TODO: Create an AI to play against
TODO: Add login page and block users from entering without logging in!
*/
