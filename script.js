let current_song = new Audio()
let play = document.querySelector(".play-footer-div")
let current_index = 0;
let songs;
let currfolder;

current_song.addEventListener("play", () => {
    play.firstElementChild.src = "assets/play-pause.svg";
});
current_song.addEventListener("pause", () => {
    play.firstElementChild.src = "assets/play.svg";
});

// seconds to minutes
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    // Add leading zero if seconds < 10
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}


// get songs from file


async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currfolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let music_link = div.getElementsByTagName("a");
    songs = []

    for (let i = 0; i < music_link.length; i++) {
        let element = music_link[i];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }


    // shows all the songs in playlist
    let songUL = document.querySelector(".songs-list").getElementsByTagName("ol")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li class = "list">
                            <div class="inside-list-1">
                                <img src="assets/music.svg" class="music-svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>God Ninja</div>
                                </div>
                            </div>
                            <div class="inside-list">
                                <div>play now</div>
                                <img src="assets/play_circle.svg" alt="">
                            </div>
                        </li>`;
    }


}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    if (!pause) {
        current_song.src = `/${currfolder}/` + track;
        current_song.play();
    }



    play.firstElementChild.src = "assets/play.svg";
    document.querySelector(".song-info").innerHTML = `${track.replaceAll("%20", " ")}`;

    // current_song.addEventListener("loadeddata",()=>{
    // let duration = current_song.duration;
    // console.log(duration,current_song.currentSrc,current_song.currentTime);
    // })
    // document.querySelector(".song-time").innerHTML = `${current_song.currentSrc}` / `${duration}`;

    current_song.addEventListener("timeupdate", () => {
        let present = Number(parseFloat(current_song.currentTime).toFixed(2));
        let overall = Number(parseFloat(current_song.duration).toFixed(2));
        document.querySelector(".song-time").innerHTML = `${formatTime(present)} / ${formatTime(overall)}`;
        document.querySelector(".circle").style.left = (current_song.currentTime / current_song.duration) * 100 + "%";


    })

    // add an event listener on seekbar
    let seekbar_event = document.querySelector(".seekbar");
    seekbar_event.addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        current_song.currentTime = ((e.offsetX / e.target.getBoundingClientRect().width) * current_song.duration);

    })
}

async function displayalbum() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let heroInside = document.querySelector(".hero-inside");
    heroInside.innerHTML = ""; // Clear previous cards

    for (let i = 0; i < anchors.length; i++) {
        const e = anchors[i];

        if (e.href.includes("/songs")) {
            let folder = e.href.split('/').slice(-2)[0];
            // get the meta data of the folder so that playlist ka card img show ho paye;
            let infoRes = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let info = await infoRes.json();

            // Create card element
            let cardDiv = document.createElement("div");
            cardDiv.className = "div-hero";
            cardDiv.setAttribute("data-folder", folder);
            cardDiv.innerHTML = `
                <div class="svg-play-card-div flex justify-center items-center">
                    <img src="assets/play.svg" alt="" class="svg-play-card">
                </div>
                <div class="card">
                    <img src="/songs/${folder}/cover.png" title="second-card" class="card-img border">
                </div>
                <div class="card-footer">
                    <span class="color-white">${info.description}</span>
                </div>
            `;
            heroInside.appendChild(cardDiv);
        }
    }
    // attach an event listner for each playlist
    document.querySelectorAll(".div-hero").forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getsongs(`songs/${items.currentTarget.dataset.folder}`)
        })

    })
}

async function main() {

    // get the list of all songs
    let songs = await getsongs("songs/playlist1");

    // display all albums
    displayalbum();


    // attach an event listner for each song

    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

        })

    })


    // Attach an event listener for next, play and prev
    // play
    play.addEventListener("click", () => {
        if (current_song.paused) {
            current_song.play();
            play.firstElementChild.src = "assets/play-pause.svg";
        }

        else {
            current_song.pause();
            play.firstElementChild.src = "assets/play.svg"
        }
    })

    // prev
    let prev = document.querySelector(".prev-div");

    prev.addEventListener("click", () => {

        current_index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);

        if ((current_index - 1) < 0) {
            return;
        }
        track = songs[current_index - 1];
        playMusic(track)
        current_index--;
    });


    // next
    let next = document.querySelector(".next-div");

    next.addEventListener("click", () => {

        current_index = songs.indexOf(current_song.src.split("/").slice(-1)[0]);
        if ((current_index + 1) > (songs.length - 1)) {
            return
        }
        track = songs[current_index + 1];
        playMusic(track)
        current_index++;
    });

    // volume adjustment
    let vol = document.querySelector(".vol-range");
    vol.addEventListener("change", (e) => {
        // console.log(e, e.target.value, e.target);
        let vol_value = e.target.value / 100;
        current_song.volume = vol_value;

        if (vol_value === 0) {
            let new_vol_svg = document.querySelector(".vol-div");
            new_vol_svg.firstElementChild.src = "assets/vol-off.svg"
        }

        else if (0 < vol_value && vol_value < 0.33) {
            let new_vol_svg = document.querySelector(".vol-div");
            new_vol_svg.firstElementChild.src = "assets/vol-down.svg"
        }

        else if (0.33 <= vol_value && vol_value <= 1) {
            let new_vol_svg = document.querySelector(".vol-div");
            new_vol_svg.firstElementChild.src = "assets/volume.svg"
        }

    })

    // attach an event listner for each playlist
    document.querySelectorAll(".div-hero").forEach(e => {
        e.addEventListener("click", async items => {
            songs = await getsongs(`songs/${items.currentTarget.dataset.folder}`)
        })

    })
    // playMusic(songs[0], true);



    // add event listner to mute the track;

    // document.querySelector(".vol-div").addEventListener("click", e => {
    //     let curr_vol = current_song.volume;
    //     // let curr_svg = 
    //     let range_val = document.querySelector(".vol-range");
    //     let curr_range_val = range_val.target.value;
    //     range_val.target.value = 0;
    //     current_song.volume = 0;
    //     if (current_song.volume === 0) {
    //         let new_vol_svg = document.querySelector(".vol-div");
    //         new_vol_svg.firstElementChild.src = "assets/vol-off.svg"
    //     }
    // })
}

main();


