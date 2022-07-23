var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

$(document).ready(function (){
    let columnCount = 7;
    let rowCount = 6;
    
    for (i = 1; i <= columnCount; i++)
    {
        for (j = 1; j <= rowCount; j++)
        {
            //if ($(cell).mouseover(function (){}))
            $(".cell").hover(function (){

                let classList = $(this).parent().attr("class");
                var classArr = classList.split(/\s+/);
                let lowestUnoccupiedRow = 0;
                classList = ("." + classArr[0] + " ." + classArr[1]);

                for (k = 1; k <= rowCount; k++)
                {
                    $(classList).hover(function(){
                        $(this).css("background-color", "red");
                    })
                    // if (classList == "wrapper-row" + k + " wrapper") {
                    //     if ()
                    // }
                }
                //$(this).css("background-color", "blue");
            },
            function() {
                $(this).css("background-color", "white");
            })    
        }
    }

    //while ()
})


/*
TODO: Check which is the lowest free grid space in the column
TODO: Place the circle in the lowest free grid space and assign it a colour
TODO: Switch colours after placing a circle
TODO: Check if there are 4 circles of the same colour connected
TODO: Create an AI to play against
*/
