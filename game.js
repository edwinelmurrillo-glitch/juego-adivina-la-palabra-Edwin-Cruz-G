const $ = id => document.getElementById(id);
const canvas = $('gameCanvas'), ctx = canvas.getContext('2d');
const input = $('letterInput'), guessBtn = $('guessBtn'), hintBtn = $('hintBtn');
const resetBtn = $('resetBtn'), startBtn = $('startBtn'), difficultySelect = $('difficulty');
const messageEl = $('message'), timerEl = $('timeCount');

const palabrasConPista = [
  { word: 'RATON', hint: 'Hace asustar a los elefantes y a las mujeres' },
  { word: 'HUSH PUPPIES', hint: 'Conosido como perro salchicha' },
  { word: 'DALMATA', hint: 'Perro blanco con manchas negras' },
  { word: 'SONIA', hint: 'Sebastian Marset le puso un apodo a un ministro de Luis Arse Catacora' },
  { word: 'SACABA', hint: 'Donde la chicha nunca se acaba' },
  { word: 'JAVIER', hint: 'Se apellida Milei. Frase: "viva la libertad carajo"' },
  { word: 'SAMUELITIO', hint: 'Cadajo no me puedo modid' },
  { word: 'FEBRERO', hint: 'En año bisiesto un mes tiene 29 días' },
  { word: 'LEO', hint: 'Símbolo de León' },
  { word: 'GATO', hint: 'Animal doméstico que maúlla' },
  { word: 'PERRO', hint: 'Animal doméstico que ladra' },
  { word: 'LUNA', hint: 'Satélite natural de la Tierra' },
  { word: 'ESTRELLA', hint: 'Brilla en el cielo por la noche' },
  { word: 'JIRAFA', hint: 'Animal muy alto con manchas' },
  { word: 'NUBE', hint: 'Expresión de vapor de agua en cielo' }
];

let palabra = '', hint = '', correctas = [], incorrectas = [];
let intentosMax = 6, tiempoLimite = 0, tiempoRestante = 0, timer = null;

const habilitar = (els, estado) => els.forEach(el => el.disabled = !estado);

function iniciarJuego() {
  const dif = difficultySelect.value;
  [intentosMax, tiempoLimite] = dif === 'easy' ? [8, 120] : dif === 'normal' ? [6, 30] : [4, 60];

  ({ word: palabra, hint } = palabrasConPista[Math.floor(Math.random() * palabrasConPista.length)]);
  correctas = [], incorrectas = [], tiempoRestante = tiempoLimite;
  clearInterval(timer); timerEl.textContent = tiempoRestante;

  habilitar([input, guessBtn, hintBtn, resetBtn], true);
  habilitar([startBtn, difficultySelect], false);
  messageEl.textContent = '';
  dibujar();
  timer = setInterval(() => {
    timerEl.textContent = --tiempoRestante;
    if (tiempoRestante <= 0) terminarJuego(false);
  }, 1000);
}

function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const x = 100;
  palabra.split('').forEach((l, i) => {
    ctx.beginPath();
    ctx.moveTo(x + i * 50, 300);
    ctx.lineTo(x + i * 50 + 40, 300);
    ctx.stroke();
    if (correctas.includes(l)) {
      ctx.font = '30px Arial';
      ctx.fillStyle = '#000';
      ctx.fillText(l, x + i * 50 + 10, 290);
    }
  });
  ctx.font = '20px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText('Letras incorrectas: ' + incorrectas.join(', '), 100, 350);
  ctx.fillStyle = 'black';
  ctx.fillText('Intentos restantes: ' + (intentosMax - incorrectas.length), 100, 380);
  dibujarAhorcado(incorrectas.length);
}

function dibujarAhorcado(fallos) {
  const l = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2;

  l(600, 350, 700, 350); l(650, 350, 650, 100); l(650, 100, 720, 100); l(720, 100, 720, 130);
  if (fallos > 0) {
    ctx.beginPath(); ctx.arc(720, 150, 20, 0, Math.PI * 2); ctx.stroke();
    if (fallos >= intentosMax) {
      ctx.beginPath(); ctx.moveTo(712, 142); ctx.lineTo(718, 148);
      ctx.moveTo(718, 142); ctx.lineTo(712, 148); ctx.stroke();
      ctx.beginPath(); ctx.arc(720, 160, 7, 0, Math.PI, true); ctx.stroke();
    }
  }
  if (fallos > 1) l(720, 170, 720, 230);
  if (fallos > 2) l(720, 190, 690, 210);
  if (fallos > 3) l(720, 190, 750, 210);
  if (fallos > 4) l(720, 230, 690, 270);
  if (fallos > 5) l(720, 230, 750, 270);
}

function verificarLetra(letra) {
  letra = letra.toUpperCase();
  if ([...correctas, ...incorrectas].includes(letra)) {
    messageEl.textContent = 'Ya usaste esa letra.'; return;
  }
  palabra.includes(letra) ? (correctas.push(letra), messageEl.textContent = '¡Bien hecho!')
                          : (incorrectas.push(letra), messageEl.textContent = '¡Incorrecto!');
  dibujar();
  const ganado = palabra.split('').every(l => correctas.includes(l));
  if (ganado || incorrectas.length >= intentosMax) terminarJuego(ganado);
}

function terminarJuego(ganado) {
  clearInterval(timer);
  habilitar([input, guessBtn, hintBtn], false);
  resetBtn.disabled = false;
  messageEl.textContent = (ganado ? '🎉 ¡Ganaste!' : '💀 ¡Perdiste!') + ' La palabra era: ' + palabra;
  (ganado ? efectoCelebracion : efectoDerrota)();
}

// Eventos
guessBtn.onclick = () => {
  const letra = input.value.trim();
  /^[a-zñÑ]$/i.test(letra) ? verificarLetra(letra) : messageEl.textContent = 'Ingresa una sola letra válida.';
  input.value = ''; input.focus();
};
input.onkeyup = e => e.key === 'Enter' && guessBtn.click();
hintBtn.onclick = () => { alert('Pista: ' + hint); hintBtn.disabled = true; };
resetBtn.onclick = () => { habilitar([startBtn, difficultySelect], true); resetBtn.disabled = true; iniciarJuego(); };
startBtn.onclick = iniciarJuego;

// Efectos visuales
function efectoCelebracion() { ctx.fillStyle = 'rgba(0,255,0,0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
function efectoDerrota()     { ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
