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


$('.index').click(function() {
    console.log("HEY");
})