const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 400;

const keys = {};
addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

// BACKGROUND MUSIC
const bgMusic = new Audio("helldrake.ogg");
bgMusic.loop = true;
bgMusic.volume = 0.35;

function startGame(){

if(!gameStarted){
gameStarted = true;

bgMusic.play().catch(err=>{
console.log("Music blocked:", err);
});

}

}

addEventListener("keydown", e=>{
keys[e.key.toLowerCase()] = true;
startGame();
});

addEventListener("click", startGame);


const gravity = 0.5;
let cameraX = 0;
let gameWon = false;
let startTime = Date.now();
let elapsed = 0;
let deaths = 0;
let gameStarted = false;

// PLAYER
const player={
x:50,y:200,w:20,h:30,
vx:0,vy:0,
speed:23,jump:20,
grounded:false
};

// PLATFORMS
const platforms=[
{x:0,y:350,w:280},
{x:350,y:320,w:60},
{x:500,y:290,w:60},
{x:650,y:260,w:70},
{x:820,y:320,w:150},
{x:1034,y:236,w:30},
{x:1150,y:150,w:80},
{x:1350,y:300,w:110},
{x:1600,y:350,w:30},
{x:1700,y:350,w:30},
{x:1840,y:350,w:40},
{x:2000,y:300,w:150},
{x:2297,y:300,w:39},
{x:2450,y:280,w:20},
{x:2610,y:280,w:46},
{x:2790,y:242,w:40},
{x:2990,y:350,w:210},
{x:3300,y:350,w:50},
{x:3500,y:350,w:50},
{x:3550,y:350,w:400, troll:true, falling:false}
];

// FLAG
const flag={x:3800,y:250,w:20,h:100};

// GOBLINS
let goblins=[];
function createGoblins(){
goblins=[
{x:350,y:310,min:350,max:390,dir:1},
{x:900,y:310,min:820,max:950,dir:1},
{x:1700,y:340,min:1600,max:1880,dir:1},
{x:3200,y:340,min:3000,max:3400,dir:1}
];
}
createGoblins();

// SPIKES
let spikes=[];
function createSpikes(){
spikes=[
{x:500,y:290,t:0,up:false},
{x:1035,y:238,t:0,up:false},
{x:1385,y:300,t:0,up:false},
{x:2300,y:300,t:0,up:false},
{x:3100,y:350,t:0,up:false}
];
}
createSpikes();

// BULLETS
const bullets=[];
addEventListener("keydown",e=>{
if(e.key.toLowerCase()=="p")
bullets.push({x:player.x+20,y:player.y+10});
});

function restart(){

deaths++;   // death counter increases

player.x = 50;
player.y = 200;
player.vx = 0;
player.vy = 0;

createGoblins();
createSpikes();

platforms.forEach(p=>{
if(p.troll){
p.y = 350;
p.falling = false;
}
});

gameWon = false;

}

function collide(a,b){
return(
a.x<b.x+b.w &&
a.x+a.w>b.x &&
a.y<b.y+b.h &&
a.y+a.h>b.y
);
}

function update(){

if(!gameStarted) return;

if(!gameWon){
elapsed = Math.floor((Date.now() - startTime) / 1000);
}

if(gameWon)return;



player.vx = keys.a ? -player.speed : keys.d ? player.speed : 0;

if(keys.w && player.grounded){
player.vy=-player.jump;
player.grounded=false;
}

player.vy+=gravity;
player.x+=player.vx;
player.y+=player.vy;

player.grounded=false;

platforms.forEach(p=>{

if(p.falling) return;

if(
player.x<p.x+p.w &&
player.x+player.w>p.x &&
player.y+player.h<p.y+10 &&
player.y+player.h+player.vy>=p.y
){
player.y=p.y-player.h;
player.vy=0;
player.grounded=true;
}

});

// Troll platform
platforms.forEach(p=>{

if(p.troll){

if(player.x > 3700 && !p.falling){
p.falling = true;
}

if(p.falling){
p.y += 4; // falling speed
}

}

});

// fall
if(player.y>600) restart();

// flag
if(collide(player,{...flag,w:30,h:100})) gameWon=true;

// bullets
bullets.forEach(b=>b.x+=7);

// goblins
goblins.forEach(g=>{

g.x+=g.dir*1.5;
if(g.x<g.min||g.x>g.max) g.dir*=-1;

if(collide(player,{...g,w:20,h:20})) restart();

bullets.forEach((b,i)=>{
if(collide({x:b.x,y:b.y,w:8,h:4},{...g,w:20,h:20})){
g.x=-9999;
bullets.splice(i,1);
}
});

});



// spikes
spikes.forEach(s=>{

s.t++;
if(s.t>90){s.up=!s.up;s.t=0;}

if(s.up){
if(collide(player,{x:s.x,y:s.y-20,w:15,h:15}))
restart();
}

});

cameraX=player.x-200;

}

function drawPlayer(){

ctx.fillStyle="green";

// JUMPING UP
if(!player.grounded && player.vy < 0){

// head
ctx.fillRect(player.x+5,player.y,10,10)

// body
ctx.fillRect(player.x+7,player.y+10,6,10)

// legs tucked
ctx.fillRect(player.x+5,player.y+20,3,15)
ctx.fillRect(player.x+11,player.y+20,3,15)

}

// FALLING
else if(!player.grounded && player.vy > 0){

// head
ctx.fillRect(player.x+5,player.y,10,10)

// body
ctx.fillRect(player.x+7,player.y+10,6,10)

// legs stretched
ctx.fillRect(player.x+4,player.y+20,3,6)
ctx.fillRect(player.x+12,player.y+20,3,6)

}

// NORMAL WALK
else{

ctx.fillRect(player.x+5,player.y,10,10);
ctx.fillRect(player.x+7,player.y+10,6,10);
ctx.fillRect(player.x+5,player.y+20,4,10);
ctx.fillRect(player.x+11,player.y+20,4,10);

}

// eyes
ctx.fillStyle="black";
ctx.fillRect(player.x+7,player.y+3,2,2);
ctx.fillRect(player.x+11,player.y+3,2,2);

}


function draw(){


if(!gameStarted){

ctx.fillStyle="darkred";
ctx.fillRect(0,0,900,400);

ctx.fillStyle="white";
ctx.textAlign="center";

ctx.font="50px monospace";
ctx.fillText("Hell's Gauntlet",450,150);

ctx.font="20px monospace";
ctx.fillText("Press Any Key To Start",450,220);

ctx.font="14px monospace";
ctx.fillText("WASD to Move | W to Jump | P to Shoot",450,260);

ctx.font="10px monospace";
ctx.fillText("Don't Rage Quit you fcking wimp😘",450,380);

ctx.font="50px monospace";
ctx.fillText("☠️",40,380);

ctx.font="50px monospace";
ctx.fillText("☠️",40,50);

ctx.font="50px monospace";
ctx.fillText("☠️",860,380);

ctx.font="50px monospace";
ctx.fillText("☠️",860,50);

return;
}


ctx.clearRect(0,0,900,400);
ctx.save();
ctx.translate(-cameraX,0);

ctx.lineWidth=3;

// platforms
platforms.forEach(p=>{
ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x+p.w,p.y);
ctx.stroke();
});

// bullets
bullets.forEach(b=>ctx.fillRect(b.x,b.y,8,4));

// goblins
goblins.forEach(g=>{
ctx.fillRect(g.x,g.y,20,10);
ctx.fillRect(g.x+5,g.y-8,10,8);
});

// spikes
spikes.forEach(s=>{
if(s.up){
ctx.beginPath();
ctx.moveTo(s.x,s.y);
ctx.lineTo(s.x+15,s.y-20);
ctx.lineTo(s.x+30,s.y);
ctx.fill();
}
});

// flag
ctx.fillRect(flag.x,flag.y,30,20);
ctx.beginPath();
ctx.moveTo(flag.x,flag.y);
ctx.lineTo(flag.x,flag.y+100);
ctx.stroke();

drawPlayer();

ctx.restore();

ctx.fillStyle="black";
ctx.font="16px monospace";

ctx.fillText("Time: " + elapsed + "s", 40, 30);
ctx.fillText("Deaths: " + deaths, 45, 50);

if(gameWon){
ctx.font="40px monospace";
ctx.fillText("YOU WIN",350,150);
}

}

function loop(){
update();
draw();
requestAnimationFrame(loop);
}

loop();
