function getStatHtml(cssFileUri, streak, wc, lc, st, dates, langs) {
    console.log("dates " + dates)
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="${cssFileUri}">
</head>

<body>  
    <section>
        <div class="cardCont">
            <div class="card">
                <div class="title cardBlock">
                    <h1>Coded a vs code extention...</h1>
                </div>

                <div class="graph cardBlock">
                    <div class="datepicker">
                        <div class="datepicker-calendar" id="graphCont">
                        </div>
                    </div>

                    <p><span style="font-style: normal;">🏅</span>Congrats you set up a session time PR</p>
                </div>

                <div class="stats cardBlock">
                    <div class="statCont">
                        <div>
                            <h1>${streak}</h1>
                            <h2>Streak</h2>
                        </div>
                        <div>
                            <h1>${wc}</h1>
                            <h2>Words</h2>
                        </div>
                        <div>
                            <h1>${lc}</h1>
                            <h2>Lines</h2>
                        </div>

                        <div>
                            <h1>${st}</h1>
                            <h2>Time</h2>
                        </div>
                        <div>
                            <h1>10</h1>
                            <h2>lines</h2>
                        </div>
                        <div>
                            <h1>11</h1>
                            <h2>parts</h2>
                        </div>


                        <div>
                            <h1>${langs[0].split(" ")[1]}</h1>
                            <h2>${langs[0].split(" ")[0]}</h2>
                        </div>
                        <div>
                            <h1>${langs[1].split(" ")[1]}</h1>
                            <h2>${langs[1].split(" ")[0]}</h2>
                        </div>
                        <div>
                            <h1>${langs[3].split(" ")[1]}</h1>
                            <h2>${langs[3].split(" ")[0]}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
<script>
let dateArr = [${dates}];
var graphCont = document.getElementById("graphCont")

for (let i = 0; i < 30; i++) {
    let div = document.createElement("div");
    div.classList.add("date");
    
    if (dateArr[29 - i] != 0) {
        div.classList.add("prev-yes");
        div.textContent = dateArr[29-i];
    }
    else {
        div.classList.add("prev-no");
        div.textContent = "-";
    }
    graphCont.appendChild(div);
}
</script>

</html>
    `
}

module.exports = { getStatHtml }