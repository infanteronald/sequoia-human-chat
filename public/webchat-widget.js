(function() {
  var API = window.SequoiaChatConfig?.apiUrl || window.location.origin;
  var position = window.SequoiaChatConfig?.position || "right";
  var color = window.SequoiaChatConfig?.color || "#25d366";
  var title = window.SequoiaChatConfig?.title || "Sequoia Speed";
  var subtitle = window.SequoiaChatConfig?.subtitle || "En que te podemos ayudar?";
  var sessionId = localStorage.getItem("sq_chat_sid") || ("sq_" + Math.random().toString(36).slice(2) + Date.now());
  localStorage.setItem("sq_chat_sid", sessionId);

  var css = document.createElement("style");
  css.textContent = "\n.sq-chat-btn{position:fixed;bottom:20px;" + position + ":20px;width:60px;height:60px;border-radius:50%;background:" + color + ";color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:9999;display:flex;align-items:center;justify-content:center;transition:transform .2s}\n.sq-chat-btn:hover{transform:scale(1.1)}\n.sq-chat-btn svg{width:30px;height:30px;fill:#fff}\n.sq-chat-box{position:fixed;bottom:90px;" + position + ":20px;width:370px;max-width:calc(100vw - 40px);height:500px;max-height:calc(100vh - 120px);background:#1a1a1a;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.4);z-index:9999;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}\n.sq-chat-box.open{display:flex}\n.sq-chat-header{padding:16px;background:" + color + ";color:#fff}\n.sq-chat-header h3{margin:0;font-size:16px;font-weight:600}\n.sq-chat-header p{margin:4px 0 0;font-size:12px;opacity:.8}\n.sq-chat-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}\n.sq-msg{max-width:80%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4;word-wrap:break-word}\n.sq-msg.bot{background:#2a2a2a;color:#e0e0e0;align-self:flex-start;border-bottom-left-radius:4px}\n.sq-msg.user{background:" + color + ";color:#fff;align-self:flex-end;border-bottom-right-radius:4px}\n.sq-msg.typing{opacity:.6}\n.sq-chat-input{display:flex;padding:12px;border-top:1px solid #333;gap:8px}\n.sq-chat-input input{flex:1;padding:10px 14px;border-radius:20px;border:1px solid #333;background:#222;color:#fff;font-size:14px;outline:none}\n.sq-chat-input input:focus{border-color:" + color + "}\n.sq-chat-input button{width:40px;height:40px;border-radius:50%;background:" + color + ";color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center}\n";
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.className = "sq-chat-btn";
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>';
  document.body.appendChild(btn);

  var box = document.createElement("div");
  box.className = "sq-chat-box";
  box.innerHTML = '<div class="sq-chat-header"><h3>' + title + '</h3><p>' + subtitle + '</p></div><div class="sq-chat-msgs" id="sq-msgs"><div class="sq-msg bot">Hola! Soy el asistente de ' + title + '. En que te puedo ayudar?</div></div><div class="sq-chat-input"><input type="text" id="sq-input" placeholder="Escribe tu mensaje..." /><button id="sq-send"><svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>';
  document.body.appendChild(box);

  btn.onclick = function() { box.classList.toggle("open"); if (box.classList.contains("open")) document.getElementById("sq-input").focus(); };

  function addMsg(text, type) {
    var d = document.createElement("div");
    d.className = "sq-msg " + type;
    d.textContent = text;
    document.getElementById("sq-msgs").appendChild(d);
    document.getElementById("sq-msgs").scrollTop = 99999;
    return d;
  }

  async function send() {
    var inp = document.getElementById("sq-input");
    var msg = inp.value.trim();
    if (!msg) return;
    inp.value = "";
    addMsg(msg, "user");
    var typing = addMsg("Escribiendo...", "bot typing");
    try {
      var res = await fetch(API + "/api/webchat", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ message: msg, sessionId: sessionId }) });
      var data = await res.json();
      typing.remove();
      addMsg(data.reply || "Sin respuesta", "bot");
    } catch(e) { typing.remove(); addMsg("Error de conexion", "bot"); }
  }

  document.getElementById("sq-send").onclick = send;
  document.getElementById("sq-input").onkeydown = function(e) { if (e.key === "Enter") send(); };
})();
