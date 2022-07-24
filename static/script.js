var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function() {
    let rowCount = 6;
    let clickCounter = 0;
        //if ($(cell).mouseover(function (){}))
    $(".cell").click(function() {

        let selectedColumn = $(this).attr("class");
        selectedColumn = selectedColumn.split(/\s+/)[0];

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

        if (lowestUnoccupiedRow > 1)
        {
            $(".wrapper-row" + (lowestUnoccupiedRow - 1) + " ." + selectedColumn).addClass("circle");
        }
        
        let currentLowestCell = $(".wrapper-row" + lowestUnoccupiedRow + " ." + selectedColumn);
        if (clickCounter % 2 == 0) {
            currentLowestCell.addClass("red");
        }

        else 
        {
            currentLowestCell.addClass("blue");
        }

        //$(this).css("background-color", "blue");

        clickCounter++;
    })


    $(".cell").hover(function() {

    })

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
})


/*
TODO: Make a low opacity circle appear if hovered over a column
TODO: Check if there are 4 circles of the same colour connected
TODO: Create an invisible circle 1 for each colour
TODO: Create an AI to play against
*/
