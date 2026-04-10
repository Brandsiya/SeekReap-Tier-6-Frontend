let currentStep = 1, mode = null, collaborators = [], uploadedFileType = null, uploadedFileName = ;
  let pdfPages = [], currentPdfPage = 0;
  const typeIcons = { audio: '🎵', video: '🎬', image: '🖼️', epub: '📖', pdf: '📄' };

  document.getElementById('workType').addEventListener('change', () => {
    document.getElementById('workTypeIcon').textContent = typeIcons[document.getElementById('workType').value] || '🎵';
  });

  function showStep(step) {
    [1,2,3,4].forEach(i => document.getElementById().classList.add('hidden'));
    document.getElementById().classList.remove('hidden');
    [1,2,3,4].forEach(i => {
      const el = document.getElementById();
      el.classList.remove('active','completed');
      if (i < step) el.classList.add('completed');
      else if (i === step) el.classList.add('active');
    });
    currentStep = step;
  }

  function updateStepUI() {
    const step2Icon = document.getElementById('step2Icon');
    const step3Title = document.getElementById('step3Title');
    const step3HeaderText = document.getElementById('step3HeaderText');
    const step3SubText = document.getElementById('step3SubText');
    
    if (mode === 'solo') {
      step2Icon.textContent = '👤';
      step3Title.textContent = 'Upload Work';
      if (step3HeaderText) step3HeaderText.textContent = 'Upload Work';
      step3SubText.textContent = 'Upload your work for blockchain certification';
    } else {
      step2Icon.textContent = '👥';
      step3Title.textContent = 'Upload & Invite';
      if (step3HeaderText) step3HeaderText.textContent = 'Upload & Invite';
      step3SubText.textContent = 'Upload your work & invite co-owners';
    }
  }

  function simulateUpload(progressId, barId, textId, callback) {
    let progress = 0;
    document.getElementById(progressId).style.display = 'block';
    const interval = setInterval(() => {
      progress += 10;
      document.getElementById(barId).style.width = progress + '%';
      document.getElementById(textId).innerText = progress + '%';
      if (progress >= 100) { clearInterval(interval); setTimeout(callback, 300); }
    }, 150);
  }

  function generatePreview(type, fileName, containerId) {
    const container = document.getElementById(containerId);
    container.classList.remove('hidden');
    container.innerHTML = ;
    const previewContent = document.getElementById();

    if (type === 'audio') {
      previewContent.innerHTML = ;
    } else if (type === 'video') {
      previewContent.innerHTML = ;
    } else if (type === 'image') {
      previewContent.innerHTML = ;
    } else if (type === 'epub') {
      previewContent.innerHTML = ;
    } else if (type === 'pdf') {
      pdfPages = [, , , , ];
      currentPdfPage = 0;
      previewContent.innerHTML = ;
      setTimeout(() => {
        const prev = document.getElementById('pdfPrevBtn');
        const next = document.getElementById('pdfNextBtn');
        const ind = document.getElementById('pdfPageIndicator');
        const content = document.getElementById('pdfPageContent');
        if (next) next.addEventListener('click', () => {
          if (currentPdfPage < pdfPages.length - 1) {
            currentPdfPage++;
            content.innerText = pdfPages[currentPdfPage];
            ind.innerText = ;
            prev.disabled = false;
            if (currentPdfPage === pdfPages.length - 1) next.disabled = true;
          }
        });
        if (prev) prev.addEventListener('click', () => {
          if (currentPdfPage > 0) {
            currentPdfPage--;
            content.innerText = pdfPages[currentPdfPage];
            ind.innerText = ;
            next.disabled = false;
            if (currentPdfPage === 0) prev.disabled = true;
          }
        });
      }, 10);
    }
  }

  function setupFileUpload(areaId, listId, previewId, progressId, barId, textId) {
    const area = document.getElementById(areaId);
    area.addEventListener('click', () => {
      const workType = document.getElementById('workType').value;
      const extMap = { audio:'mp3', video:'mp4', image:'jpg', epub:'epub', pdf:'pdf' };
      const fileExt = prompt(Enter file name to simulate upload:, );
      if (fileExt) {
        uploadedFileName = fileExt;
        uploadedFileType = workType;
        simulateUpload(progressId, barId, textId, () => {
          const icon = typeIcons[workType] || '📄';
          const list = document.getElementById(listId);
          if (list) list.innerHTML = ;
          area.classList.add('uploaded');
          area.innerHTML = ;
          generatePreview(workType, fileExt, previewId);
        });
      }
    });
  }

  function addCoowner(email, split) {
    collaborators.push({ id: Date.now(), email, split });
    renderCollaborators();
    updateSplitSummary();
  }

  function sendInvite(email) {
    alert();
  }

  function renderCollaborators() {
    const container = document.getElementById('collaboratorList');
    container.querySelectorAll('.collaborator-item:not(:first-child)').forEach(el => el.remove());
    collaborators.forEach(c => {
      const div = document.createElement('div');
      div.className = 'collaborator-item';
      div.innerHTML = ;
      container.appendChild(div);
    });
    
    document.querySelectorAll('.split-slider-input').forEach(s => s.addEventListener('input', (e) => {
      const id = parseInt(e.target.dataset.id);
      const c = collaborators.find(c => c.id === id);
      if (c) {
        c.split = parseInt(e.target.value);
        const span = document.querySelector();
        if (span) span.innerText = c.split + '%';
        updateSplitSummary();
      }
    }));
    
    document.querySelectorAll('.invite-coowner').forEach(b => b.addEventListener('click', (e) => {
      const email = e.target.dataset.email;
      sendInvite(email);
    }));
    
    document.querySelectorAll('.remove-coowner').forEach(b => b.addEventListener('click', (e) => {
      collaborators = collaborators.filter(c => c.id !== parseInt(e.target.dataset.id));
      renderCollaborators();
      updateSplitSummary();
    }));
  }

  function updateSplitSummary() {
    const totalCollab = collaborators.reduce((s, c) => s + c.split, 0);
    const primarySplit = 100 - totalCollab;
    const inp = document.getElementById('primarySplit');
    const pct = document.getElementById('primaryPercent');
    if (inp) inp.value = primarySplit;
    if (pct) pct.innerText = primarySplit + '%';
    const warning = document.getElementById('splitWarning');
    if (warning) warning.innerText = primarySplit < 0 ? '⚠ Total exceeds 100%' : '';
    let html = ;
    collaborators.forEach(c => {
      html += ;
    });
    const sv = document.getElementById('splitVisual');
    if (sv) sv.innerHTML = html;
  }

  // Event Listeners
  document.getElementById('nextToTypeBtn').addEventListener('click', () => {
    showStep(2);
  });
  document.getElementById('backToDetailsBtn').addEventListener('click', () => showStep(1));
  document.getElementById('backToWorkTypeBtn').addEventListener('click', () => showStep(2));

  document.getElementById('soloModeBtn').addEventListener('click', () => {
    mode = 'solo';
    document.getElementById('soloModeBtn').classList.add('active');
    document.getElementById('collabModeBtn').classList.remove('active');
    updateStepUI();
  });

  document.getElementById('collabModeBtn').addEventListener('click', () => {
    mode = 'collab';
    document.getElementById('collabModeBtn').classList.add('active');
    document.getElementById('soloModeBtn').classList.remove('active');
    updateStepUI();
  });

  document.getElementById('nextToWorkBtn').addEventListener('click', () => {
    showStep(3);
    document.getElementById('soloContent').classList.toggle('hidden', mode !== 'solo');
    document.getElementById('collabContent').classList.toggle('hidden', mode !== 'collab');
  });

  document.getElementById('addCollaboratorBtn').addEventListener('click', () => {
    const email = prompt('Enter co-owner email address:');
    if (email) {
      const maxSplit = 100 - collaborators.reduce((s, c) => s + c.split, 0);
      const split = parseInt(prompt(, Math.floor(maxSplit / 2)));
      else alert('Invalid split percentage.');
    }
  });

  document.getElementById('finalizeBtn').addEventListener('click', () => {
    const title = document.getElementById('workTitle').value;
    const workTypeEl = document.getElementById('workType');
    const workTypeText = workTypeEl.options[workTypeEl.selectedIndex].text.trim();

    if (mode === 'solo') {
      document.getElementById('certificateDetails').innerHTML = ;
      showStep(4);
    } else {
      if (collaborators.length === 0) { alert('Please add at least one co-owner.'); return; }
      const inviteList = document.getElementById('inviteList');
      if (inviteList) inviteList.innerHTML = collaborators.map(c => ).join('');
      const shareLink = document.getElementById('shareLink');
      if (shareLink) shareLink.value = ;
      document.getElementById('inviteModal').classList.add('active');
    }
  });

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('inviteModal').classList.remove('active');
    const title = document.getElementById('workTitle').value;
    const workTypeEl = document.getElementById('workType');
    const workTypeText = workTypeEl.options[workTypeEl.selectedIndex].text.trim();
    const primarySplit = 100 - collaborators.reduce((s, c) => s + c.split, 0);

    const ownerRows =  +
      collaborators.map(c => ).join('');

    document.getElementById('certificateDetails').innerHTML = ;
    showStep(4);
  });

  document.getElementById('downloadCertBtn').addEventListener('click', () => alert('✓ Certificate downloaded. Your blockchain proof of ownership has been saved.'));
  function copyLink() { const link = document.getElementById('shareLink'); if (link) { link.select(); document.execCommand('copy'); alert('Invite link copied!'); } }

  setupFileUpload('soloUploadArea', 'soloFileList', 'soloPreview', 'soloProgress', 'soloProgressBar', 'soloProgressText');
  setupFileUpload('primaryUploadArea', 'primaryFileList', 'primaryPreview', 'primaryProgress', 'primaryProgressBar', 'primaryProgressText');
  
  updateStepUI();
