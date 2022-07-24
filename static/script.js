var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function() {
    let rowCount = 6;
    let clickCounter = 0;
        //if ($(cell).mouseover(function (){}))
    $(".cell").click(function() {

        selectedColumn = firstObjectClass($(this));

        let lowestUnoccupiedRow = findLowestUnoccupiedRow(selectedColumn);

        addClassToLowestUnoccupiedCell(selectedColumn, lowestUnoccupiedRow, "circle");
        
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


    // $(".cell").hover(function() {
    //         hoveredColumn = firstObjectClass($(this));
    //         let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
    //         if (clickCounter % 2 == 0)
    //         {
    //             addClassToLowestUnoccupiedCell(hoveredColumn, lowestUnoccupiedRow, "red-opaque");  
    //         }

    //         else
    //         {
    //             addClassToLowestUnoccupiedCell(hoveredColumn, lowestUnoccupiedRow, "blue-opaque");
    //         }
    //     },

    //     function() {
    //         hoveredColumn = firstObjectClass($(this));
    //         let lowestUnoccupiedRow = findLowestUnoccupiedRow(hoveredColumn);
            
    //         if (clickCounter % 2 == 0)
    //         {
    //             removeClassFromLowestUnoccupiedCell(hoveredColumn, lowestUnoccupiedRow, "red-opaque");  
    //         }

    //         else
    //         {
    //             removeClassFromLowestUnoccupiedCell(hoveredColumn, lowestUnoccupiedRow, "blue-opaque");
    //         }
    // })

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

    function addClassToLowestUnoccupiedCell (selectedColumn, lowestUnoccupiedRow, appendedClass)
    {
        if (lowestUnoccupiedRow > 1)
        {
            $(".wrapper-row" + (lowestUnoccupiedRow - 1) + " ." + selectedColumn).addClass(appendedClass);
        }  
    }

    function removeClassFromLowestUnoccupiedCell (selectedColumn, lowestUnoccupiedRow, appendedClass)
    {
        if (lowestUnoccupiedRow > 1)
        {
            $(".wrapper-row" + (lowestUnoccupiedRow - 1) + " ." + selectedColumn).removeClass(appendedClass);
        } 
    }

})


/*
TODO: Make a low opacity circle appear if hovered over a column
TODO: Check if there are 4 circles of the same colour connected
TODO: Create an invisible circle 1 for each colour
TODO: Create an AI to play against
*/
