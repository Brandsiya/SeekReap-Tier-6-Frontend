/* ═══════════════════════════════════════════════════════════
   SeekReap · certification_portal.js · complete rewrite
   ═══════════════════════════════════════════════════════════ */

// ── Step navigation ───────────────────────────────────────────────────────────
var CARDS = {1:'step1Card',2:'step2Card',3:'step3Card',4:'step4Card',5:'step5collabCard',6:'stepFinalCard'};
var INDS  = {1:'step1',2:'step2',3:'step3',4:'step4',5:'step5c',6:'stepFinal'};

window.showStep = function(n) {
  Object.values(CARDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.add('hidden'); });
  var c=document.getElementById(CARDS[n]); if(c) c.classList.remove('hidden');
  Object.values(INDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('active'); });
  var ind=document.getElementById(INDS[n]); if(ind) ind.classList.add('active');
};

// ── Plan selection ────────────────────────────────────────────────────────────
window.selectedPlan = 'free';

window.selectPlan = function(el) {
  document.querySelectorAll('.plan-card').forEach(function(c){ c.classList.remove('selected'); });
  el.classList.add('selected');
  window.selectedPlan = el.dataset.plan;
  var collabBtn    = document.getElementById('collabModeBtn');
  var step5c       = document.getElementById('step5c');
  var stepFinalNum = document.getElementById('stepFinalNum');
  if (window.selectedPlan === 'free') {
    if (collabBtn) { collabBtn.style.opacity='0.35'; collabBtn.style.pointerEvents='none'; collabBtn.style.cursor='not-allowed'; }
    if (step5c) step5c.style.display='none';
    if (stepFinalNum) stepFinalNum.textContent='5';
  } else {
    if (collabBtn) { collabBtn.style.opacity=''; collabBtn.style.pointerEvents=''; collabBtn.style.cursor=''; }
    if (window.selectedPlan === 'studio') {
      if (step5c) step5c.style.display='';
      if (stepFinalNum) stepFinalNum.textContent='6';
    } else {
      if (step5c) step5c.style.display='none';
      if (stepFinalNum) stepFinalNum.textContent='5';
    }
  }
};

// ── File helpers ──────────────────────────────────────────────────────────────
function _fmtBytes(b){
  if(b<1024) return b+' B';
  if(b<1048576) return (b/1024).toFixed(1)+' KB';
  return (b/1048576).toFixed(1)+' MB';
}
function _typeIcon(name){
  var ext=(name.split('.').pop()||'').toLowerCase();
  var m={mp3:'🎵',wav:'🎵',flac:'🎵',ogg:'🎵',aac:'🎵',
         mp4:'🎬',mov:'🎬',avi:'🎬',mkv:'🎬',webm:'🎬',
         jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',webp:'🖼️',svg:'🖼️',
         epub:'📖',pdf:'📄',
         js:'💻',ts:'💻',py:'💻',html:'💻',css:'💻',json:'💻',txt:'📄'};
  return m[ext]||'📄';
}

// ── File previewers ───────────────────────────────────────────────────────────
window._showPreview = function(file, prefix) {
  var embed = document.getElementById(prefix+'ViewerEmbed');
  var label = document.getElementById(prefix+'ViewerLabel');
  if (!embed) return;
  embed.innerHTML = '';
  embed.style.cssText = 'display:block;margin-top:14px;';
  var url = URL.createObjectURL(file);
  var t   = file.type || '';
  var ext = (file.name.split('.').pop()||'').toLowerCase();
  var border = 'border:1px solid rgba(201,153,58,0.25);border-radius:8px;overflow:hidden;';

  if (t.startsWith('audio/')) {
    if(label){label.textContent='🎵 Audio Player';label.style.display='block';}
    var wrap=document.createElement('div');
    wrap.style.cssText=border+'background:rgba(201,153,58,0.06);padding:20px;';
    var a=document.createElement('audio');
    a.controls=true;a.style.cssText='width:100%;display:block;outline:none;';a.src=url;
    wrap.appendChild(a);embed.appendChild(wrap);

  } else if (t.startsWith('video/')) {
    if(label){label.textContent='🎬 Video Player';label.style.display='block';}
    var v=document.createElement('video');
    v.controls=true;v.style.cssText='width:100%;display:block;border-radius:8px;background:#000;max-height:320px;';
    v.src=url;embed.appendChild(v);

  } else if (t.startsWith('image/')) {
    if(label){label.textContent='🖼️ Image Preview';label.style.display='block';}
    var img=document.createElement('img');
    img.src=url;img.style.cssText='width:100%;max-height:320px;display:block;border-radius:8px;object-fit:cover;';
    embed.appendChild(img);

  } else if (t==='application/pdf'||ext==='pdf') {
    if(label){label.textContent='📄 PDF Viewer';label.style.display='block';}
    var fr=document.createElement('iframe');
    fr.src=url;fr.style.cssText='width:100%;height:340px;border:none;border-radius:8px;display:block;background:#fff;';
    embed.appendChild(fr);

  } else if (ext==='epub') {
    if(label){label.textContent='📖 eBook / EPUB';label.style.display='block';}
    embed.innerHTML='<div style="'+border+'background:rgba(201,153,58,0.06);padding:24px;text-align:center;">' +
      '<div style="font-size:2.5rem;margin-bottom:10px;">📖</div>' +
      '<div style="font-weight:600;color:#E8C06A;margin-bottom:6px;">'+file.name+'</div>' +
      '<div style="font-size:0.78rem;color:rgba(250,250,248,0.5);">Full reader available after certification</div></div>';

  } else {
    if(label){label.textContent='💻 Code / Script Preview';label.style.display='block';}
    var rd=new FileReader();
    rd.onload=function(e){
      var pre=document.createElement('pre');
      pre.style.cssText=border+'background:rgba(0,0,0,0.5);padding:14px;font-size:0.72rem;' +
        'color:#E8C06A;overflow:auto;max-height:260px;white-space:pre-wrap;word-break:break-all;' +
        'font-family:monospace;line-height:1.5;display:block;';
      pre.textContent=(e.target.result||'').slice(0,4000)+((e.target.result||'').length>4000?'\n…(truncated)':'');
      embed.appendChild(pre);
    };
    rd.readAsText(file);
  }
};

// ── Upload zone ───────────────────────────────────────────────────────────────
var _uploadedFile = null;

function _handleFile(file, prefix) {
  _uploadedFile = file;
  var n=document.getElementById(prefix+'FileName');
  var s=document.getElementById(prefix+'FileSz');
  var i=document.getElementById(prefix+'FileIcon');
  var info=document.getElementById(prefix+'FileInfo');
  var area=document.getElementById(prefix+'UploadArea');
  var next=document.getElementById('step4NextBtn');
  if(n)    n.textContent=file.name;
  if(s)    s.textContent=_fmtBytes(file.size);
  if(i)    i.textContent=_typeIcon(file.name);
  if(info) info.style.display='flex';
  if(area) area.classList.add('has-file');
  if(next) next.disabled=true;
  window._showPreview(file, prefix);
  var bar=document.getElementById(prefix+'ProgressBar');
  var txt=document.getElementById(prefix+'ProgressText');
  var prg=document.getElementById(prefix+'Progress');
  if(prg) prg.style.display='block';
  var pct=0;
  var iv=setInterval(function(){
    pct+=Math.random()*18+8;
    if(pct>=100){pct=100;clearInterval(iv);if(next)next.disabled=false;if(txt)txt.textContent='Ready ✓';}
    if(bar) bar.style.width=pct+'%';
    if(txt&&pct<100) txt.textContent='Processing… '+Math.floor(pct)+'%';
  },100);
}

function _resetUpload(prefix){
  _uploadedFile=null;
  var ids={FileName:'—',FileSz:'—',FileIcon:'📄',ProgressText:'Uploading...'};
  Object.keys(ids).forEach(function(k){
    var el=document.getElementById(prefix+k); if(el) el.textContent=ids[k];
  });
  var hide=['FileInfo','Progress'];
  hide.forEach(function(k){ var el=document.getElementById(prefix+k); if(el) el.style.display='none'; });
  var bar=document.getElementById(prefix+'ProgressBar'); if(bar) bar.style.width='0%';
  var inp=document.getElementById(prefix+'FileInput');   if(inp) inp.value='';
  var area=document.getElementById(prefix+'UploadArea'); if(area) area.classList.remove('has-file');
  var emb=document.getElementById(prefix+'ViewerEmbed'); if(emb){emb.innerHTML='';emb.style.display='none';}
  var lbl=document.getElementById(prefix+'ViewerLabel'); if(lbl) lbl.style.display='none';
  var next=document.getElementById('step4NextBtn'); if(next) next.disabled=true;
}

function _wireZone(prefix){
  var area=document.getElementById(prefix+'UploadArea');
  var inp =document.getElementById(prefix+'FileInput');
  var rst =document.getElementById(prefix+'ResetBtn');
  if(!area||!inp) return;
  area.addEventListener('click',function(e){
    if(rst&&(e.target===rst||rst.contains(e.target))) return;
    inp.click();
  });
  inp.addEventListener('change',function(){
    if(inp.files&&inp.files[0]) _handleFile(inp.files[0],prefix);
  });
  area.addEventListener('dragover',function(e){ e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave',function(){ area.classList.remove('drag-over'); });
  area.addEventListener('drop',function(e){
    e.preventDefault(); area.classList.remove('drag-over');
    var f=e.dataTransfer.files&&e.dataTransfer.files[0];
    if(f) _handleFile(f,prefix);
  });
  if(rst) rst.addEventListener('click',function(e){ e.stopPropagation(); _resetUpload(prefix); });
}

// ── Co-owner management ───────────────────────────────────────────────────────
var _collabs = [];

function _initPrimary(){
  var u=window.currentUser||{};
  var name=(u.user_metadata&&u.user_metadata.full_name)||u.email||'You (Primary Creator)';
  _collabs=[{name:name,email:u.email||'',split:100,role:'Primary Creator',isPrimary:true}];
  _renderCollabs();
}
window._initPrimaryRow = _initPrimary;

function _renderCollabs(){
  var list=document.getElementById('collaboratorList');
  if(!list) return;
  list.innerHTML = _collabs.map(function(c,i){
    var readonlyAttr = c.isPrimary ? 'disabled style="flex:1;opacity:0.35;cursor:not-allowed;"' : 'style="flex:1;accent-color:#C9993A;cursor:pointer;"';
    return '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(201,153,58,0.18);border-radius:8px;padding:14px;margin-bottom:10px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
        '<div style="min-width:0;flex:1;">' +
          '<div style="font-size:0.88rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+c.name+'</div>' +
          '<div style="font-size:0.72rem;color:rgba(250,250,248,0.45);">'+c.role+(c.email&&!c.isPrimary?' · '+c.email:'')+'</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:7px;flex-shrink:0;margin-left:10px;">' +
          '<span style="color:#C9993A;font-weight:700;font-size:1rem;min-width:40px;text-align:right;" id="pct_'+i+'">'+c.split+'%</span>' +
          (!c.isPrimary
            ? '<button onclick="window._inviteOne('+i+')" title="Invite" style="background:rgba(201,153,58,0.1);border:1px solid rgba(201,153,58,0.3);color:#E8C06A;border-radius:4px;padding:3px 9px;font-size:0.75rem;cursor:pointer;">✉</button>' +
              '<button onclick="window._removeOne('+i+')" title="Remove" style="background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#f08080;border-radius:4px;padding:3px 9px;font-size:0.75rem;cursor:pointer;">✕</button>'
            : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span style="font-size:0.68rem;color:rgba(250,250,248,0.3);white-space:nowrap;">1%</span>' +
        '<input type="range" min="1" max="99" value="'+c.split+'" '+readonlyAttr+' oninput="window._sliderChange('+i+',this.value)">' +
        '<span style="font-size:0.68rem;color:rgba(250,250,248,0.3);white-space:nowrap;">99%</span>' +
      '</div>' +
    '</div>';
  }).join('');
  _renderSplitBar();
}

window._sliderChange = function(idx,val){
  val=parseInt(val,10);
  if(isNaN(val)||idx===0) return;
  var diff=val-_collabs[idx].split;
  if(diff>0 && _collabs[0].split-diff < 1){ val=_collabs[idx].split+_collabs[0].split-1; diff=val-_collabs[idx].split; }
  if(diff===0) return;
  _collabs[0].split -= diff;
  _collabs[idx].split = val;
  _renderCollabs();
};

window._removeOne = function(idx){
  if(!_collabs[idx]||_collabs[idx].isPrimary) return;
  _collabs[0].split = Math.min(100, _collabs[0].split + _collabs[idx].split);
  _collabs.splice(idx,1);
  _renderCollabs();
};

window._inviteOne = function(idx){
  var c=_collabs[idx];
  if(!c||!c.email){ alert('No email for this co-owner.'); return; }
  alert('Invitation queued for: '+c.email);
};

function _renderSplitBar(){
  var vis=document.getElementById('splitVisual');
  var warn=document.getElementById('splitWarning');
  if(!vis) return;
  var total=_collabs.reduce(function(s,c){ return s+c.split; },0);
  vis.innerHTML=_collabs.map(function(c){
    return '<div title="'+c.name+': '+c.split+'%" style="display:inline-block;height:12px;width:'+c.split+
      '%;background:'+(c.isPrimary?'#C9993A':'#3DB87A')+';border-radius:3px;margin-right:2px;vertical-align:top;transition:width 0.3s;"></div>';
  }).join('');
  if(warn){
    warn.textContent = total===100 ? '✓ Splits balance to 100%' : '⚠ Total is '+total+'% — must equal exactly 100%';
    warn.style.color = total===100 ? '#3DB87A' : '#f08080';
  }
}

// ── Submit routing ────────────────────────────────────────────────────────────
function _routeToPayment(){
  var plan  = window.selectedPlan||'free';
  var title = (document.getElementById('workTitle')||{}).value||'Untitled Work';
  var wtype = (document.getElementById('workType') ||{}).value||'audio';
  try {
    sessionStorage.setItem('pendingCert', JSON.stringify({
      title:title, work_type:wtype, plan:plan,
      collaborators:_collabs.filter(function(c){ return !c.isPrimary; }),
      ownership_split:_collabs.reduce(function(o,c){ o[c.email||c.name]=c.split; return o; },{})
    }));
  } catch(e){}
  window.location.href='bill_review.html?plan='+encodeURIComponent(plan)+'&title='+encodeURIComponent(title);
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){

  // Loading overlay
  var overlay=document.createElement('div');
  overlay.id='loadingState';
  overlay.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);padding:9px 18px;background:#1a1a1a;color:#E8C06A;border:1px solid rgba(201,153,58,0.3);border-radius:6px;z-index:9999;font-size:0.83rem;letter-spacing:0.04em;';
  overlay.textContent='Preparing your dashboard…';
  document.body.appendChild(overlay);

  // Wire upload zones immediately (no auth needed)
  _wireZone('solo');
  _wireZone('primary');

  // Step 4 continue
  var step4Next=document.getElementById('step4NextBtn');
  if(step4Next){
    step4Next.disabled=true;
    step4Next.addEventListener('click',function(e){
      e.preventDefault();
      if(!_uploadedFile){ alert('Please upload your work file before continuing.'); return; }
      var collabOn = document.getElementById('collabModeBtn') &&
        document.getElementById('collabModeBtn').classList.contains('active');
      if(collabOn && window.selectedPlan!=='free') window.showStep(5);
      else _routeToPayment();
    });
  }

  // Co-owner modal
  var modal     = document.getElementById('coownerModal');
  var addBtn    = document.getElementById('addCollaboratorBtn');
  var cancelBtn = document.getElementById('coownerCancelBtn');
  var saveBtn   = document.getElementById('coownerSaveBtn');
  var removeAll = document.getElementById('removeAllBtn');
  var inviteAll = document.getElementById('inviteAllBtn');

  if(addBtn&&modal){
    addBtn.addEventListener('click',function(){
      ['coFullName','coArtisticName','coCountry','coOwnershipTitle','coEmail'].forEach(function(id){
        var el=document.getElementById(id); if(el) el.value='';
      });
      var gs=document.getElementById('coGender'); if(gs) gs.value='';
      var ts=document.getElementById('coTitle');  if(ts) ts.value='';
      var sp=document.getElementById('coSplit');
      var avail=_collabs.length ? Math.max(1, _collabs[0].split-1) : 25;
      if(sp) sp.value=Math.min(avail,25);
      modal.style.display='flex';
    });
  }
  if(cancelBtn) cancelBtn.addEventListener('click',function(){ if(modal) modal.style.display='none'; });
  if(modal) modal.addEventListener('click',function(e){ if(e.target===modal) modal.style.display='none'; });

  if(saveBtn){
    saveBtn.addEventListener('click',function(){
      var name    =(document.getElementById('coFullName')      ||{}).value||'';
      var email   =(document.getElementById('coEmail')         ||{}).value||'';
      var split   =parseInt((document.getElementById('coSplit')||{}).value||'0',10);
      var role    =(document.getElementById('coOwnershipTitle')||{}).value||'Co-owner';
      var artistic=(document.getElementById('coArtisticName') ||{}).value||'';
      var country =(document.getElementById('coCountry')       ||{}).value||'';
      if(!name.trim())  { alert('Full name is required.');  return; }
      if(!email.trim()) { alert('Email is required.');      return; }
      if(!split||split<1||split>99){ alert('Ownership % must be 1–99.'); return; }
      var primaryAvail=_collabs.length ? _collabs[0].split : 0;
      if(split > primaryAvail-1){
        alert('Maximum assignable: '+(primaryAvail-1)+'% (primary owner must keep at least 1%).');
        return;
      }
      _collabs[0].split -= split;
      _collabs.push({
        name:     name+(artistic?' ('+artistic+')':''),
        email:    email,
        split:    split,
        role:     role+(country?' · '+country:''),
        isPrimary:false
      });
      _renderCollabs();
      if(modal) modal.style.display='none';
    });
  }

  if(removeAll){
    removeAll.addEventListener('click',function(){
      var co=_collabs.filter(function(c){ return !c.isPrimary; });
      if(!co.length){ alert('No co-owners added yet.'); return; }
      if(!confirm('Remove all co-owners?')) return;
      _collabs=[{name:_collabs[0]?_collabs[0].name:'You',email:_collabs[0]?_collabs[0].email:'',split:100,role:'Primary Creator',isPrimary:true}];
      _renderCollabs();
    });
  }
  if(inviteAll){
    inviteAll.addEventListener('click',function(){
      var co=_collabs.filter(function(c){ return !c.isPrimary; });
      if(!co.length){ alert('No co-owners added yet.'); return; }
      alert('Invitations queued for:\n'+co.map(function(c){ return '• '+c.email; }).join('\n'));
    });
  }

  // Finalize (collab step → payment)
  var finalizeBtn=document.getElementById('finalizeBtn');
  if(finalizeBtn){
    finalizeBtn.addEventListener('click',function(e){
      e.preventDefault();
      var total=_collabs.reduce(function(s,c){ return s+c.split; },0);
      if(total!==100){ alert('Splits must total 100%. Currently: '+total+'%'); return; }
      _routeToPayment();
    });
  }

  // Auth
  if(typeof window.waitForAuth==='function'){
    window.waitForAuth().then(function(user){
      var msg=document.getElementById('loadingState'); if(msg) msg.remove();
      if(!user){
        alert('You must sign in to continue.');
        window.location.href='/signup_signin.html?redirect='+encodeURIComponent(window.location.href);
        return;
      }
      window.currentUser=user;
      _initPrimary();

      var soloName=document.getElementById('soloOwnerName');
      if(soloName) soloName.textContent=user.email||'You';

      // Step 1 → 2
      var b1=document.getElementById('nextToDetailsBtn');
      if(b1){ b1.disabled=false; b1.addEventListener('click',function(e){ e.preventDefault(); window.showStep(2); }); }

      // Step 2 → 3
      var b2=document.getElementById('nextToOwnershipBtn');
      if(b2){
        b2.addEventListener('click',function(e){
          e.preventDefault();
          var t=document.getElementById('workTitle');
          if(!t||!t.value.trim()){ alert('Please enter a work title.'); return; }
          window.showStep(3);
        });
      }

      // Ownership toggle
      var soloBtn  =document.getElementById('soloModeBtn');
      var collabBtn=document.getElementById('collabModeBtn');
      if(soloBtn){
        soloBtn.addEventListener('click',function(){
          soloBtn.classList.add('active');
          if(collabBtn) collabBtn.classList.remove('active');
        });
      }
      if(collabBtn){
        collabBtn.addEventListener('click',function(){
          if(window.selectedPlan==='free'){
            alert('Co-ownership work certification is not available on Free Plan. Upgrade to Creator Plan or Studio Plan to activate.');
            return;
          }
          collabBtn.classList.add('active');
          if(soloBtn) soloBtn.classList.remove('active');
          var s5=document.getElementById('step5c'); if(s5) s5.style.display='';
          var sn=document.getElementById('stepFinalNum'); if(sn) sn.textContent='6';
          _initPrimary();
        });
      }

      // Step 3 → 4
      var b3=document.getElementById('nextToUploadBtn');
      if(b3){
        b3.addEventListener('click',function(e){
          e.preventDefault();
          var isSolo  =soloBtn  &&soloBtn.classList.contains('active');
          var isCollab=collabBtn&&collabBtn.classList.contains('active');
          if(!isSolo&&!isCollab){ alert('Please select an ownership type.'); return; }
          var sc=document.getElementById('soloContent');
          var cc=document.getElementById('collabContent');
          if(sc) sc.classList.toggle('hidden',!isSolo);
          if(cc) cc.classList.toggle('hidden',!isCollab);
          window.showStep(4);
        });
      }
    });
  } else {
    var msg=document.getElementById('loadingState'); if(msg) msg.remove();
    console.error('waitForAuth not available');
  }

});
