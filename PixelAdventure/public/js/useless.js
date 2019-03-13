var title = document.title;
var blurMessage = [
    "Please come back! :(",
    "Miss You ❤",
    "I'm feeling lonely :("
];

var intervalTimer = null;
var timeoutTimer = null;

window.addEventListener("blur", function () {
    intervalTimer = setInterval(function () {
        var rand = Math.floor((Math.random() * blurMessage.length));
        document.title = blurMessage[rand];
        timeoutTimer = setTimeout(function () {
            document.title = title;
        }, 4000);
    }, 12000);
});

window.addEventListener("focus", function () {
    clearInterval(intervalTimer);
    clearTimeout(timeoutTimer);
    document.title = title;
});

/* */

var distancePerPoint = 1;
var drawFPS = 120;
var orig = document.querySelector('path'), length, timer;

var timeoutId = 0;

$('.click-hold').on('mousedown', function () {
    timeoutId = setTimeout(startDrawingPath, 1000);
}).on('mouseup mouseleave', function () {
    clearTimeout(timeoutId);
    stopDrawingPath()
});

function startDrawingPath() {
    length = orig.getTotalLength() >= length ? 0 : orig.getTotalLength();
    orig.style.stroke = '#f60';
    timer = setInterval(increaseLength, 1000 / drawFPS);
}

function increaseLength() {
    let pathLength = orig.getTotalLength();
    length += distancePerPoint;
    orig.style.strokeDasharray = [length, pathLength].join(' ');
    if (length >= pathLength) clearInterval(timer);
}

function stopDrawingPath() {
    // clearInterval(timer);
    // orig.style.stroke = '';
    // length = 0;
    timer = setInterval(decreaseLength, 1000 / drawFPS);
}

function decreaseLength() {
    let pathLength = orig.getTotalLength();
    length -= distancePerPoint;
    orig.style.strokeDasharray = [length, pathLength].join(' ');
    if (length >= pathLength) clearInterval(timer);
}