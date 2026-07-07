const STORAGE_KEY = "escrutinioSindicalV21";

let estado = {
  empresa: "",
  centro: "",
  mesa: "",
  esperadas: 0,
  votos: { ccoo: 0, ugt: 0, blanco: 0, nulo: 0 },
  historial: [],
  inicio: null,
  fin: null
};

const $ = (id) => document.getElementById(id);

function mostrar(pantalla){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(pantalla).classList.add("active");
}

function total(){
  const v = estado.votos;
  return v.ccoo + v.ugt + v.blanco + v.nulo;
}

function guardar(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function cargar(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return false;
  try{
    estado = JSON.parse(raw);
    return true;
  }catch(e){
    return false;
  }
}

function comenzar(){
  const empresa = $("empresa").value.trim();
  const centro = $("centro").value.trim();
  const mesa = $("mesa").value.trim();
  const esperadas = parseInt($("esperadas").value, 10);

  if(!empresa || !centro || !mesa || !esperadas || esperadas < 1){
    alert("Completa empresa, centro, mesa y papeletas esperadas.");
    return;
  }

  estado = {
    empresa,
    centro,
    mesa,
    esperadas,
    votos: { ccoo: 0, ugt: 0, blanco: 0, nulo: 0 },
    historial: [],
    inicio: new Date().toISOString(),
    fin: null
  };

  guardar();
  pintar();
  mostrar("recuento");
}

function recuperar(){
  if(!cargar()){
    alert("No hay ningún recuento guardado.");
    return;
  }
  pintar();
  mostrar("recuento");
}

let bloqueado = false;

function sumar(tipo){
  if(bloqueado) return;
  bloqueado = true;
  setTimeout(() => bloqueado = false, 220);

  estado.votos[tipo]++;
  estado.historial.push({tipo, hora:new Date().toISOString()});
  guardar();
  pintar();

  if(navigator.vibrate) navigator.vibrate(35);
}

function deshacer(){
  const ultimo = estado.historial.pop();
  if(!ultimo) return;
  if(estado.votos[ultimo.tipo] > 0) estado.votos[ultimo.tipo]--;
  guardar();
  pintar();
}

function finalizar(){
  const t = total();
  if(t !== estado.esperadas){
    const diferencia = estado.esperadas - t;
    const msg = diferencia > 0
      ? `Faltan ${diferencia} papeletas por contar. ¿Finalizar igualmente?`
      : `Hay ${Math.abs(diferencia)} votos de más. ¿Finalizar igualmente?`;
    if(!confirm(msg)) return;
  }
  estado.fin = new Date().toISOString();
  guardar();
  pintarResultado();
  mostrar("resultado");
}

function nuevo(){
  if(!confirm("¿Crear un nuevo escrutinio? Se borrará el recuento actual de este navegador.")) return;
  localStorage.removeItem(STORAGE_KEY);
  estado = {
    empresa: "",
    centro: "",
    mesa: "",
    esperadas: 0,
    votos: { ccoo: 0, ugt: 0, blanco: 0, nulo: 0 },
    historial: [],
    inicio: null,
    fin: null
  };
  ["empresa","centro","mesa","esperadas"].forEach(id => $(id).value = "");
  mostrar("inicio");
}

function porcentaje(valor, base){
  if(!base) return "0,0 %";
  return ((valor / base) * 100).toFixed(1).replace(".", ",") + " %";
}

function pintar(){
  $("tituloMesa").textContent = estado.mesa || "Escrutinio";
  $("votosCCOO").textContent = estado.votos.ccoo;
  $("votosUGT").textContent = estado.votos.ugt;
  $("votosBlanco").textContent = estado.votos.blanco;
  $("votosNulo").textContent = estado.votos.nulo;

  const t = total();
  $("total").textContent = t;
  $("pendientes").textContent = Math.max(estado.esperadas - t, 0);
  $("contadasTxt").textContent = `${t} contadas`;
  $("esperadasTxt").textContent = `${estado.esperadas} esperadas`;

  const progreso = estado.esperadas ? Math.min((t / estado.esperadas) * 100, 100) : 0;
  $("barra").style.width = progreso + "%";
}

function pintarResultado(){
  const t = total();
  const validos = estado.votos.ccoo + estado.votos.ugt + estado.votos.blanco;
  $("resumenFinal").innerHTML = `
    <h3>${estado.empresa}</h3>
    <div class="row"><span>Centro</span><strong>${estado.centro}</strong></div>
    <div class="row"><span>Mesa</span><strong>${estado.mesa}</strong></div>
    <div class="row"><span>Papeletas esperadas</span><strong>${estado.esperadas}</strong></div>
    <div class="row"><span>Total emitidos</span><strong>${t}</strong></div>
    <div class="row"><span>CCOO</span><strong>${estado.votos.ccoo} · ${porcentaje(estado.votos.ccoo, validos)}</strong></div>
    <div class="row"><span>UGT</span><strong>${estado.votos.ugt} · ${porcentaje(estado.votos.ugt, validos)}</strong></div>
    <div class="row"><span>Blancos</span><strong>${estado.votos.blanco}</strong></div>
    <div class="row"><span>Nulos</span><strong>${estado.votos.nulo}</strong></div>
  `;
}

function copiarResumen(){
  const t = total();
  const texto = `ESCRUTINIO SINDICAL
Empresa: ${estado.empresa}
Centro: ${estado.centro}
Mesa: ${estado.mesa}
Papeletas esperadas: ${estado.esperadas}

CCOO: ${estado.votos.ccoo}
UGT: ${estado.votos.ugt}
Blancos: ${estado.votos.blanco}
Nulos: ${estado.votos.nulo}

Total: ${t}`;

  if(navigator.clipboard){
    navigator.clipboard.writeText(texto).then(() => alert("Resumen copiado."));
  }else{
    alert(texto);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("btnComenzar").addEventListener("click", comenzar);
  $("btnRecuperar").addEventListener("click", recuperar);
  $("btnDeshacer").addEventListener("click", deshacer);
  $("btnFinalizar").addEventListener("click", finalizar);
  $("btnNuevo").addEventListener("click", nuevo);
  $("btnCompartir").addEventListener("click", copiarResumen);
  $("btnEditar").addEventListener("click", () => mostrar("inicio"));

  document.querySelectorAll("[data-voto]").forEach(btn => {
    btn.addEventListener("click", () => sumar(btn.dataset.voto));
  });

  if(cargar()){
    $("empresa").value = estado.empresa || "";
    $("centro").value = estado.centro || "";
    $("mesa").value = estado.mesa || "";
    $("esperadas").value = estado.esperadas || "";
  }
});
