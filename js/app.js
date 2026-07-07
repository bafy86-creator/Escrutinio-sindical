let votos = {
  ccoo: 0,
  ugt: 0,
  blanco: 0,
  nulo: 0
};

let esperadas = 0;
let historial = [];

function comenzar() {
  const empresa = document.getElementById("empresa").value.trim();
  const centro = document.getElementById("centro").value.trim();
  const mesa = document.getElementById("mesa").value.trim();
  esperadas = parseInt(document.getElementById("esperadas").value) || 0;

  if (!empresa || !centro || !mesa || esperadas <= 0) {
    alert("Completa todos los datos.");
    return;
  }

  localStorage.setItem("empresa", empresa);
  localStorage.setItem("centro", centro);
  localStorage.setItem("mesa", mesa);

  document.getElementById("txtEsperadas").textContent = esperadas;

  document.getElementById("inicio").classList.add("oculto");
  document.getElementById("escrutinio").classList.remove("oculto");

  actualizar();
}

function sumar(tipo) {
  votos[tipo]++;
  historial.push(tipo);
  actualizar();

  if (navigator.vibrate) {
    navigator.vibrate(40);
  }
}

function deshacer() {
  if (historial.length === 0) return;

  const ultimo = historial.pop();
  votos[ultimo]--;
  actualizar();
}

function actualizar() {

  document.getElementById("votosCCOO").textContent = votos.ccoo;
  document.getElementById("votosUGT").textContent = votos.ugt;
  document.getElementById("votosBlanco").textContent = votos.blanco;
  document.getElementById("votosNulo").textContent = votos.nulo;

  const total =
    votos.ccoo +
    votos.ugt +
    votos.blanco +
    votos.nulo;

  document.getElementById("total").textContent = total;
  document.getElementById("pendientes").textContent =
    Math.max(esperadas - total, 0);

  localStorage.setItem("votos", JSON.stringify(votos));
}

function finalizar() {

  const total =
    votos.ccoo +
    votos.ugt +
    votos.blanco +
    votos.nulo;

  if (total !== esperadas) {

    if (!confirm("Los votos no coinciden con las papeletas esperadas. ¿Deseas finalizar igualmente?")) {
      return;
    }

  }

  document.getElementById("escrutinio").classList.add("oculto");
  document.getElementById("resultado").classList.remove("oculto");

  document.getElementById("resultadoTexto").innerHTML = `
<h3>${localStorage.getItem("empresa")}</h3>

<p><strong>Centro:</strong> ${localStorage.getItem("centro")}</p>

<p><strong>Mesa:</strong> ${localStorage.getItem("mesa")}</p>

<hr>

<p>🔴 CCOO: <strong>${votos.ccoo}</strong></p>

<p>🟢 UGT: <strong>${votos.ugt}</strong></p>

<p>⚪ Blancos: <strong>${votos.blanco}</strong></p>

<p>⚫ Nulos: <strong>${votos.nulo}</strong></p>

<hr>

<h2>Total: ${total}</h2>
`;
}

function nuevoEscrutinio() {

  if (!confirm("¿Comenzar un nuevo escrutinio?")) return;

  votos = {
    ccoo: 0,
    ugt: 0,
    blanco: 0,
    nulo: 0
  };

  historial = [];

  localStorage.removeItem("votos");

  document.getElementById("resultado").classList.add("oculto");
  document.getElementById("inicio").classList.remove("oculto");

  document.getElementById("empresa").value = "";
  document.getElementById("centro").value = "";
  document.getElementById("mesa").value = "";
  document.getElementById("esperadas").value = "";

  actualizar();
}