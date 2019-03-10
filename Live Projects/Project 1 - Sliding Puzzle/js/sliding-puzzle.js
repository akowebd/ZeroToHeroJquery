$(function () {
    var numberOfPieces = 12,
        aspect = "3:4",
        aspectW = parseInt(aspect.split(":")[0]),
        aspectH = parseInt(aspect.split(":")[1]),
        container = $("#puzzle"),
        imgContainer = container.find("figure"),
        img = imgContainer.find("img"),
        path = img.attr("src"),
        piece = $("<div/>"),
        pieceW = Math.floor(img.width() / aspectW),
        pieceH = Math.floor(img.height() / aspectH),
        idCounter = 0,
        positions = [],
        empty = {
            top: 0,
            left: 0,
            bottom: pieceH,
            right: pieceW
        },
        previous = {},
        timer,
        currentTime = {},
        timerDisplay = container.find("#time").find("span");

    //Splitting an image into pieces
    for (var x = 0, y = aspectH; x < y; x++) {
        for (var a = 0, b = aspectW; a < b; a++) {
            var top = pieceH * x,
                left = pieceW * a;
            piece.clone()
                .attr("id", idCounter++)
                .css({
                    width: pieceW,
                    height: pieceH,
                    position: "absolute",
                    top: top,
                    left: left,
                    backgroundImage: ["url(", path, ")"].join(""),
                    backgroundPosition: [
                        "-", pieceW * a, "px ",
                        "-", pieceH * x, "px"
                    ].join("")
                }).appendTo(imgContainer);
            positions.push({
                top: top,
                left: left
            });
        }
    }

    //Shuffling the puzzle piece
    //Removing the original image from the page
    img.remove();
    //Removing the first piece of the puzzle
    container.find("#0").remove();
    positions.shift();


    //Shuffling the pieces randomly
    $("#start").on("click", function (e) {
        var pieces = imgContainer.children();
        function shuffle(array) {
            var i = array.length;
            if (i === 0) {
                return false;
            }
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1)),
                    tempi = array[i],
                    tempj = array[j];
                array[i] = tempj;
                array[j] = tempi;
            }
        }
        shuffle(pieces);
        $.each(pieces, function (i) {
            pieces.eq(i).css(positions[i]);
        });
        pieces.appendTo(imgContainer);
        empty.top = 0;
        empty.left = 0;
        container.find("#ui").find("p").not("#time").remove();


       // pieces.appendTo(imgContainer).draggable("destroy");
        //Check the timer isn't already running when the Start button is clicked
        if (timer) {
            clearInterval(timer);
            //Start the timer from 0
            timerDisplay.text("00:00:00");
        }
        //Increment the timer every second
        timer = setInterval(updateTime, 1000);
        currentTime.seconds = 0;
        currentTime.minutes = 0;
        currentTime.hours = 0;
        //Update the display on the page so that the player can see how long the current game has taken so far
        function updateTime() {
            if (currentTime.hours === 23 && currentTime.minutes === 59 && currentTime.seconds === 59) {
                clearInterval(timer);
            } else if (currentTime.minutes === 59 && currentTime.seconds === 59) {
                currentTime.hours++;
                currentTime.minutes = 0;
                currentTime.seconds = 0;
            } else if (currentTime.seconds === 59) {
                currentTime.minutes++;
                currentTime.seconds = 0;
            } else {
                currentTime.seconds++;
            }
            newHours = (currentTime.hours <= 9) ? "0" + currentTime.hours : currentTime.hours;
            newMinutes = (currentTime.minutes <= 9) ? "0" + currentTime.minutes : currentTime.minutes;
            newSeconds = (currentTime.seconds <= 9) ? "0" + currentTime.seconds : currentTime.seconds;
            timerDisplay.text([
                newHours, ":", newMinutes, ":", newSeconds
            ].join(""));
        }
        var totalSeconds = (currentTime.hours * 60 * 60) + (currentTime.minutes * 60) + currentTime.seconds;
        if(localStorage.getItem("puzzleBestTime")){
            var bestTime = localStorage.getItem("puzzleBestTime");
            if(totalSeconds < bestTime){
                localStorage.setItem("puzzleBestTime", totalSeconds);
                $("<p/>", {
                    text: "You got a new best time!"
                }).appendTo("#ui");
            }
            
        }else{
            localStorage.setItem("puzzleBestTime", totalSeconds);
            $("<p/>", {
                text: "You got a new best time!"
            }).appendTo("#ui");

        }

        //Making the puzzle pieces draggable using jquery UI's draggable components
        pieces.draggable({
            coantainment: "parent",
            grid: [pieceW, pieceH],
            start: function (e, ui) {
                var current = getPostion(ui.helper);
                if (current.left === empty.left) {
                    ui.helper.draggable("option", "axis", "y");
                } else if (current.top === empty.top) {
                    ui.helper.draggable("option", "axis", "x");
                } else {
                    ui.helper.trigger("mouseup");
                    return false;
                }
                if (current.bottom < empty.top ||
                    current.top > empty.bottom ||
                    current.left > empty.right ||
                    current.right < empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }
                previous.top = current.top;
                previous.left = current.left;

            },
            drag: function (e, ui) {
                var current = getPostion(ui.helper);
                ui.helper.draggable("option", "revert", "false");
                if (current.top === empty.top && current.left === empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }
                if (current.bottom < empty.top ||
                    current.top > empty.bottom ||
                    current.left > empty.right ||
                    current.right < empty.left) {
                    ui.helper.trigger("mouseup").css({
                        top: previous.top,
                        left: previous.left
                    });
                    return false;
                }

            },
            stop: function (e, ui) {
                var current = getPostion(ui.helper),
                    correctPieces = 0;
                if (current.top === empty.top && current.left === empty.left) {
                    empty.top = previous.top;
                    empty.left = previous.left;
                    empty.bottom = previous.top + pieceH;
                    empty.right = previous.left + pieceW;
                }
                $.each(positions, function (i) {
                    var currentPiece = $("#" + (i + 1)),
                        currentPosition = getPostion(currentPiece);
                    if (positions[i].top === currentPosition.top && positions[i].left === currentPosition.left) {
                        correctPieces++;
                    }
                });

                if (correctPieces === positions.length) {
                    clearInterval(timer);
                    $("<p/>", {
                        text: "Congratulations, You solved the puzzle!"
                    }).appendTo("#ui");
                }

            }
        });
        function getPostion(el) {
            return {
                top: parseInt(el.css("top")),
                bottom: parseInt(el.css("top")) + pieceH,
                left: parseInt(el.css("left")),
                right: parseInt(el.css("left")) + pieceW
            }

        }
    });

});