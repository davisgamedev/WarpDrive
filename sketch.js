let randomRange = (from, to) => { return Math.random() * (to-from) + from; };
let randomTo = (to) => { return Math.random() * to; };

function getRandomHSB(h){
    if(!h) h = Math.random()*360|0;
    var s = 100;
    var b = randomRange(80, 100);
    return 'hsl(' + h + ',' + s + '%,' + b + '%)';
}

const numLasers = 200;
const numLaserPrebuilds = 5;

let elapsedTime = 0.0;

window.laserLifetimes = [];

window.addLifeTime = function(lifetime) {
    //window.laserLifetimes.push(lifetime);
}

let lasers = [];

let goal = 1000;

function main() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

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

            this.from =     randomRange(50, 300);
            if(Math.random() < 0.4) this.from = randomRange(10, 100);

            this.dirs = this.dirs.map(x => randomRange(0, Math.PI*2));

            this.length =   randomRange(0, 10);

            this.speed =    randomRange(10, 100);
            this.accel =    randomRange(15, 300);
            this.growth =   randomRange(0, 2);

            this.color = getRandomHSB(randomRange(200, 280));
            this.width = randomRange(0.5, 5);
            this.alpha = 0;
            this.alphaSpeed = randomRange(10, 100);
            this.alphaMax = randomRange(0.1, 0.8);
        }

        this.draw = function(){
            ctx.save();

            ctx.translate(canvas.width/2, canvas.height/2);

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
            if(this.alpha < this.alphaMax) this.alpha += this.alphaSpeed * dt;
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

            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(25, 0, 25, 0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
