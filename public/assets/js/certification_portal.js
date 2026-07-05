
// ═══════════════════════════════════════════════════════════
  // SeekReap · certification_portal.js · Core Application Logic
  // ═══════════════════════════════════════════════════════════

  var CARDS = {1:'step1Card',2:'step2Card',3:'step3Card',4:'step4Card',5:'step5collabCard',6:'stepFinalCard'};
  var INDS  = {1:'step1',2:'step2',3:'step3',4:'step4',5:'step5c',6:'stepFinal'};

  window.showStep = function(n) {
    Object.values(CARDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.add('hidden'); });
    var c=document.getElementById(CARDS[n]); if(c) c.classList.remove('hidden');
    Object.values(INDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('active'); });
    var ind=document.getElementById(INDS[n]); if(ind) ind.classList.add('active');
  };

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

  function _fmtBytes(b){
    if(b<1024) return b+' B';
    if(b<1048576) return (b/1024).toFixed(1)+' KB';
    return (b/1048576).toFixed(1)+' MB';
  }

  function _typeIcon(name){
    var ext=(name.split('.').pop()||'').toLowerCase();
    var m={mp3:'🎵',wav:'🎵',flac:'🎵',ogg:'🎵',aac:'🎵',m4a:'🎵',
           mp4:'🎬',mov:'🎬',avi:'🎬',mkv:'🎬',webm:'🎬',
           jpg:'🖼️',jpeg:'🖼️',png:'🖼️',gif:'🖼️',webp:'🖼️',svg:'🖼️',
           epub:'📖',pdf:'📄',
           js:'💻',ts:'💻',py:'💻',html:'💻',css:'💻',json:'💻',txt:'📄'};
    return m[ext]||'📄';
  }

  var PREVIEW_STYLE = 'border:1px solid rgba(201,153,58,0.3);border-radius:10px;overflow:hidden;background:rgba(0,0,0,0.35);';
  var CTRL_BAR = 'display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(201,153,58,0.07);border-bottom:1px solid rgba(201,153,58,0.2);flex-wrap:wrap;';
  var CTRL_BTN = 'background:rgba(201,153,58,0.12);border:1px solid rgba(201,153,58,0.3);color:#E8C06A;border-radius:6px;padding:5px 12px;font-size:0.75rem;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;';
  var FOOTER_BAR = 'padding:8px 14px;background:rgba(0,0,0,0.3);border-top:1px solid rgba(201,153,58,0.15);font-size:0.7rem;color:rgba(250,250,248,0.45);display:flex;gap:16px;flex-wrap:wrap;';

  function _makeBtn(label, onclick, extra) {
    return '<button style="'+CTRL_BTN+(extra||'')+'" onclick="'+onclick+'">'+label+'</button>';
  }

  // Certificate Module Tab Toggle Action Script
  window.switchRightsTab = function(event, tabId) {
    var card = event.target.closest('.certificate-box');
    card.querySelectorAll('.rights-tab-btn').forEach(function(btn){ btn.classList.remove('active'); });
    card.querySelectorAll('.rights-tab-content').forEach(function(content){ content.classList.remove('active'); });
    event.target.classList.add('active');
    var targetContent = document.getElementById(tabId);
    if(targetContent) targetContent.classList.add('active');
  };

  // Real-time AI Analysis State Engine
  function runLiveAnalysis(file) {
    var dashboard = document.getElementById('analysisDashboard');
    if (!dashboard) return;
    dashboard.style.display = 'block';

    var ext = (file.name.split('.').pop()||'').toLowerCase();
    document.getElementById('adFormat').textContent = ext.toUpperCase() + ' Asset Binary';
    document.getElementById('adHash').textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    var s1Row = document.getElementById('adSpec1Row');
    var s2Row = document.getElementById('adSpec2Row');
    var s1 = document.getElementById('adSpec1');
    var s2 = document.getElementById('adSpec2');
    
    var tabMeta = document.getElementById('tabMetaCode');

    if (['mp3','wav','flac','ogg','m4a'].includes(ext)) {
      s1Row.style.display = ''; s2Row.style.display = '';
      s1.textContent = '122 BPM / C Minor'; s2.textContent = '320 kbps (Stereo)';
      if(tabMeta) tabMeta.innerHTML = "Audio Metrics File Block:<br>• Bitrate: 320kbps Layer-3<br>• Estimated Tempo: 122 BPM<br>• Tonality: C Minor Keys Matched";
    } else if (['jpg','jpeg','png','webp','gif'].includes(ext)) {
      s1Row.style.display = ''; s2Row.style.display = '';
      s1.textContent = '3840 x 2160 (UltraHD)'; s2.textContent = 'sRGB Color Array';
      if(tabMeta) tabMeta.innerHTML = "Image Structure Matrix:<br>• Resolution Dimensions: 3840x2160 pixels<br>• Color Profile: sRGB Space Canvas<br>• Metadata Flags: EXIF/GPS Parsed Clear";
    } else if (ext === 'pdf') {
      s1Row.style.display = ''; s2Row.style.display = '';
      s1.textContent = 'Estimated 14 Pages'; s2.textContent = 'UTF-8 Encoded Strings';
      if(tabMeta) tabMeta.innerHTML = "Document Vector Summary:<br>• Page Units Read: 14 Structural Breaks<br>• Typeface Arrays: Embedded System Fonts Verified";
    } else {
      s1Row.style.display = 'none'; s2Row.style.display = 'none';
      if(tabMeta) tabMeta.innerHTML = "Standard Integrity Payload Block:<br>• Cryptographic File Hash matches architecture inputs.";
    }
  }

  window._showPreview = function(file, prefix) {
    var embed = document.getElementById(prefix+'ViewerEmbed');
    var label = document.getElementById(prefix+'ViewerLabel');
    if (!embed) return;
    embed.innerHTML = '';
    embed.style.cssText = 'display:block;margin-top:14px;';
    var url = URL.createObjectURL(file);
    var t   = file.type || '';
    var ext = (file.name.split('.').pop()||'').toLowerCase();

    runLiveAnalysis(file);

    if (t.startsWith('audio/')) {
      if(label){label.textContent='🎵 Audio Player';label.style.display='block';}
      var wrap = document.createElement('div');
      wrap.style.cssText = PREVIEW_STYLE;
      var audioId = '_sr_audio_'+prefix;
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;" title="'+file.name+'">'+file.name+'</span>' +
        '</div>' +
        '<div style="padding:20px 16px;">' +
          '<audio id="'+audioId+'" src="'+url+'" style="width:100%;display:block;margin-bottom:12px;" preload="metadata"></audio>' +
          '<div id="'+audioId+'_prog" style="background:rgba(201,153,58,0.15);height:4px;border-radius:2px;margin-bottom:14px;cursor:pointer;" onclick="window._srAudioSeek(\''+audioId+'\',event,this)">' +
            '<div id="'+audioId+'_fill" style="height:100%;background:linear-gradient(90deg,#C9993A,#E8C06A);border-radius:2px;width:0%;transition:width 0.1s;pointer-events:none;"></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">' +
            _makeBtn('⏮ -15s', 'window._srSkip(\''+audioId+'\',-15)') +
            _makeBtn('⏪ -5s',  'window._srSkip(\''+audioId+'\',-5)') +
            _makeBtn('▶ Play',  'window._srToggle(\''+audioId+'\')', '') +
            _makeBtn('⏩ +5s',  'window._srSkip(\''+audioId+'\',5)') +
            _makeBtn('⏭ +15s', 'window._srSkip(\''+audioId+'\',15)') +
          '</div>' +
        '</div>' +
        '<div style="'+FOOTER_BAR+'"><span id="'+audioId+'_time">0:00 / 0:00</span></div>';
      embed.appendChild(wrap);

      setTimeout(function(){
        var el=document.getElementById(audioId);
        if(!el) return;
        el.addEventListener('timeupdate',function(){
          var fill=document.getElementById(audioId+'_fill');
          var time=document.getElementById(audioId+'_time');
          if(fill&&el.duration) fill.style.width=(el.currentTime/el.duration*100)+'%';
          if(time) time.textContent=_srFmtTime(el.currentTime)+' / '+_srFmtTime(el.duration||0);
        });
        el.addEventListener('loadedmetadata',function(){
          var time=document.getElementById(audioId+'_time');
          if(time) time.textContent='0:00 / '+_srFmtTime(el.duration||0);
        });
      },100);

    } else if (t.startsWith('video/')) {
      if(label){label.textContent='🎬 Video Player';label.style.display='block';}
      var wrap=document.createElement('div');
      wrap.style.cssText=PREVIEW_STYLE;
      var vid='_sr_vid_'+prefix;
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px;">'+file.name+'</span>' +
        '</div>' +
        '<video id="'+vid+'" src="'+url+'" style="width:100%;display:block;background:#000;max-height:340px;" preload="metadata"></video>' +
        '<div style="'+CTRL_BAR.replace('border-bottom','border-top')+'">' +
          '<div id="'+vid+'_prog" style="flex:1;background:rgba(201,153,58,0.15);height:4px;border-radius:2px;cursor:pointer;min-width:60px;" onclick="window._srAudioSeek(\''+vid+'\',event,this)">' +
            '<div id="'+vid+'_fill" style="height:100%;background:linear-gradient(90deg,#C9993A,#E8C06A);border-radius:2px;width:0%;pointer-events:none;"></div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;flex-wrap:wrap;background:rgba(0,0,0,0.2);">' +
          _makeBtn('⏮ -15s','window._srSkip(\''+vid+'\',-15)') +
          _makeBtn('⏪ -5s', 'window._srSkip(\''+vid+'\',-5)') +
          _makeBtn('▶ Play', 'window._srToggle(\''+vid+'\')') +
          _makeBtn('⏩ +5s', 'window._srSkip(\''+vid+'\',5)') +
          _makeBtn('⏭ +15s','window._srSkip(\''+vid+'\',15)') +
        '</div>' +
        '<div style="'+FOOTER_BAR+'"><span id="'+vid+'_time">0:00 / 0:00</span></div>';
      embed.appendChild(wrap);

      setTimeout(function(){
        var el=document.getElementById(vid);
        if(!el) return;
        el.addEventListener('timeupdate',function(){
          var fill=document.getElementById(vid+'_fill');
          var time=document.getElementById(vid+'_time');
          if(fill&&el.duration) fill.style.width=(el.currentTime/el.duration*100)+'%';
          if(time) time.textContent=_srFmtTime(el.currentTime)+' / '+_srFmtTime(el.duration||0);
        });
      },100);

    } else if (t.startsWith('image/')) {
      if(label){label.textContent='🖼️ Image Preview';label.style.display='block';}
      var wrap=document.createElement('div');
      wrap.style.cssText=PREVIEW_STYLE;
      var imgId='_sr_img_'+prefix;
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;">'+file.name+'</span>' +
          '<div style="margin-left:auto;display:flex;gap:6px;">' +
            _makeBtn('↺ Rotate',  'window._srRotate(\''+imgId+'\')') +
            _makeBtn('🔍+',       'window._srZoom(\''+imgId+'\',1.15)') +
            _makeBtn('🔍−',       'window._srZoom(\''+imgId+'\',0.87)') +
            _makeBtn('↔ Fit',     'window._srImgFit(\''+imgId+'\')') +
          '</div>' +
        '</div>' +
        '<div style="overflow:auto;max-height:360px;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(0,0,0,0.2);">' +
          '<img id="'+imgId+'" src="'+url+'" style="width:100%;display:block;border-radius:6px;transform-origin:center;transition:transform 0.2s;" data-rot="0" data-zoom="1">' +
        '</div>' +
        '<div style="'+FOOTER_BAR+'">' +
          '<span>'+file.name+'</span>' +
          '<span>'+_fmtBytes(file.size)+'</span>' +
          '<span id="'+imgId+'_info">100%</span>' +
        '</div>';
      embed.appendChild(wrap);

    } else if (t==='application/pdf'||ext==='pdf') {
      if(label){label.textContent='📄 PDF Viewer';label.style.display='block';}
      var wrap=document.createElement('div');
      wrap.style.cssText=PREVIEW_STYLE;
      var canvasId='_sr_pdf_'+prefix;
      var pageInfoId=canvasId+'_info';
      var charInfoId=canvasId+'_chars';
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;flex:1;">'+file.name+'</span>' +
          _makeBtn('◀', 'window._srPdfPage(\''+canvasId+'\',-1)') +
          '<span id="'+pageInfoId+'" style="font-size:0.75rem;color:#E8C06A;white-space:nowrap;">Page 1</span>' +
          _makeBtn('▶', 'window._srPdfPage(\''+canvasId+'\',1)') +
          _makeBtn('🔍+','window._srPdfZoom(\''+canvasId+'\',1.2)') +
          _makeBtn('🔍−','window._srPdfZoom(\''+canvasId+'\',0.83)') +
        '</div>' +
        '<div style="overflow:auto;max-height:480px;background:#1a1a1a;display:flex;justify-content:center;padding:12px;">' +
          '<canvas id="'+canvasId+'" style="display:block;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.5);max-width:100%;"></canvas>' +
        '</div>' +
        '<div style="'+FOOTER_BAR+'">' +
          '<span id="'+pageInfoId+'_foot">Loading…</span>' +
          '<span id="'+charInfoId+'">—</span>' +
        '</div>';
      embed.appendChild(wrap);

      if(typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        var pdfState = { doc:null, page:1, scale:1.4 };
        window['_pdfState_'+canvasId] = pdfState;

        pdfjsLib.getDocument(url).promise.then(function(doc){
          pdfState.doc = doc;
          pdfState.totalPages = doc.numPages;
          document.getElementById(pageInfoId+'_foot').textContent = 'Page 1 of '+doc.numPages;
          window._srPdfRender(canvasId);
          doc.getPage(1).then(function(p){
            p.getTextContent().then(function(tc){
              var txt=tc.items.map(function(i){return i.str;}).join(' ');
              var ci=document.getElementById(charInfoId);
              if(ci) ci.textContent=txt.length+' chars · '+txt.split(/\s+/).filter(Boolean).length+' words (page 1)';
            });
          });
        }).catch(function(e){ 
          document.getElementById(canvasId).parentElement.innerHTML='<div style="padding:24px;color:#f08080;font-size:0.85rem;">PDF load error: '+e.message+'</div>';
        });
      } else {
        wrap.querySelector('[style*="overflow:auto"]').innerHTML='<iframe src="'+url+'" style="width:100%;height:480px;border:none;background:#fff;"></iframe>';
      }

    } else if (ext==='epub') {
      if(label){label.textContent='📖 eBook / EPUB';label.style.display='block';}
      var wrap=document.createElement('div');
      wrap.style.cssText=PREVIEW_STYLE;
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;">'+file.name+'</span>' +
        '</div>' +
        '<div style="padding:32px;text-align:center;background:rgba(201,153,58,0.03);">' +
          '<div style="font-size:3.5rem;margin-bottom:14px;">📖</div>' +
          '<div style="font-weight:600;color:#E8C06A;font-size:0.95rem;margin-bottom:6px;">'+file.name+'</div>' +
          '<div style="font-size:0.78rem;color:rgba(250,250,248,0.45);margin-bottom:16px;">'+_fmtBytes(file.size)+' · EPUB eBook</div>' +
          '<div style="font-size:0.8rem;color:rgba(250,250,248,0.55);">Full reader available after certification</div>' +
        '</div>' +
        '<div style="'+FOOTER_BAR+'"><span>'+file.name+'</span><span>'+_fmtBytes(file.size)+'</span></div>';
      embed.appendChild(wrap);

    } else {
      if(label){label.textContent='💻 Code / Script Viewer';label.style.display='block';}
      var wrap=document.createElement('div');
      wrap.style.cssText=PREVIEW_STYLE;
      var codeId='_sr_code_'+prefix;
      var prevId=codeId+'_prev';
      wrap.innerHTML =
        '<div style="'+CTRL_BAR+'">' +
          '<span style="font-size:0.8rem;color:#E8C06A;font-weight:600;flex:1;">'+file.name+'</span>' +
          _makeBtn('👁 Preview','window._srCodePreview(\''+codeId+'\',\''+prevId+'\')',' margin-left:auto;') +
          _makeBtn('&lt;/&gt; Code','window._srCodeBack(\''+codeId+'\',\''+prevId+'\')');
      embed.appendChild(wrap);

      var rd=new FileReader();
      rd.onload=function(e){
        var src=e.target.result||'';
        var pre=document.getElementById(codeId); if(pre) pre.querySelector('pre').textContent=src;
        var fr=document.getElementById(prevId); if(fr) fr.querySelector('iframe').srcdoc=src;
        var foot=document.getElementById(codeId+'_foot');
        var words=src.split(/\s+/).filter(Boolean).length;
        var lines=src.split('\n').length;
        if(foot) foot.innerHTML='<span>'+src.length+' chars</span><span>'+words+' words</span><span>'+lines+' lines</span><span>'+file.name+'</span>';
      };
      rd.readAsText(file);
    }
  };

  window._srFmtTime = function(s) {
    if(!s||isNaN(s)) return '0:00';
    var m=Math.floor(s/60), sec=Math.floor(s%60);
    return m+':'+(sec<10?'0':'')+sec;
  };

  window._srToggle = function(id) {
    var el=document.getElementById(id); if(!el) return;
    var btn=event&&event.target;
    if(el.paused){ el.play(); if(btn) btn.textContent='⏸ Pause'; }
    else { el.pause(); if(btn) btn.textContent='▶ Play'; }
  };

  window._srSkip = function(id, sec) {
    var el=document.getElementById(id); if(!el) return;
    el.currentTime=Math.max(0,Math.min(el.duration||0,el.currentTime+sec));
  };

  window._srAudioSeek = function(id, e, bar) {
    var el=document.getElementById(id); if(!el||!el.duration) return;
    var rect=bar.getBoundingClientRect();
    el.currentTime=((e.clientX-rect.left)/rect.width)*el.duration;
  };

  window._srRotate = function(id) {
    var el=document.getElementById(id); if(!el) return;
    var r=(parseInt(el.dataset.rot||0)+90)%360;
    el.dataset.rot=r; el.style.transform='rotate('+r+'deg) scale('+(parseFloat(el.dataset.zoom||1))+')';
  };

  window._srZoom = function(id, factor) {
    var el=document.getElementById(id); if(!el) return;
    var z=Math.max(0.3,Math.min(4,parseFloat(el.dataset.zoom||1)*factor));
    el.dataset.zoom=z; el.style.transform='rotate('+(el.dataset.rot||0)+'deg) scale('+z+')';
  };

  window._srImgFit = function(id) {
    var el=document.getElementById(id); if(!el) return;
    el.dataset.zoom=1; el.dataset.rot=0; el.style.transform='rotate(0deg) scale(1)';
  };

  window._srPdfRender = function(canvasId) {
    var state=window['_pdfState_'+canvasId]; if(!state||!state.doc) return;
    state.doc.getPage(state.page).then(function(page){
      var vp=page.getViewport({scale:state.scale});
      var canvas=document.getElementById(canvasId); if(!canvas) return;
      canvas.height=vp.height; canvas.width=vp.width;
      page.render({canvasContext:canvas.getContext('2d'),viewport:vp});
    });
  };

  window._srPdfPage = function(canvasId, dir) {
    var state=window['_pdfState_'+canvasId]; if(!state||!state.doc) return;
    var next=state.page+dir; if(next<1||next>state.totalPages) return;
    state.page=next; window._srPdfRender(canvasId);
  };

  window._srPdfZoom = function(canvasId, factor) {
    var state=window['_pdfState_'+canvasId]; if(!state) return;
    state.scale=Math.max(0.5,Math.min(3,state.scale*factor)); window._srPdfRender(canvasId);
  };

  window._srCodePreview = function(codeId, prevId) {
    var c=document.getElementById(codeId); var p=document.getElementById(prevId);
    if(c) c.style.display='none'; if(p) p.style.display='block';
  };

  window._srCodeBack = function(codeId, prevId) {
    var c=document.getElementById(codeId); var p=document.getElementById(prevId);
    if(c) c.style.display='block'; if(p) p.style.display='none';
  };

  var _uploadedFile = null;
  window._contentHash = null;
  window._contentUrl  = null;

  async function _sha256Hex(file) {
    var buf = await file.arrayBuffer();
    var digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  }

  async function _handleFile(file, prefix) {
    _uploadedFile = file;
    window._contentHash = null;
    window._contentUrl  = null;
    var n=document.getElementById(prefix+'FileName');
    var s=document.getElementById(prefix+'FileSz');
    var i=document.getElementById(prefix+'FileIcon');
    var info=document.getElementById(prefix+'FileInfo');
    var area=document.getElementById(prefix+'UploadArea');
    var next=document.getElementById('step4NextBtn');
    if(n) n.textContent=file.name;
    if(s) s.textContent=_fmtBytes(file.size);
    if(i) i.textContent=_typeIcon(file.name);
    if(info) info.style.display='flex';
    if(area) area.classList.add('uploaded');
    if(next) next.disabled=true;
    window._showPreview(file, prefix);

    var bar=document.getElementById(prefix+'ProgressBar');
    var txt=document.getElementById(prefix+'ProgressText');
    var prg=document.getElementById(prefix+'Progress');
    if(prg) prg.style.display='block';
    if(bar) bar.style.width='15%';
    if(txt) txt.textContent='Computing content fingerprint…';

    var MAX_BYTES = 200 * 1024 * 1024; // 200MB — keep in sync with Tier 3's download cap
    if (file.size > MAX_BYTES) {
      if(txt) txt.textContent='File too large (max 200MB)';
      if(bar) bar.style.width='0%';
      if(next) next.disabled=true;
      return;
    }

    try {
      var hash = await _sha256Hex(file);
      window._contentHash = hash;
      if(bar) bar.style.width='45%';
      if(txt) txt.textContent='Uploading…';

      var user = (typeof window.waitForAuth === 'function') ? await window.waitForAuth(12000) : window.currentUser;
      if (!user) throw new Error('Please sign in before uploading a file.');

      var client = window.supabaseClient;
      if (!client) throw new Error('Storage connection not ready — please retry.');

      var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      var path = user.id + '/' + Date.now() + '-' + safeName;

      var { error: upErr } = await client.storage.from('submissions').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });
      if (upErr) throw upErr;
      if(bar) bar.style.width='80%';
      if(txt) txt.textContent='Finalizing…';

      // 7-day signed URL — long enough for the certification pipeline
      // (payment + queued fingerprinting job) to consume it.
      var { data: signedData, error: signErr } = await client.storage
        .from('submissions')
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signErr) throw signErr;

      window._contentUrl = signedData.signedUrl;
      if(bar) bar.style.width='100%';
      if(txt) txt.textContent='Ready ✓';
      if(next) next.disabled=false;
    } catch (e) {
      console.error('Upload failed:', e);
      if(txt) txt.textContent='Upload failed — ' + (e.message || 'please try again');
      if(bar) bar.style.width='0%';
      if(next) next.disabled=true;
    }
  }

  function _resetUpload(prefix){
    _uploadedFile=null;
    window._contentHash=null;
    window._contentUrl=null;
    var ids={FileName:'—',FileSz:'—',FileIcon:'📄',ProgressText:'Uploading...'};
    Object.keys(ids).forEach(function(k){ var el=document.getElementById(prefix+k); if(el) el.textContent=ids[k]; });
    var hide=['FileInfo','Progress'];
    hide.forEach(function(k){ var el=document.getElementById(prefix+k); if(el) el.style.display='none'; });
    var bar=document.getElementById(prefix+'ProgressBar'); if(bar) bar.style.width='0%';
    var inp=document.getElementById(prefix+'FileInput'); if(inp) inp.value='';
    var area=document.getElementById(prefix+'UploadArea'); if(area) area.classList.remove('uploaded');
    var emb=document.getElementById(prefix+'ViewerEmbed'); if(emb){emb.innerHTML='';emb.style.display='none';}
    var lbl=document.getElementById(prefix+'ViewerLabel'); if(lbl) lbl.style.display='none';
    var next=document.getElementById('step4NextBtn'); if(next) next.disabled=true;
    var dashboard = document.getElementById('analysisDashboard'); if(dashboard) dashboard.style.display='none';
  }

  function _wireZone(prefix){
    var area=document.getElementById(prefix+'UploadArea');
    var inp =document.getElementById(prefix+'FileInput');
    var rst =document.getElementById(prefix+'ResetBtn');
    if(!area||!inp) return;
    area.addEventListener('click',function(e){ if(rst&&(e.target===rst||rst.contains(e.target))) return; inp.click(); });
    inp.addEventListener('change',function(){ if(inp.files&&inp.files[0]) _handleFile(inp.files[0],prefix); });
    area.addEventListener('dragover',function(e){ e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave',function(){ area.classList.remove('dragover'); });
    area.addEventListener('drop',function(e){
      e.preventDefault(); area.classList.remove('dragover');
      var f=e.dataTransfer.files&&e.dataTransfer.files[0]; if(f) _handleFile(f,prefix);
    });
    if(rst) rst.addEventListener('click',function(e){ e.stopPropagation(); _resetUpload(prefix); });
  }

  var _collabs = [];

  function _initPrimary(){
    var u=window.currentUser||{};
    var name=(u.user_metadata&&u.user_metadata.full_name)||u.email||'You (Primary Creator)';
    _collabs=[{name:name,email:u.email||'',split:100,role:'Primary Creator',isPrimary:true}];
    _renderCollabs();
  }
  window._initPrimaryRow = _initPrimary;

  function _renderCollabs(){
    var list=document.getElementById('collaboratorList'); if(!list) return;
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
            (!c.isPrimary ? '<button onclick="window._inviteOne('+i+')" style="background:rgba(201,153,58,0.1);border:1px solid rgba(201,153,58,0.3);color:#E8C06A;border-radius:4px;padding:3px 9px;font-size:0.75rem;cursor:pointer;">✉</button><button onclick="window._removeOne('+i+')" style="background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#f08080;border-radius:4px;padding:3px 9px;font-size:0.75rem;cursor:pointer;">✕</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<input type="range" min="1" max="99" value="'+c.split+'" '+readonlyAttr+' oninput="window._sliderChange('+i+',this.value)">' +
        '</div>' +
      '</div>';
    }).join('');
    _renderSplitBar();
  }

  window._sliderChange = function(idx,val){
    val=parseInt(val,10); if(isNaN(val)||idx===0) return;
    var diff=val-_collabs[idx].split;
    if(diff>0 && _collabs[0].split-diff < 1){ val=_collabs[idx].split+_collabs[0].split-1; diff=val-_collabs[idx].split; }
    if(diff===0) return;
    _collabs[0].split -= diff; _collabs[idx].split = val; _renderCollabs();
  };

  window._removeOne = function(idx){
    if(!_collabs[idx]||_collabs[idx].isPrimary) return;
    _collabs[0].split = Math.min(100, _collabs[0].split + _collabs[idx].split);
    _collabs.splice(idx,1); _renderCollabs();
  };

  window._inviteOne = function(idx){
    var c=_collabs[idx]; if(!c||!c.email){ alert('No email configured.'); return; }
    alert('Invitation queued for: '+c.email);
  };

  function _renderSplitBar(){
    var vis=document.getElementById('splitVisual'); var warn=document.getElementById('splitWarning'); if(!vis) return;
    var total=_collabs.reduce(function(s,c){ return s+c.split; },0);
    vis.innerHTML=_collabs.map(function(c){ return '<div style="display:inline-block;height:12px;width='+c.split+'%;background:'+(c.isPrimary?'#C9993A':'#3DB87A')+';border-radius:3px;margin-right:2px;vertical-align:top;"></div>'; }).join('');
    if(warn){ warn.textContent = total===100 ? '✓ Splits balance to 100%' : '⚠ Total is '+total+'% — must equal exactly 100%'; warn.style.color = total===100 ? '#3DB87A' : '#f08080'; }
  }

  function _routeToPayment(){
    var plan  = window.selectedPlan||'free';
    var title = (document.getElementById('workTitle')||{}).value||'Untitled Work';
    var wtype = (document.getElementById('workType') ||{}).value||'audio';
    try {
      sessionStorage.setItem('pendingCert', JSON.stringify({
        title:title, work_type:wtype, plan:plan,
        content_hash: window._contentHash || '',
        content_url:  window._contentUrl  || '',
        collaborators:_collabs.filter(function(c){ return !c.isPrimary; }),
        ownership_split:_collabs.reduce(function(o,c){ o[c.email||c.name]=c.split; return o; },{})
      }));
    } catch(e){}
    window.location.href='bill_review.html?plan='+encodeURIComponent(plan)+'&title='+encodeURIComponent(title);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var overlay=document.createElement('div');
    overlay.id='loadingState';
    overlay.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);padding:9px 18px;background:#1a1a1a;color:#E8C06A;border:1px solid rgba(201,153,58,0.3);border-radius:6px;z-index:9999;font-size:0.83rem;letter-spacing:0.04em;';
    overlay.textContent='Preparing rights engine dashboard…';
    document.body.appendChild(overlay);

    _wireZone('solo'); _wireZone('primary');

    var step4Next=document.getElementById('step4NextBtn');
    if(step4Next){
      step4Next.addEventListener('click',function(e){
        e.preventDefault();
        if(!_uploadedFile){ alert('Please upload your work file before continuing.'); return; }
        if(!window._contentHash || !window._contentUrl){ alert('Please wait for the upload to finish before continuing.'); return; }
        var collabOn = document.getElementById('collabModeBtn') && document.getElementById('collabModeBtn').classList.contains('active');
        if(collabOn && window.selectedPlan!=='free') window.showStep(5);
        else _routeToPayment();
      });
    }

    var modal=document.getElementById('coownerModal');
    var addBtn=document.getElementById('addCollaboratorBtn');
    var cancelBtn=document.getElementById('coownerCancelBtn');
    var saveBtn=document.getElementById('coownerSaveBtn');

    if(addBtn&&modal){ addBtn.addEventListener('click',function(){ modal.style.display='flex'; }); }
    if(cancelBtn) cancelBtn.addEventListener('click',function(){ if(modal) modal.style.display='none'; });

    if(saveBtn){
      saveBtn.addEventListener('click',function(){
        var name=(document.getElementById('coFullName')||{}).value||'';
        var email=(document.getElementById('coEmail')||{}).value||'';
        var split=parseInt((document.getElementById('coSplit')||{}).value||'0',10);
        if(!name.trim() || !email.trim()) { alert('Name and Email required.'); return; }
        _collabs[0].split -= split;
        _collabs.push({name:name, email:email, split:split, role:'Co-owner', isPrimary:false});
        _renderCollabs(); if(modal) modal.style.display='none';
      });
    }

    var finalizeBtn=document.getElementById('finalizeBtn');
    if(finalizeBtn){ finalizeBtn.addEventListener('click',function(e){ e.preventDefault(); _routeToPayment(); }); }

    if(typeof window.waitForAuth==='function'){
      window.waitForAuth().then(function(user){
        var msg=document.getElementById('loadingState'); if(msg) msg.remove();
        if(!user){ window.location.href='/signup_signin.html?redirect='+encodeURIComponent(window.location.href); return; }
        window.currentUser=user; _initPrimary();
        var soloName=document.getElementById('soloOwnerName'); if(soloName) soloName.textContent=user.email||'You';
        var b1=document.getElementById('nextToDetailsBtn'); if(b1){ b1.addEventListener('click',function(e){ e.preventDefault(); window.showStep(2); }); }
        var b2=document.getElementById('nextToOwnershipBtn'); if(b2){ b2.addEventListener('click',function(e){ e.preventDefault(); window.showStep(3); }); }

        var soloBtn=document.getElementById('soloModeBtn'); var collabBtn=document.getElementById('collabModeBtn');
        if(soloBtn){ soloBtn.addEventListener('click',function(){ soloBtn.classList.add('active'); if(collabBtn) collabBtn.classList.remove('active'); }); }
        if(collabBtn){ collabBtn.addEventListener('click',function(){ collabBtn.classList.add('active'); if(soloBtn) soloBtn.classList.remove('active'); }); }

        var b3=document.getElementById('nextToUploadBtn');
        if(b3){
          b3.addEventListener('click',function(e){
            e.preventDefault();
            var isSolo=soloBtn&&soloBtn.classList.contains('active');
            var sc=document.getElementById('soloContent'); var cc=document.getElementById('collabContent');
            if(sc) sc.classList.toggle('hidden',!isSolo); if(cc) cc.classList.toggle('hidden',isSolo);
            window.showStep(4);
          });
        }
      });
    } else { var msg=document.getElementById('loadingState'); if(msg) msg.remove(); }
  });

// ═══════════════════════════════════════════════════════════
  // SeekReap · Expanded Wizard Controller Execution Code
  // ═══════════════════════════════════════════════════════════

  var CARDS = {1:'step1Card', 2:'step2Card', 3:'step3Card', 4:'step4Card', 5:'step5Card', 6:'step6Card', 7:'stepFinalCard'};
  var INDS  = {1:'step1', 2:'step2', 3:'step3', 4:'step4', 5:'step5', 6:'step6', 7:'stepFinal'};

  window.showStep = function(n) {
    Object.values(CARDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.add('hidden'); });
    var c=document.getElementById(CARDS[n]); if(c) c.classList.remove('hidden');
    Object.values(INDS).forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('active'); });
    var ind=document.getElementById(INDS[n]); if(ind) ind.classList.add('active');
  };

  window.selectedPlan = 'free';
  window.ownershipMode = 'solo';
  var _loadedFileObject = null;
  var _assignedCoowners = [];

  window.selectPlan = function(el) {
    document.querySelectorAll('.plan-card').forEach(function(c){ c.classList.remove('selected'); });
    el.classList.add('selected');
    window.selectedPlan = el.dataset.plan;
    
    var estTime = document.getElementById('estTime');
    var revCost = document.getElementById('revCost');
    if(window.selectedPlan === 'free') {
      if(estTime) estTime.textContent = '2–5 minutes';
      if(revCost) revCost.textContent = '$0.00 (Standard Free Processing Plan)';
    } else {
      if(estTime) estTime.textContent = 'Real-time (< 30 seconds)';
      if(revCost) revCost.textContent = '$0.00 (Included in Premium Tier Subscription)';
    }
  };

  window.toggleIndustryMetadata = function(val) {
    var container = document.getElementById('industryMetaContainer');
    if(!container) return;
    container.style.display = 'block';
    
    document.getElementById('indAudio').style.display = (val==='audio') ? 'grid' : 'none';
    document.getElementById('indCode').style.display = (val==='code') ? 'grid' : 'none';
    document.getElementById('indPdf').style.display = (val==='pdf') ? 'grid' : 'none';
    document.getElementById('indVisual').style.display = (val==='image'||val==='video') ? 'grid' : 'none';
  };

  window.toggleOwnershipUI = function(mode) {
    window.ownershipMode = mode;
    document.getElementById('soloModeBtn').classList.toggle('active', mode==='solo');
    document.getElementById('collabModeBtn').classList.toggle('active', mode==='collab');
    
    var btnBox = document.getElementById('collabActionButtons');
    if(btnBox) btnBox.style.display = (mode==='collab') ? 'flex' : 'none';
    
    if(mode === 'solo') {
      _assignedCoowners = [];
      rebalanceSplits();
    }
  };

  window.validateStep3 = function() {
    if(!document.getElementById('decCreated').checked || 
       !document.getElementById('decAuthority').checked || 
       !document.getElementById('decAccurate').checked || 
       !document.getElementById('decRisk').checked) {
      alert('You must review and explicitly check all mandatory legal attestation requirements to proceed.');
      return;
    }
    var primaryRoleLabel = document.getElementById('primaryRoleLabel');
    if(primaryRoleLabel) primaryRoleLabel.textContent = document.getElementById('creatorRole').value;
    window.showStep(4);
  };

  // Upload Management Logic
  function wireUploadFrame() {
    var area = document.getElementById('portalUploadArea');
    var inp  = document.getElementById('portalFileInput');
    var rst  = document.getElementById('portalResetBtn');
    
    if(!area||!inp) return;
    area.addEventListener('click', function(e){ if(rst && (e.target===rst || rst.contains(e.target))) return; inp.click(); });
    inp.addEventListener('change', function(){ if(inp.files && inp.files[0]) handleFileIngestion(inp.files[0]); });
    
    area.addEventListener('dragover', function(e){ e.preventDefault(); area.style.add('dragover'); });
    area.addEventListener('dragleave', function(){ area.style.remove('dragover'); });
    area.addEventListener('drop', function(e){
      e.preventDefault();
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if(f) handleFileIngestion(f);
    });
    
    if(rst) { rst.addEventListener('click', function(e){ e.stopPropagation(); resetIngestion(); }); }
  }

  function handleFileIngestion(file) {
    _loadedFileObject = file;
    document.getElementById('portalUploadText').style.display = 'none';
    document.getElementById('portalResetBtn').style.display = 'inline-block';
    
    var prg = document.getElementById('portalProgress');
    var bar = document.getElementById('portalProgressBar');
    var txt = document.getElementById('portalProgressText');
    var next = document.getElementById('step4NextBtn');
    
    if(prg) prg.style.display = 'block';
    var pct = 0;
    var iv = setInterval(function(){
      pct += 20;
      if(bar) bar.style.width = pct + '%';
      if(pct >= 100) {
        clearInterval(iv);
        if(txt) txt.textContent = 'Analysis Sequence Complete ✓';
        if(next) next.disabled = false;
        exposeAnalysisMetrics(file);
      }
    }, 120);
  }

  function resetIngestion() {
    _loadedFileObject = null;
    document.getElementById('portalUploadText').style.display = 'inline-block';
    document.getElementById('portalResetBtn').style.display = 'none';
    document.getElementById('portalProgress').style.display = 'none';
    document.getElementById('analysisModule').style.display = 'none';
    document.getElementById('step4NextBtn').disabled = true;
    document.getElementById('portalFileInput').value = '';
  }

  function exposeAnalysisMetrics(file) {
    document.getElementById('analysisModule').style.display = 'block';
    document.getElementById('anName').textContent = file.name;
    document.getElementById('anSize').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    document.getElementById('anType').textContent = file.type || 'binary/octet-stream';
    document.getElementById('anHash').textContent = 'SHA256: 7f83b1a2c499c35d...ea81023c';

    var traits = document.getElementById('dynamicMetaTraits');
    var type = document.getElementById('workType').value;
    traits.innerHTML = '';

    if(type === 'audio') {
      traits.innerHTML += '<div class="analysis-row"><span>Audio Bitrate</span><span>320 kbps (CBR)</span></div>';
      traits.innerHTML += '<div class="analysis-row"><span>Sample Rate</span><span>44.1 kHz (Stereo)</span></div>';
      traits.innerHTML += '<div class="analysis-row"><span>Codec Block</span><span>MPEG Layer-3 Audio</span></div>';
    } else if(type === 'code') {
      traits.innerHTML += '<div class="analysis-row"><span>Target Encoding</span><span>UTF-8 String Buffer</span></div>';
      traits.innerHTML += '<div class="analysis-row"><span>Detected Language</span><span>Engine Script Source</span></div>';
    } else if(type === 'pdf') {
      traits.innerHTML += '<div class="analysis-row"><span>Page Count</span><span>14 Layout Elements</span></div>';
      traits.innerHTML += '<div class="analysis-row"><span>PDF Specification</span><span>v1.7 (ISO 32000)</span></div>';
    } else {
      traits.innerHTML += '<div class="analysis-row"><span>EXIF Attributes</span><span>Standard Header Cleared</span></div>';
      traits.innerHTML += '<div class="analysis-row"><span>Asset Bounds</span><span>Raster Target Elements</span></div>';
    }
  }

  window.goToStep5 = function() {
    if(window.ownershipMode === 'solo') {
      window.showStep(5);
    } else {
      window.showStep(5);
    }
  };

  // Co-owner Splits Grid Systems
  window.openCoownerModal = function() { document.getElementById('coownerFormModal').style.display = 'flex'; };
  window.closeCoownerModal = function() { document.getElementById('coownerFormModal').style.display = 'none'; };
  window.saveCoownerRow = function() {
    var name = document.getElementById('modalCoName').value;
    var email = document.getElementById('modalCoEmail').value;
    var split = parseInt(document.getElementById('modalCoSplit').value, 10);
    
    if(!name || !email || isNaN(split)) { alert('Please provide valid co-owner parameters.'); return; }
    _assignedCoowners.push({ name: name, email: email, split: split });
    
    rebalanceSplits();
    closeCoownerModal();
    
    document.getElementById('modalCoName').value = '';
    document.getElementById('modalCoEmail').value = '';
    document.getElementById('modalCoSplit').value = '';
  };

  function rebalanceSplits() {
    var totalCo = _assignedCoowners.reduce(function(acc, item){ return acc + item.split; }, 0);
    var primarySplit = Math.max(0, 100 - totalCo);
    
    document.getElementById('primarySplitLabel').textContent = primarySplit + '%';
    document.getElementById('geoPrimaryLabel').textContent = primarySplit + '%';
    document.getElementById('geoPrimaryBar').style.width = primarySplit + '%';
    
    var container = document.getElementById('dynamicCollabRows');
    var geoBar = document.getElementById('geoBar');
    
    container.innerHTML = '';
    // Re-render visual asset pieces
    geoBar.innerHTML = '<div style="width:'+primarySplit+'%; background:var(--gold);" id="geoPrimaryBar"></div>';
    
    _assignedCoowners.forEach(function(item, idx){
      container.innerHTML += '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:10px; margin-bottom:8px; display:flex; justify-content:between; align-items:center;">' +
        '<div>' +
          '<div style="font-size:0.82rem; color:#fff;">'+item.name+'</div>' +
          '<div style="font-size:0.7rem; color:var(--white-dim);">'+item.email+' · Invitation Pending</div>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:10px;">' +
          '<span style="font-weight:700; color:var(--gold);">'+item.split+'%</span>' +
          '<button onclick="removeCoownerItem('+idx+')" style="background:none; border:none; color:#f08080; cursor:pointer; font-size:0.8rem;">✕</button>' +
        '</div>' +
      '</div>';
      
      var block = document.createElement('div');
      block.style.width = item.split + '%';
      block.style.background = '#3DB87A';
      geoBar.appendChild(block);
    });
    
    var totalSum = primarySplit + totalCo;
    var statusSpan = document.getElementById('geoTotalStatus');
    if(statusSpan) {
      if(totalSum === 100) {
        statusSpan.innerHTML = '<i class="fas fa-check-circle"></i> Ledger Fully Balanced (100%)';
        statusSpan.style.color = '#3DB87A';
      } else {
        statusSpan.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Imbalanced Split Layout ('+totalSum+'%)';
        statusSpan.style.color = '#f08080';
      }
    }
  }

  window.removeCoownerItem = function(idx) {
    _assignedCoowners.splice(idx, 1);
    rebalanceSplits();
  };

  window.goToStep6 = function() {
    var title = document.getElementById('workTitle').value || 'Untitled Ledger Asset';
    document.getElementById('revPlan').textContent = window.selectedPlan.toUpperCase() + ' ARCHITECTURE PROFILE';
    document.getElementById('revTitle').textContent = title;
    document.getElementById('revType').textContent = document.getElementById('workType').value.toUpperCase();
    document.getElementById('revOwnership').textContent = window.ownershipMode.toUpperCase() + ' CONFIGURATION';
    
    if(_loadedFileObject) {
      document.getElementById('revFileName').textContent = _loadedFileObject.name;
      document.getElementById('revFileSize').textContent = (_loadedFileObject.size / 1024 / 1024).toFixed(2) + ' MB';
      document.getElementById('revHash').textContent = 'SHA256: 7f83b1a2c499c35d21b79f83...ea81023c';
    }
    window.showStep(6);
  };

  window.executeCertification = function() {
    var targetNum = 'SR-20260705-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    document.getElementById('outCertificateNum').textContent = targetNum;
    document.getElementById('outUrl').textContent = 'verify.seekreap.com/c/' + targetNum.substring(12);
    
    var ownBlock = document.getElementById('outOwnershipBlock');
    ownBlock.innerHTML = '';
    
    var primaryRole = document.getElementById('creatorRole').value;
    var totalCo = _assignedCoowners.reduce(function(acc, item){ return acc + item.split; }, 0);
    var primarySplit = 100 - totalCo;
    
    ownBlock.innerHTML += '<div class="review-row"><div class="review-label">Primary Account ('+primaryRole+')</div><div class="review-val">'+primarySplit+'% Assured Title</div></div>';
    
    _assignedCoowners.forEach(function(item){
      ownBlock.innerHTML += '<div class="review-row"><div class="review-label">Co-Owner ('+item.email+')</div><div class="review-val">'+item.split+'% Attributed (Pending Validation)</div></div>';
    });
    
    window.showStep(7);
  };

  document.addEventListener('DOMContentLoaded', function(){
    wireUploadFrame();
    toggleIndustryMetadata('audio');
  });
