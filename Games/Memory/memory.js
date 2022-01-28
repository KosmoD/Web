/*Game Objects*/

function Cal() {
    this.cals =  [];
    this.Ops = new Operations();
//    this.Num = new Numbers(this.Ops);

    this.init =  function() {
        this.Ops = new Operations();
        this.Ops.set();
        var Num = new Numbers(this.Ops);
        Num.set();

        var i = 0; j = 0;
        for(var count = 0; count < this.Ops.len + Num.len; count++ ) {
            if(count % 2 == 0)
                this.cals[count] = Num.numArray[i++];
            else
                this.cals[count] = this.Ops.opsArray[j++];
        }
    };

    this.ans = function() {
        function combine(a, b, type) {
            if(type == "+")
                return a + b;
            else return a - b;
        }

        var ans = this.cals[0];
        for(var i = 1; i <= this.cals.length - 1; i += 2) {
            ans = combine(ans, this.cals[i+1], this.cals[i].type)
        }

        return ans;
    }
};

function newScene() {
    var c = new Cal();
    c.init();
    while(c.ans() <= 0)
        c.init();
    return c;
}

function Operations() {
    this.len = 0;
    this.opsArray = [];
    this.set = function() {
        this.len = Math.floor(Math.random()*2 + 1); //it's easy
        for(var i = 0; i < this.len; i++) {
            var type;
            if(Math.floor(Math.random()*2) >= 1)
                type = "+";
            else type = "-";
            this.opsArray.push(new operator(type));
        }
    }
}

function operator(type) {
    this.type = type;
}

function Numbers(ops) {
    this.len = ops.len + 1;
    this.numArray = [];
    this.set = function() {
        for(var i = 0; i < this.len; i++) {
            var newNum = Math.floor(Math.random()*9 + 1);
            this.numArray.push(newNum);
        }
    }
}


/* DOM Display */

function elt(name, className, idName) {
    var elt = document.createElement(name);
    $(elt).attr({
        class: className,
        id: idName
    });
    return elt;
}

var wrapper = $("#game");

function drawSke() {
    wrapper.append(elt('div', 'cal', 'cal'));
    wrapper.append(elt('div', 'player', 'player'));

    function createButton(type, idButton) {
        var button = elt('button', 'btn', idButton);
        $(button).text(type);
        $(".player").append(button);
    }

    createButton('+', "add");
    createButton('-', "sub");

    var bar = elt('div', 'bar', 'bar');
    $(bar).append(elt('div', 'progress', 'progress'));
    $('body').append(bar);
}

function showCal(ops) {
    var cal = $('#cal');
    for(var i = 0; i < ops.cals.length; i++) {
        var cell = elt('span', "cell", i);
        if(typeof ops.cals[i] == "number")
            $(cell).text(ops.cals[i]);
        cal.append(cell);
    }

    var equalSign = elt('span', 'cell');
    $(equalSign).text('=');
    cal.append(equalSign);

    var ans = elt('span', cell);
    ans.textContent = ops.ans();
    cal.append(ans);
}

function setButton(times) {
    var b = elt('div', 'control', 'start');
    var a = elt('a', 'ctrl-button');
    $(a).text('Play Again');
    if(!times)
        $(a).text('Begin');
    $(b).append(a);
    $('body').append(b);
    $(b).show();

}

/*Global variables*/
var scene, progressWidth = 0, times = 0, frames = 0;
var playerOps = [], spanId = 1, ans;
var score = 0, lose = false, best;

/*player init*/
function putIn(type) {
    playerOps.push(new operator(type));
    var id = '#' + spanId;
    $(id).text(type);
    spanId += 2;
}

var runGame;
/*loop game*/
function loop() {
    if(frames++ % 3 == 0) {
        progressWidth += 5;
        $('#progress').css('width',  progressWidth + 'px');
    }

    if(fini()) {
        score++;
        reset();
        update();
    }

    runGame = requestAnimationFrame(loop);
};


function fini() {
    if(playerOps.length == scene.Ops.opsArray.length) {
        for(var i = 1, j = 0; i < scene.cals.length; i+=2, j++) {
            if(playerOps[j])
                scene.cals[i] = playerOps[j];
        }

        if(scene.ans() == ans)
            return true;

        lose = true;
    }
    return false;
}

/*game control*/
function reset() {
    progressWidth = 0;
    playerOps = [];
    spanId = 1;
}

function update() {
    scene = newScene();
    ans = scene.ans();
    $('#cal').empty();
    showCal(scene);
}

function _init() {
    scene = newScene();
    ans = scene.ans();
    
    drawSke();
    showCal(scene);
    setButton(times);
}

function showResult() {
    updateScore();

    $('#bar').hide();
//    $('#start').remove();
//    setButton(times);

    var pop = elt('div', 'game-over', 'game-over');
    var p = [];
    for(var i = 0; i < 3; i++) {
        p[i] = elt('p');
        pop.appendChild(p[i]);
    }

    p[0].textContent = "Game Over";
    p[1].textContent = "Score: " + score;
    p[2].textContent = "Best: " + JSON.parse(localStorage["high-score"]);

    if(best) {
        console.log('new high score');
        var newBest = elt('span', 'new');
        $(newBest).text('New');
        $(p[2]).append(newBest);
    }

    $('body').append(pop);

    $("#start").remove();
    setButton(times);
    $('#start').find('a').attr('href', '');
}

function updateScore() {
    var highscore = false;
    best = false;

    if(localStorage["high-score"]) {
        highscore = JSON.parse(localStorage["high-score"]);
        if(score > highscore) {
            highscore = score;
            best = true;
        }
        localStorage["high-score"] = JSON.stringify(highscore);
    }
    else {
        highscore = score;
        localStorage["high-score"] = JSON.stringify(highscore);
    }
}

/*main*/

$(function() {
    var playing = false;
    _init();

    $('#start').click(function() {
        console.log('new game');
        playing = true;
        times++;

        $(this).hide();
        $('#bar').show();

        runGame = requestAnimationFrame(loop);
    });

    var getAns = setInterval(function() {
        if(playing) {
            if(lose || progressWidth > 520) {
                console.log('game over');
                //play again
                showResult();
                clearInterval(getAns);

                cancelAnimationFrame(runGame);
            }
        }
    }, 50);


    $('#add').click(function() {
        if(playing)
            putIn('+');
    });
    $('#sub').click(function() {
        if(playing)
            putIn('-');
    });
});

