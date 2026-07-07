const STORAGE_KEY="escrutinioSindicalV22";
let estado={empresa:"",centro:"",mesa:"",esperadas:0,delegados:0,votos:{ccoo:0,ugt:0,blanco:0,nulo:0},historial:[],inicio:null,fin:null};
const $=id=>document.getElementById(id);
function mostrar(p){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(p).classList.add("active")}
function total(){let v=estado.votos;return v.ccoo+v.ugt+v.blanco+v.nulo}
function guardar(){localStorage.setItem(STORAGE_KEY,JSON.stringify(estado))}
function cargar(){let r=localStorage.getItem(STORAGE_KEY);if(!r)return false;try{estado=JSON.parse(r);return true}catch(e){return false}}
function comenzar(){
 let empresa=$("empresa").value.trim(),centro=$("centro").value.trim(),mesa=$("mesa").value.trim();
 let esperadas=parseInt($("esperadas").value,10),delegados=parseInt($("delegados").value,10);
 if(!empresa||!centro||!mesa||!esperadas||esperadas<1||!delegados||delegados<1){alert("Completa todos los datos, incluido delegados a elegir.");return}
 estado={empresa,centro,mesa,esperadas,delegados,votos:{ccoo:0,ugt:0,blanco:0,nulo:0},historial:[],inicio:new Date().toISOString(),fin:null};
 guardar();pintar();mostrar("recuento")
}
function recuperar(){if(!cargar()){alert("No hay ningún recuento guardado.");return}pintar();mostrar("recuento")}
let bloqueado=false;
function sumar(tipo){if(bloqueado)return;bloqueado=true;setTimeout(()=>bloqueado=false,220);estado.votos[tipo]++;estado.historial.push({tipo,hora:new Date().toISOString()});guardar();pintar();if(navigator.vibrate)navigator.vibrate(35)}
function deshacer(){let u=estado.historial.pop();if(!u)return;if(estado.votos[u.tipo]>0)estado.votos[u.tipo]--;guardar();pintar()}
function calcularDelegados(){
 let candidaturas=[{clave:"ccoo",votos:estado.votos.ccoo,delegados:0},{clave:"ugt",votos:estado.votos.ugt,delegados:0}],c=[];
 candidaturas.forEach(x=>{for(let d=1;d<=estado.delegados;d++)c.push({clave:x.clave,valor:x.votos/d,votos:x.votos})});
 c.sort((a,b)=>b.valor!==a.valor?b.valor-a.valor:b.votos-a.votos);
 c.slice(0,estado.delegados).forEach(x=>candidaturas.find(y=>y.clave===x.clave).delegados++);
 return {ccoo:candidaturas[0].delegados,ugt:candidaturas[1].delegados}
}
function finalizar(){
 let t=total();
 if(t!==estado.esperadas){let dif=estado.esperadas-t,msg=dif>0?`Faltan ${dif} papeletas por contar. ¿Finalizar igualmente?`:`Hay ${Math.abs(dif)} votos de más. ¿Finalizar igualmente?`;if(!confirm(msg))return}
 estado.fin=new Date().toISOString();guardar();pintarResultado();mostrar("resultado")
}
function nuevo(){if(!confirm("¿Crear un nuevo escrutinio?"))return;localStorage.removeItem(STORAGE_KEY);location.reload()}
function porcentaje(v,b){return b?((v/b)*100).toFixed(1).replace(".",",")+" %":"0,0 %"}
function pintar(){
 $("tituloMesa").textContent=estado.mesa||"Escrutinio";$("votosCCOO").textContent=estado.votos.ccoo;$("votosUGT").textContent=estado.votos.ugt;$("votosBlanco").textContent=estado.votos.blanco;$("votosNulo").textContent=estado.votos.nulo;
 let t=total();$("total").textContent=t;$("pendientes").textContent=Math.max(estado.esperadas-t,0);$("contadasTxt").textContent=`${t} contadas`;$("esperadasTxt").textContent=`${estado.esperadas} esperadas`;$("barra").style.width=(estado.esperadas?Math.min(t/estado.esperadas*100,100):0)+"%"
}
function pintarResultado(){
 let t=total(),validos=estado.votos.ccoo+estado.votos.ugt+estado.votos.blanco,d=calcularDelegados();
 $("resumenFinal").innerHTML=`<h3>${estado.empresa}</h3><div class="row"><span>Centro</span><strong>${estado.centro}</strong></div><div class="row"><span>Mesa</span><strong>${estado.mesa}</strong></div><div class="row"><span>Papeletas esperadas</span><strong>${estado.esperadas}</strong></div><div class="row"><span>Total emitidos</span><strong>${t}</strong></div><div class="row"><span>CCOO</span><strong>${estado.votos.ccoo} · ${porcentaje(estado.votos.ccoo,validos)}</strong></div><div class="row"><span>UGT</span><strong>${estado.votos.ugt} · ${porcentaje(estado.votos.ugt,validos)}</strong></div><div class="row"><span>Blancos</span><strong>${estado.votos.blanco}</strong></div><div class="row"><span>Nulos</span><strong>${estado.votos.nulo}</strong></div><div class="delegados"><h3>Delegados asignados</h3><div class="row"><span>CCOO</span><strong>${d.ccoo}</strong></div><div class="row"><span>UGT</span><strong>${d.ugt}</strong></div><p><small>Cálculo por sistema D'Hondt.</small></p></div>`
}
function copiarResumen(){let d=calcularDelegados(),t=total(),texto=`ESCRUTINIO SINDICAL\nEmpresa: ${estado.empresa}\nCentro: ${estado.centro}\nMesa: ${estado.mesa}\nCCOO: ${estado.votos.ccoo}\nUGT: ${estado.votos.ugt}\nBlancos: ${estado.votos.blanco}\nNulos: ${estado.votos.nulo}\nTotal: ${t}\nDelegados CCOO: ${d.ccoo}\nDelegados UGT: ${d.ugt}`;navigator.clipboard?navigator.clipboard.writeText(texto).then(()=>alert("Resumen copiado.")):alert(texto)}
document.addEventListener("DOMContentLoaded",()=>{$("btnComenzar").onclick=comenzar;$("btnRecuperar").onclick=recuperar;$("btnDeshacer").onclick=deshacer;$("btnFinalizar").onclick=finalizar;$("btnNuevo").onclick=nuevo;$("btnCompartir").onclick=copiarResumen;$("btnEditar").onclick=()=>mostrar("inicio");document.querySelectorAll("[data-voto]").forEach(b=>b.onclick=()=>sumar(b.dataset.voto));if(cargar()){["empresa","centro","mesa","esperadas","delegados"].forEach(id=>$(id).value=estado[id]||"")}})
