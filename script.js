    let countries = []
    let stations = []

    const baseURL = "https://de1.api.radio-browser.info/json/"
// LOAD COUNTRIES
    async function loadcountries(params) {
        const res = await fetch(`${baseURL}countries`)
        countries = await res.json();
        console.log(countries)

        const select = document.getElementById("countrySelect")
        select.innerHTML = "";

        countries.forEach(c => {
            let opt = document.createElement("option");
            opt.value = c.name
            opt.textContent = c.name
            select.appendChild(opt)

        });    
    }

    // LOAD ALL COUNTRIES STATIONS
    async function loadstations (country){
        const res = await fetch(`${baseURL}stations/bycountry/${country}?limit=50`)
        stations = await res.json();
        const select = document.getElementById("stationSelect");
        select.innerHTML = ""

        stations.forEach((s, i) =>{
            if(s.url_resolved)
            {
                let opt = document.createElement("option")
                opt.value = i
                opt.textContent = s.name
                select.appendChild(opt)

            }

        })
        updateUI()
    }

    function updateUI()
    {
        const station = stations[stationSelect.value]
        if(!station) return;

        document.getElementById("stationName").textContent = station.name
        document.getElementById("stationInfo").textContent = 
        `${station.tags} || "No Genre" 🦖 ${station.bitrate || "?"} kbps`

        document.getElementById("stationLogo").src = 
        (station.favicon && station.favicon.startsWith("http"))
        ? station.favicon
        : "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png"
    }
    countrySelect.addEventListener("change", e => {
        loadstations(e.target.value)
    })

    stationSelect.addEventListener("change", updateUI)
/* ---------------- AUDIO ---------------- */
const audio = document.getElementById("audio");
let audioCtx, analyser, source, dataArray;

function playRadio() {
    const station = stations[stationSelect.value];
    if (!station) return;

    audio.src = station.url_resolved;
    audio.play();

    updateUI();
    document.getElementById("stationLogo").classList.add("playing");

    if (!audioCtx) {
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(audio);

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        animate();
    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function stopRadio() {
    audio.pause();
    document.getElementById("stationLogo").classList.remove("playing");
}

/* ---------------- ANIMATION ---------------- */
function animate() {
    requestAnimationFrame(animate);

    analyser.getByteFrequencyData(dataArray);

    const bars = document.querySelectorAll(".bar");

    bars.forEach((bar, i) => {
        let val = dataArray[i];
        bar.style.height = (val / 2 + 5) + "px";

        let hue = (i * 10 + Date.now() / 30) % 360;
        bar.style.background = `hsl(${hue}, 70%, 60%)`;
    });
}

/* ---------------- CREATE BARS ---------------- */
const eq = document.getElementById("equalizer");

for (let i = 0; i < 60; i++) {
    let bar = document.createElement("div");
    bar.classList.add("bar");
    eq.appendChild(bar);
}
    loadcountries();
   
