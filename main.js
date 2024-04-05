
/*creado por prashant shukla */

var paddle2 = 10, paddle1 = 10;

var paddle1X = 10, paddle1Height = 110;
var paddle2Y = 685, paddle2Height = 110;

var score1 = 0, score2 = 0;
var paddle1Y=0;

var playerscore = 0;
var audio1;
var pcscore = 0;
NumeroDeJugadores=0
var estatus=0
var paddle2y=0
//pelota x, y, y la velocidad speedx, y y radio
var ball = {
  x: 350 / 2,
  y: 480 / 2,
  r: 10,
  dx: 3,
  dy: 3
}
function preload() {
  sonido = loadSound("bounce.mp3")
}
function setup() {
  var canvas = createCanvas(700, 480);
  video = createCapture(VIDEO)
  video.hide()
  coordenadas = ml5.poseNet(video, listo)
  //coordenadas.on("pose", respuesta)
  fondo=createImg("background1.jpg")
  fondo.size(windowWidth,windowHeight)
  fondo.position(0,0)
  rectMode(CENTER)
  ellipseMode(RADIUS)
  nombre = createInput("").attribute("placeholder","Ingresa tu nombre")
  nombre.position(width/2,height/2)
  nombre.center("horizontal")
  nuevo = createButton("Nuevo Juego")
  nuevo.position(windowWidth-200,windowHeight-100)
  nuevo.mousePressed(limpiar)
  enviar=createButton("Ingresar")
  enviar.position(width/2,height/2+100)
  enviar.center("horizontal")
  h2=createElement("h2")
  h2.center()
  enviar.mousePressed(Ingresar)
  firebase.database().ref("estatus").on("value",(datos)=>{
    estatus=datos.val()
  })
  firebase.database().ref("pelota").on("value",(datos)=>{
    ball.x=datos.val().x;
    ball.y=datos.val().y;
    ball.dx=datos.val().dx;
    ball.dy=datos.val().dy;
    fill(50, 350, 0);
    stroke(255, 0, 0);
    strokeWeight(0.5);
    ellipse(ball.x, ball.y, ball.r, ball.r)
  })
}
manoY = 0
function listo() {
  console.log("HOLA")
}
function respuesta(poses) {
  if (poses[0] && poses[0].pose.leftWrist.confidence > 0.25) {
    manoY = poses[0].pose.leftWrist.y
    //console.log(manoY)
  }
}
function draw() {
if(estatus==1){
  enviar.hide()
  nombre.hide()
  h2.hide()
  fondo.hide()
  background(0);
  if(localStorage.getItem("raqueta") == "jugador1"){
    image(video, 0, 0, 350, 480)
  }else{
    image(video, 350, 0, 350, 480)
  }
  fill("black");
  stroke("black");
  rect(680, 0, 20, 700);

  fill("black");
  stroke("black");
  rect(0, 0, 20, 700);

  //llamar función paddleInCanvas  
  paddleInCanvas();

  //paleta izquierda
  fill(250, 0, 0);
  stroke(0, 0, 250);
  strokeWeight(0.5);
  //paddle1Y = manoY;
  firebase.database().ref("jugadores/"+localStorage.getItem("raqueta")).update({
    y: mouseY
  })
  rect(paddle1X, paddle1Y, paddle1, paddle1Height, 100);

  //paleta de la computadora
  fill("#FFA500");
  stroke("#FFA500");
  //var paddle2y = ball.y - paddle2Height / 2; 
  rect(paddle2Y, paddle2y, paddle2, paddle2Height, 100);

  //llamar a la función midline 
  midline();

  //llamar a la función drawScore  
  drawScore();

  //llamar a la función models   
  models();

  //llamar a la función move que es muy importante
  move();
}else if(localStorage.getItem("raqueta")){
  h2.show()
  fondo.show()
  enviar.hide()
  nombre.hide()
}else{
  h2.hide()
  fondo.show()
  enviar.show()
  nombre.show()
}
}



//la función reset cuando la pelota no haga contacto con la paleta
function reset() {
  firebase.database().ref("pelota").update({
    x:width / 2 + 100,
    y:height / 2 + 100,
    dx:3,
    dy:3
  })
}


//la función midline dibuja una línea en el centro
function midline() {
  for (i = 0; i < 480; i += 10) {
    var y = 0;
    fill("white");
    stroke(0);
    rect(width / 2, y + i, 10, 480);
  }
}


//la función drawScore muestra la puntuación
function drawScore() {
  textAlign(CENTER);
  textSize(20);
  fill("white");
  stroke(250, 0, 0)
  text("Jugador 1:", 100, 50)
  text(playerscore, 160, 50);
  text("Jugador 2:", 500, 50)
  text(pcscore, 560, 50)
}


//una función muy importante de este juego
function move() {
  firebase.database().ref("pelota").update({
    x:ball.x + ball.dx,
    y:ball.y + ball.dy
  })
  if (ball.x > paddle2Y - ball.r) {
    if (ball.y >= paddle2y - paddle2Height/2 && ball.y <= paddle2y + paddle2Height/2) {
    firebase.database().ref("pelota").update({
      dx:-ball.dx - 0.5
    })
    firebase.database().ref("jugadores/jugador2").update({
      puntos: pcscore++
    })
    }else{
      firebase.database().ref("jugadores/jugador1").update({
        puntos: playerscore++
      })
      reset();
    }
  }
  if (ball.x < paddle1X + ball.r) {
    if (ball.y >= paddle1Y - paddle1Height && ball.y <= paddle1Y + paddle1Height) {
      firebase.database().ref("pelota").update({
        dx:-ball.dx + 0.5
      })
      firebase.database().ref("jugadores/jugador1").update({
        puntos: playerscore++
      })
    //sonido.play()
    }
    else {
      firebase.database().ref("jugadores/jugador2").update({
        puntos: pcscore++
      })
      reset();
      //navigator.vibrate(100);
    }
  }
  if (ball.y + ball.r > height || ball.y - ball.r < 0) {
    //sonido.play()
    firebase.database().ref("pelota").update({
      dy: - ball.dy
    })
  }
  if (pcscore >= 4 || playerscore >=4) {
    fill("#FFA500");
    stroke(0)
    rect(width*0.5, height*0.5, width, height);
    fill("white");
    stroke("white");
    textSize(25)
    text("¡Fin del juego!☹☹", width / 2, height / 2);
    text("¡Volver a cargar la página!", width / 2, height / 2 + 30)
    noLoop();
  }
}


//ancho altura del canvas velocidad de la pelota 
function models() {
  textSize(18);
  fill(255);
  noStroke();
  text("Ancho: " + width, 190, 15);
  text("Velocidad: " + abs(ball.dx), 70, 15);
  text("Altura: " + height, 300, 15)
}
function Ingresar(){
  enviar.hide()
  nombre.hide()
  h2.html("Espera a que cada jugador se una")
  firebase.database().ref("jugadores").once("value",(datos)=>{
    if(datos.numChildren()===0){
      localStorage.setItem("jugador1", nombre.value());
      localStorage.setItem("raqueta", "jugador1");
      firebase.database().ref("jugadores/jugador1").set({
        nombre:nombre.value(),
        x:10,
        y:350,
        puntos:0
      })
      firebase.database().ref("jugadores").on("value",(datos)=>{
        paddle1Y = datos.val()["jugador1"].y
        paddle2y = datos.val()["jugador2"].y
        playerscore = datos.val()["jugador1"].puntos
        pcscore = datos.val()["jugador2"].puntos
      })
    }
    if (datos.numChildren()===1){
      localStorage.setItem("jugador1", datos.val()["jugador1"]["nombre"]);
      localStorage.setItem("jugador2", nombre.value());
      localStorage.setItem("raqueta", "jugador2");
      firebase.database().ref("jugadores/jugador2").set({
        nombre:nombre.value(),
        x:685,
        y:350,
        puntos:0
      })
      h2.hide()
      fondo.hide()
      firebase.database().ref("/").update({estatus: 1})
      firebase.database().ref("pelota").update({
        x: 350 / 2,
        y: 480 / 2,
        r: 10,
        dx: 3,
        dy: 3
      })
      firebase.database().ref("jugadores").on("value",(datos)=>{
        paddle1Y = datos.val()["jugador1"].y
        paddle2y = datos.val()["jugador2"].y
        playerscore = datos.val()["jugador1"].puntos
        pcscore = datos.val()["jugador2"].puntos
      })
    }
  })
}

//esta función ayuda a que la paleta no salga del canvas
function paddleInCanvas() {
  if (mouseY - paddle1Height/2 > height) {
    mouseY = height - paddle1Height/2;
  }
  if (mouseY + paddle1Height/2 < 0) {
    mouseY = paddle1Height/2;
  }
}
function limpiar(){
  firebase.database().ref("/").update({
    estatus:0,
    jugadores:null
  })
  localStorage.clear()
  window.location.reload();
}