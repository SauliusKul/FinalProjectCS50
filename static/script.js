var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function() {
    var columnCount = 7;
    var rowCount = 6;
    var clickCounter = 0;
    let numberToWin = 4;

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

        var redWinningConditions = {horizontalCount:0, verticalCount:0, diagonalCount:0};
        var blueWinningConditions = {horizontalCount:0, verticalCount:0, diagonalCount:0};

        // Connect the two for's
        for (let i = 0; i < rowCount; i++)
        {
            for (let j = 0; j < columnCount; j++)
            {
                
                if (checkHorizontalTable("r", redWinningConditions, table, i, j))
                {
                    console.log("red wins!");
                }

                if (checkHorizontalTable("b", blueWinningConditions, table, i, j))
                {
                    console.log("Blue wins!");
                }
            }
        }

        for (let i = 0; i < columnCount; i++)
        {    
            if (checkVerticalTable("r", redWinningConditions, table, i))
            {
                console.log("red wins!");
            }

            if (checkVerticalTable("b", blueWinningConditions, table, i))
            {
                console.log("blue wins!");
            }
        }

        // Could do recursion here?
        for (let i = 1; i < rowCount - (numberToWin - 1); i++)
        {
            if (checkDiagonal("r", redWinningConditions, table, i, 0, 1) || checkDiagonal("r", redWinningConditions, table, i, 0, -1)) 
            {
                console.log("red wins!");
            }

            if (checkDiagonal("b", blueWinningConditions, table, i, 0, 1) || checkDiagonal("b", blueWinningConditions, table, i, 0, -1))
            {
                console.log("blue wins!");
            }    
        }

        for (let j = 0; j < columnCount - (numberToWin - 1); j++)
        {
            if (checkDiagonal("r", redWinningConditions, table, 0, j, 1) || checkDiagonal("r", redWinningConditions, table, 0, columnCount - j, -1))
            {
                console.log("red wins!");
            }

            if (checkDiagonal("b", blueWinningConditions, table, 0, j, 1) || checkDiagonal("b", blueWinningConditions, table, 0, columnCount - j, -1))
            {
                console.log("blue wins!");
            }
        }

        clickCounter++;
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
            console.log(row, column);
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

})


/*
TODO: Make a low opacity circle appear if hovered over a column
TODO: Check if there are 4 circles of the same colour connected
TODO: Create an invisible circle 1 for each colour
TODO: Create an AI to play against
*/
