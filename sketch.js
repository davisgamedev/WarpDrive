let randomRange = (from, to) => { return Math.random() * (to-from) + from; };
let randomTo = (to) => { return Math.random() * to; };

function getRandomHSB(h){
    if(!h) h = Math.random()*360|0;
    var s = 100;
    var b = randomRange(80, 100);
    return 'hsl(' + h + ',' + s + '%,' + b + '%)';
}

window.laserLifetimes = [];
window.addLifeTime = function(lifetime) {
    //window.laserLifetimes.push(lifetime);
}

let lasers = [];
let goal = 1000;

function main() {

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    var video = document.querySelector("#videoRecord");
    var videoStream = canvas.captureStream(60);

    const options = {
        //3,000,000,000
        videoBitsPerSecond: 15000000,
        mimeType: 'video/webm;codecs=h264,vp9',
        //type: 'video/webm;codecs=h264,vp9,opus',
        minWidth: canvas.width,
        minHeight: canvas.height,
    }

    var mediaRecorder = new MediaRecorder(videoStream, options);
    var chunks = [];

    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = function(e) {
    var blob = new Blob(chunks, options);
        chunks = [];
        var videoURL = URL.createObjectURL(blob);
        video.src = videoURL;
    };

    // mediaRecorder.setVideoSize(640, 480);
    // mediaRecorder.setVideoFrameRate(60); //might be auto-determined due to lighting
    // mediaRecorder.setVideoEncodingBitRate(3000000);
    // mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);// MPEG_4_SP
    // mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

    let elapsedTime = 0.0;
    let recordTimeStart = 0.0;
    let recordTimeEnd = 5.0;
    let recording = false;
    let recordingDone = false;

    const offset = {x: 0, y: 0};
    const center = {x: canvas.width/2 + offset.x, y: canvas.height/2 + offset.y };
    
    const numLasers = 300;
    const subLasers = 10;


    function laser() {

        this.from;
        this.length;
        this.dirs = new Array(subLasers).fill(0);

        this.speed; this.accel; this.growth;

        this.color;
        this.width;
        this.alpha;

        this.localTime;

        this.create = function(){
            this.reCreate();
            this.from += randomTo(canvas.width);
            this.speed += randomTo(this.speed + this.accel);
        }

        this.reCreate = function() {
            this.localTime = 0.0;

            this.from =     randomRange(50, 200);
            if(Math.random() < 0.1) this.from = randomRange(0, 50);

            this.dirs = this.dirs.map(x => randomRange(0, Math.PI*2));

            this.length =   randomRange(0, 10);

            this.speed =    randomRange(50, 100);
            this.accel =    randomRange(15, 250);
            this.growth =   0;//randomRange(0, 2);

            this.color = getRandomHSB(randomRange(200, 280));
            this.width = randomRange(0.5, 4);
            this.alpha = 0;
            this.alphaSpeed = randomRange(0.05, 2);
            this.alphaMax = randomRange(0.5, 0.8);
        }


        ctx.lineCap = "round";

        this.draw = function(){
            ctx.save();

            ctx.translate(center.x, center.y);

            this.dirs.forEach((d, i) => {
                ctx.rotate(d)
    
                ctx.globalAlpha = this.alpha;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.width;
    
                // can later add more 'lines' by offsetting vals
                ctx.beginPath();
                ctx.moveTo(this.from, 0);
                ctx.lineTo(this.from + this.length, 0);
                ctx.stroke();

                this.dirs[i] += (0.01 * delta);
            });
            ctx.restore();
        }
        
        this.update = function(dt) {
            if(this.from > canvas.width && this.localTime > 0) {
                window.addLifeTime(this.localTime);
                this.reCreate();
            }
            this.localTime += dt; 
            this.accel += Math.random() * 100 * dt;
            this.speed += this.accel * dt;
            this.growth += this.accel * dt;
            this.from += (this.speed * dt) + (this.growth*dt);
            this.length += this.growth * dt;
            if(this.alpha < this.alphaMax) {
                this.alpha += this.alphaSpeed * dt;
            }
        }
    }


    (function populate() {
        for(let i = 0; i < numLasers; i++) {
            lasers.push(new laser());
            lasers[i].create();
        }
    }());


    let play = true;
    let prev = Date.now();
    let curr = Date.now();
    let delta = 0;

    (function draw(){
        if(play) {
            curr = Date.now();
            delta = (curr - prev)/1000;
            prev = curr;

            elapsedTime += delta;
            if(!recordingDone) {
                if(recording && elapsedTime > recordTimeEnd) {
                    console.log("recording done!");
                    mediaRecorder.stop();
                    recordingDone = true;
                    recording = false;
                }
                else if(!recording && elapsedTime > recordTimeStart) {
                    console.log("recording started!");
                    mediaRecorder.start();
                    recording = true;
                }
            }

            //ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "rgba(27, 2, 27, 0.8)";
            ctx.ellipse(center.x, center.y, 50, 50, 0, 0, Math.PI * 2);
            ctx.fill();
            
            lasers.forEach(l => {
                l.draw();
                l.update(delta);
            })

            //let first = lasers[0];
            //console.log(`first x: ${first.from}, first length: ${first.length}`)
            //console.log(first.speed);

            requestAnimationFrame(draw);

            if(laserLifetimes.length > goal) {
                goal += 1000;

                console.log(laserLifetimes);

                let size = laserLifetimes.length;
                let avgLifetime = laserLifetimes.reduce((total, num) => total + num/size);
                
                let smallest = 100000;
                let largest = 0;

                laserLifetimes.forEach(l => {
                    if(l > largest) largest = l;
                    if(l < smallest) smallest = l;
                });


                console.log(`${size} lifetimes recorded
                    average was ${avgLifetime},
                    longest was ${largest},
                    shortest was ${smallest},
                    overall span was ${largest-smallest}
                `);

                if(laserLifetimes.length > 100000) {
                    goal = 1000;
                    laserLifetimes = [];
                }
            }
        }
    })();
}

window.onload = main;
