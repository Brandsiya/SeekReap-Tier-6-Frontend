// ─── STATE ──────────────────────────────────────────────────────────────
    let currentStep = 1;
    let totalSteps = 5;
    let uploadedFiles = { cover: null, profile: null };
    let coverDataURL = null;
    let profileDataURL = null;
    let userRoles = [];
    let socialLinks = [];
    let itemCounter = 0;

    // ─── NAVIGATION ──────────────────────────────────────────────────────────
    function goToStep(step) {
      if (step < 1 || step > totalSteps) return;
      
      if (step === 5 && currentStep === 4) {
        updateSummary();
      }

      currentStep = step;
      
      document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.toggle('active', index + 1 === step);
      });

      document.querySelectorAll('.progress-step').forEach((el, index) => {
        const stepNum = index + 1;
        el.classList.remove('active', 'completed');
        if (stepNum === step) el.classList.add('active');
        else if (stepNum < step) el.classList.add('completed');
      });

      const progress = ((step - 1) / (totalSteps - 1)) * 100;
      document.getElementById('progressFill').style.width = progress + '%';

      clearMsg();
      document.querySelector('.profile-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ─── FULL NAME GENERATION ─────────────────────────────────────────────
    function updateFullName() {
      const firstName = document.getElementById('firstName').value.trim();
      const middleName = document.getElementById('middleName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      
      let fullName = '';
      if (firstName) fullName += firstName;
      if (middleName) fullName += (fullName ? ' ' : '') + middleName;
      if (lastName) fullName += (fullName ? ' ' : '') + lastName;
      
      const display = document.getElementById('fullNameDisplay');
      if (fullName) {
        display.textContent = fullName;
        display.className = 'name';
      } else {
        display.textContent = '—';
        display.className = 'name empty';
      }
    }

    // ─── SLUG HANDLING ──────────────────────────────────────────────────────
    function updateSlug() {
      const displayName = document.getElementById('displayName').value.trim();
      const slugInput = document.getElementById('artisticSlug');
      if (!slugInput.dataset.userEdited) {
        const slug = displayName.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        slugInput.value = slug;
        document.getElementById('slugPreview').textContent = slug || 'username';
      }
    }

    function validateSlug() {
      const slug = document.getElementById('artisticSlug').value.trim();
      document.getElementById('artisticSlug').dataset.userEdited = 'true';
      const preview = document.getElementById('slugPreview');
      preview.textContent = slug || 'username';
      if (slug && !/^[a-z0-9-]+$/.test(slug)) {
        preview.style.color = 'var(--error)';
        preview.style.opacity = '1';
      } else {
        preview.style.color = 'var(--white-dim)';
        preview.style.opacity = '0.5';
      }
    }

    // ─── USER ROLES ─────────────────────────────────────────────────────────
    function handleRoleInput(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addRoleField();
      }
    }

    function addRoleField() {
      const input = document.getElementById('roleInput');
      const role = input.value.trim();
      if (role && !userRoles.includes(role)) {
        userRoles.push(role);
        renderRoles();
        input.value = '';
      }
    }

    function removeLastRole() {
      if (userRoles.length > 0) {
        userRoles.pop();
        renderRoles();
      }
    }

    function removeRole(role) {
      userRoles = userRoles.filter(r => r !== role);
      renderRoles();
    }

    function renderRoles() {
      const container = document.getElementById('rolesTagsList');
      container.innerHTML = userRoles.map(role => `
        <span class="tag">
          ${escapeHtml(role)}
          <button class="remove-tag" onclick="removeRole('${escapeHtml(role)}')">
            <i class="fas fa-times"></i>
          </button>
        </span>
      `).join('');
    }

    // ─── EMPLOYMENT ─────────────────────────────────────────────────────────
    function addEmployment() {
      const list = document.getElementById('employmentList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Employment #${id}</span>
            <div class="item-subtitle">Fill in your work experience</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('employmentList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Organization Name</span>
            <input type="text" placeholder="e.g. Nova Studios">
          </div>
          <div class="field-group">
            <span class="field-label">Organization Type</span>
            <select>
              <option value="">Select type</option>
              <option value="production_house">Production House</option>
              <option value="record_label">Record Label</option>
              <option value="educational">Educational</option>
              <option value="publishing">Publishing</option>
              <option value="management">Management</option>
              <option value="studio">Studio</option>
              <option value="freelance">Freelance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Relationship Type</span>
            <select>
              <option value="">Select relationship</option>
              <option value="founder">Founder</option>
              <option value="co_founder">Co-Founder</option>
              <option value="employee">Employee</option>
              <option value="freelancer">Freelancer</option>
              <option value="contractor">Contractor</option>
              <option value="consultant">Consultant</option>
              <option value="board_member">Board Member</option>
              <option value="advisor">Advisor</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Job Title</span>
            <input type="text" placeholder="e.g. Creative Director">
          </div>
          <div class="field-group">
            <span class="field-label">Employment Type</span>
            <select>
              <option value="">Select type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Start Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">End Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Currently Employed</span>
            <select>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="field-group full-width">
            <span class="field-label">Description</span>
            <textarea placeholder="Describe your role and responsibilities..."></textarea>
          </div>
          <div class="field-group">
            <span class="field-label">Website</span>
            <input type="url" placeholder="https://example.com">
          </div>
          <div class="field-group">
            <span class="field-label">Logo URL</span>
            <input type="url" placeholder="https://example.com/logo.png">
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── EDUCATION ──────────────────────────────────────────────────────────
    function addEducation() {
      const list = document.getElementById('educationList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Education #${id}</span>
            <div class="item-subtitle">Fill in your educational background</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('educationList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Institution Name</span>
            <input type="text" placeholder="e.g. Cape Town Music Institute">
          </div>
          <div class="field-group">
            <span class="field-label">Institution Type</span>
            <select>
              <option value="">Select type</option>
              <option value="university">University</option>
              <option value="college">College</option>
              <option value="conservatory">Conservatory</option>
              <option value="online">Online</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Qualification</span>
            <input type="text" placeholder="e.g. Bachelor of Music">
          </div>
          <div class="field-group">
            <span class="field-label">Field of Study</span>
            <input type="text" placeholder="e.g. Music Production">
          </div>
          <div class="field-group">
            <span class="field-label">Specialization</span>
            <input type="text" placeholder="e.g. Electronic Music">
          </div>
          <div class="field-group">
            <span class="field-label">Start Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">End Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Currently Studying</span>
            <select>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Academic Achievement/Grade</span>
            <input type="text" placeholder="e.g. Graduated with Honors">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Description</span>
            <textarea placeholder="Describe your studies and achievements..."></textarea>
          </div>
          <div class="field-group full-width">
            <span class="field-label">Certificate URL</span>
            <input type="url" placeholder="https://example.com/certificate.pdf">
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── SKILLS ─────────────────────────────────────────────────────────────
    function addSkill() {
      const list = document.getElementById('skillsList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Skill #${id}</span>
            <div class="item-subtitle">Add your professional skills</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('skillsList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Skill Name</span>
            <input type="text" placeholder="e.g. Music Production">
          </div>
          <div class="field-group">
            <span class="field-label">Proficiency Level</span>
            <select>
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Years of Experience</span>
            <input type="number" placeholder="e.g. 5" min="0" step="0.5">
          </div>
          <div class="field-group">
            <span class="field-label">Skill Provider/Institution</span>
            <input type="text" placeholder="e.g. Berklee Online">
          </div>
          <div class="field-group">
            <span class="field-label">Start Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">End Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Currently Attending</span>
            <select>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Field of Skill</span>
            <input type="text" placeholder="e.g. Music, Audio Engineering">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Certificate URL</span>
            <input type="url" placeholder="https://example.com/certificate.pdf">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Description</span>
            <textarea placeholder="Describe your skill and how you've used it..."></textarea>
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── PUBLICATIONS ──────────────────────────────────────────────────────
    function addPublication() {
      const list = document.getElementById('publicationsList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Publication #${id}</span>
            <div class="item-subtitle">Add your publications and press mentions</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('publicationsList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Publication Title</span>
            <input type="text" placeholder="e.g. Metro FM Music Awards 2024">
          </div>
          <div class="field-group">
            <span class="field-label">Publication Type</span>
            <select>
              <option value="">Select type</option>
              <option value="article">Article</option>
              <option value="news">News</option>
              <option value="interview">Interview</option>
              <option value="review">Review</option>
              <option value="feature">Feature</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Publication Name</span>
            <input type="text" placeholder="e.g. Metro FM">
          </div>
          <div class="field-group">
            <span class="field-label">Publication Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Publication Identifier</span>
            <input type="text" placeholder="e.g. DOI, ISBN, or ID">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Publication Description</span>
            <textarea placeholder="Describe the publication and its significance..."></textarea>
          </div>
          <div class="field-group">
            <span class="field-label">Publication URL</span>
            <input type="url" placeholder="https://example.com/article">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Additional Details</span>
            <textarea placeholder="Any additional information about the publication..."></textarea>
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── ACHIEVEMENTS ──────────────────────────────────────────────────────
    function addAchievement() {
      const list = document.getElementById('achievementsList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Achievement #${id}</span>
            <div class="item-subtitle">Add your awards and recognitions</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('achievementsList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Achievement Category</span>
            <select>
              <option value="">Select category</option>
              <option value="award">Award</option>
              <option value="recognition">Recognition</option>
              <option value="certification">Certification</option>
              <option value="publication">Publication</option>
              <option value="performance">Performance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Achievement Title</span>
            <input type="text" placeholder="e.g. Best Electronic Album">
          </div>
          <div class="field-group">
            <span class="field-label">Achievement Subtitle</span>
            <input type="text" placeholder="e.g. South African Music Awards">
          </div>
          <div class="field-group">
            <span class="field-label">Issuer</span>
            <input type="text" placeholder="e.g. SAMAs">
          </div>
          <div class="field-group full-width">
            <span class="field-label">Description</span>
            <textarea placeholder="Describe the achievement and its significance..."></textarea>
          </div>
          <div class="field-group">
            <span class="field-label">Achievement Date</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Achievement Level</span>
            <select>
              <option value="">Select level</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Publication URL</span>
            <input type="url" placeholder="https://example.com/achievement">
          </div>
          <div class="field-group">
            <span class="field-label">City</span>
            <input type="text" placeholder="e.g. Cape Town">
          </div>
          <div class="field-group">
            <span class="field-label">Country Code</span>
            <input type="text" placeholder="e.g. ZA" maxlength="2" style="text-transform:uppercase;">
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── AFFILIATIONS ──────────────────────────────────────────────────────
    function addAffiliation() {
      const list = document.getElementById('affiliationsList');
      const id = ++itemCounter;
      const item = document.createElement('div');
      item.className = 'professional-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="item-header">
          <div>
            <span class="item-title">Affiliation #${id}</span>
            <div class="item-subtitle">Add professional affiliations and creative identifications</div>
          </div>
          <button class="item-remove" onclick="removeProfessionalItem('affiliationsList', this)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="item-fields">
          <div class="field-group">
            <span class="field-label">Identification Type</span>
            <select>
              <option value="">Select type</option>
              <option value="ISNI">ISNI</option>
              <option value="ORCID">ORCID</option>
              <option value="IPI">IPI</option>
              <option value="ISRC">ISRC</option>
              <option value="ISWC">ISWC</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Identification Number</span>
            <input type="text" placeholder="e.g. 0000-0001-2345-6789">
          </div>
          <div class="field-group">
            <span class="field-label">Status</span>
            <select>
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div class="field-group">
            <span class="field-label">Issuing Authority</span>
            <input type="text" placeholder="e.g. ISNI International">
          </div>
          <div class="field-group">
            <span class="field-label">Issued At</span>
            <input type="date">
          </div>
          <div class="field-group">
            <span class="field-label">Expires At</span>
            <input type="date">
          </div>
        </div>
      `;
      list.appendChild(item);
      updateSectionCounts();
    }

    // ─── REMOVE PROFESSIONAL ITEM ──────────────────────────────────────────
    function removeProfessionalItem(listId, button) {
      const item = button.closest('.professional-item');
      if (item) {
        item.remove();
        updateSectionCounts();
        updateSummary();
      }
    }

    // ─── UPDATE SECTION COUNTS ─────────────────────────────────────────────
    function updateSectionCounts() {
      const employmentCount = document.getElementById('employmentList').children.length;
      const educationCount = document.getElementById('educationList').children.length;
      const skillsCount = document.getElementById('skillsList').children.length;
      const publicationsCount = document.getElementById('publicationsList').children.length;
      const achievementsCount = document.getElementById('achievementsList').children.length;
      const affiliationsCount = document.getElementById('affiliationsList').children.length;

      document.getElementById('employmentCount').textContent = `${employmentCount} item${employmentCount !== 1 ? 's' : ''}`;
      document.getElementById('educationCount').textContent = `${educationCount} item${educationCount !== 1 ? 's' : ''}`;
      document.getElementById('skillsCount').textContent = `${skillsCount} item${skillsCount !== 1 ? 's' : ''}`;
      document.getElementById('publicationsCount').textContent = `${publicationsCount} item${publicationsCount !== 1 ? 's' : ''}`;
      document.getElementById('achievementsCount').textContent = `${achievementsCount} item${achievementsCount !== 1 ? 's' : ''}`;
      document.getElementById('affiliationsCount').textContent = `${affiliationsCount} item${affiliationsCount !== 1 ? 's' : ''}`;
    }

    // ─── SOCIAL LINKS ──────────────────────────────────────────────────────
    function addSocial() {
      const platform = document.getElementById('socialPlatform').value;
      const handle = document.getElementById('socialHandle').value.trim();
      if (platform && handle) {
        socialLinks.push({ platform, handle });
        renderSocials();
        document.getElementById('socialHandle').value = '';
        updateSummary();
      }
    }

    function removeLastSocial() {
      if (socialLinks.length > 0) {
        socialLinks.pop();
        renderSocials();
        updateSummary();
      }
    }

    function removeSocial(index) {
      socialLinks.splice(index, 1);
      renderSocials();
      updateSummary();
    }

    function renderSocials() {
      const container = document.getElementById('socialTagsList');
      container.innerHTML = socialLinks.map((link, index) => `
        <span class="social-tag">
          <span class="social-platform">${escapeHtml(link.platform)}</span>
          <span class="social-handle">${escapeHtml(link.handle)}</span>
          <button class="remove-tag" onclick="removeSocial(${index})">
            <i class="fas fa-times"></i>
          </button>
        </span>
      `).join('');
    }

    // ─── CHARACTER COUNTER ──────────────────────────────────────────────────
    function updateCharCount() {
      const textarea = document.getElementById('biography');
      const count = textarea.value.length;
      const display = document.getElementById('charCount');
      display.textContent = count;
      if (count > 1200) {
        display.classList.add('over-limit');
      } else {
        display.classList.remove('over-limit');
      }
    }

    // ─── FILE UPLOAD ──────────────────────────────────────────────────────
    function handleFileUpload(event, type) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showMsg('Please upload an image file.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showMsg('File size must be less than 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const dataURL = e.target.result;
        if (type === 'cover') {
          coverDataURL = dataURL;
          uploadedFiles.cover = file;
          updatePhotoBox('coverUploadBox', dataURL, 'cover');
        } else {
          profileDataURL = dataURL;
          uploadedFiles.profile = file;
          updatePhotoBox('profileUploadBox', dataURL, 'profile');
        }
        showMsg(`${type === 'cover' ? 'Cover' : 'Profile'} photo uploaded successfully!`, 'success');
        clearMsgAfter(2000);
      };
      reader.readAsDataURL(file);
    }

    function updatePhotoBox(boxId, dataURL, type) {
      const box = document.getElementById(boxId);
      box.classList.add('has-image');
      const oldPreview = box.querySelector('.upload-preview');
      if (oldPreview) oldPreview.remove();
      const oldOverlay = box.querySelector('.upload-overlay');
      if (oldOverlay) oldOverlay.remove();

      const img = document.createElement('img');
      img.src = dataURL;
      img.className = 'upload-preview';
      img.alt = `${type} photo`;
      box.appendChild(img);

      const overlay = document.createElement('div');
      overlay.className = 'upload-overlay';
      overlay.innerHTML = `
        <button onclick="event.stopPropagation(); removePhoto('${type}')">
          <i class="fas fa-trash"></i> Remove
        </button>
      `;
      box.appendChild(overlay);

      box.addEventListener('mouseenter', function() {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
      });
      box.addEventListener('mouseleave', function() {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
      });
    }

    function removePhoto(type) {
      if (type === 'cover') {
        coverDataURL = null;
        uploadedFiles.cover = null;
        resetPhotoBox('coverUploadBox');
      } else {
        profileDataURL = null;
        uploadedFiles.profile = null;
        resetPhotoBox('profileUploadBox');
      }
      showMsg(`${type === 'cover' ? 'Cover' : 'Profile'} photo removed.`, 'info');
      clearMsgAfter(1500);
    }

    function resetPhotoBox(boxId) {
      const box = document.getElementById(boxId);
      box.classList.remove('has-image');
      const preview = box.querySelector('.upload-preview');
      if (preview) preview.remove();
      const overlay = box.querySelector('.upload-overlay');
      if (overlay) overlay.remove();
      const input = box.querySelector('.file-input');
      if (input) input.value = '';
    }

    // ─── SUMMARY ────────────────────────────────────────────────────────────
    function updateSummary() {
      // Personal info
      const firstName = document.getElementById('firstName').value.trim() || '—';
      const middleName = document.getElementById('middleName').value.trim();
      const lastName = document.getElementById('lastName').value.trim() || '—';
      const displayName = document.getElementById('displayName').value.trim() || '—';
      const slug = document.getElementById('artisticSlug').value.trim() || '—';
      const title = document.getElementById('title').value || '';
      const gender = document.getElementById('gender').value || '';
      const dob = document.getElementById('dateOfBirth').value || '';
      const userType = document.getElementById('userType').value || '—';
      const bio = document.getElementById('biography').value.trim() || '—';
      
      const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
      
      document.getElementById('summaryDisplayName').textContent = displayName;
      document.getElementById('summarySlug').textContent = slug;
      document.getElementById('summaryFullName').textContent = fullName;
      document.getElementById('summaryUserType').textContent = userType;
      document.getElementById('summaryBio').textContent = bio;

      // Roles
      const rolesContainer = document.getElementById('summaryRoles');
      if (userRoles.length > 0) {
        rolesContainer.innerHTML = userRoles.map(role => 
          `<span style="background:var(--black-4);padding:2px 10px;border-radius:12px;font-size:0.75rem;border:1px solid var(--border);">${escapeHtml(role)}</span>`
        ).join('');
      } else {
        rolesContainer.innerHTML = '<span style="color: var(--white-dim); font-size: 0.8rem;">—</span>';
      }

      // Details
      let details = [];
      if (title) details.push(title);
      if (gender) details.push(gender);
      if (dob) {
        const date = new Date(dob);
        details.push(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      }
      document.getElementById('summaryDetails').textContent = details.join(' • ') || '—';

      // Professional Summary
      const empCount = document.getElementById('employmentList').children.length;
      const eduCount = document.getElementById('educationList').children.length;
      const skillCount = document.getElementById('skillsList').children.length;
      const pubCount = document.getElementById('publicationsList').children.length;
      const achCount = document.getElementById('achievementsList').children.length;
      const affCount = document.getElementById('affiliationsList').children.length;

      let profParts = [];
      if (empCount > 0) profParts.push(`${empCount} employment${empCount > 1 ? 's' : ''}`);
      if (eduCount > 0) profParts.push(`${eduCount} education${eduCount > 1 ? '' : ''}`);
      if (skillCount > 0) profParts.push(`${skillCount} skill${skillCount > 1 ? 's' : ''}`);
      if (pubCount > 0) profParts.push(`${pubCount} publication${pubCount > 1 ? 's' : ''}`);
      if (achCount > 0) profParts.push(`${achCount} achievement${achCount > 1 ? 's' : ''}`);
      if (affCount > 0) profParts.push(`${affCount} affiliation${affCount > 1 ? 's' : ''}`);
      
      document.getElementById('summaryProfessional').textContent = profParts.length > 0 ? profParts.join(' • ') : '—';

      // Address
      const physical1 = document.getElementById('physicalAddress1').value.trim();
      const physical2 = document.getElementById('physicalAddress2').value.trim();
      const postal1 = document.getElementById('postalAddress1').value.trim();
      const postal2 = document.getElementById('postalAddress2').value.trim();
      const city = document.getElementById('city').value.trim();
      const province = document.getElementById('province').value.trim();
      const country = document.getElementById('countryOfResidence').value.trim();
      const cityCode = document.getElementById('cityCode').value.trim();
      const provinceCode = document.getElementById('provinceCode').value.trim();
      const countryCode = document.getElementById('countryCode').value.trim();

      let addressParts = [];
      if (physical1) addressParts.push(`P: ${physical1}`);
      if (physical2) addressParts.push(physical2);
      if (postal1) addressParts.push(`M: ${postal1}`);
      if (postal2) addressParts.push(postal2);
      document.getElementById('summaryAddress').textContent = addressParts.length > 0 ? addressParts.join(' • ') : '—';

      let locationParts = [];
      if (city) locationParts.push(`City: ${city}`);
      if (province) locationParts.push(`Province: ${province}`);
      if (country) locationParts.push(`Country: ${country}`);
      let codes = [];
      if (cityCode) codes.push(`Birth City: ${cityCode}`);
      if (provinceCode) codes.push(`Birth Province: ${provinceCode}`);
      if (countryCode) codes.push(`Nationality: ${countryCode}`);
      if (codes.length > 0) locationParts.push(`(${codes.join(' ')})`);
      document.getElementById('summaryLocation').textContent = locationParts.length > 0 ? locationParts.join(' • ') : '—';

      // Communication
      const primaryEmail = document.getElementById('primaryEmail').value.trim();
      const secondaryEmail = document.getElementById('secondaryEmail').value.trim();
      const primaryPhone = document.getElementById('primaryPhone').value.trim();
      const secondaryPhone = document.getElementById('secondaryPhone').value.trim();

      let emails = [];
      if (primaryEmail) emails.push(`Primary: ${primaryEmail}`);
      if (secondaryEmail) emails.push(`Secondary: ${secondaryEmail}`);
      document.getElementById('summaryEmails').textContent = emails.length > 0 ? emails.join(' • ') : '—';

      let phones = [];
      if (primaryPhone) phones.push(`Primary: ${primaryPhone}`);
      if (secondaryPhone) phones.push(`Secondary: ${secondaryPhone}`);
      document.getElementById('summaryPhones').textContent = phones.length > 0 ? phones.join(' • ') : '—';

      // Social
      const socialContainer = document.getElementById('summarySocial');
      if (socialLinks.length > 0) {
        socialContainer.innerHTML = socialLinks.map(link => 
          `<span style="background:var(--black-4);padding:2px 10px;border-radius:12px;font-size:0.75rem;border:1px solid var(--border);">${escapeHtml(link.platform)}: ${escapeHtml(link.handle)}</span>`
        ).join('');
      } else {
        socialContainer.innerHTML = '<span style="color: var(--white-dim); font-size: 0.8rem;">—</span>';
      }

      // Photos
      const profileImg = document.getElementById('summaryProfileImg');
      if (profileDataURL) {
        profileImg.src = profileDataURL;
        profileImg.style.display = 'block';
      } else {
        profileImg.style.display = 'none';
      }

      const coverImg = document.getElementById('summaryCoverImg');
      if (coverDataURL) {
        coverImg.src = coverDataURL;
        coverImg.style.display = 'block';
      } else {
        coverImg.style.display = 'none';
      }
    }

    // ─── COMPLETE PROFILE ─────────────────────────────────────────────────
    function completeProfile() {
      setBusy('completeBtn', true);
      
      setTimeout(() => {
        // Collect all professional items data
        function collectItems(listId) {
          const list = document.getElementById(listId);
          const items = [];
          list.querySelectorAll('.professional-item').forEach(item => {
            const fields = {};
            item.querySelectorAll('.field-group').forEach(group => {
              const label = group.querySelector('.field-label')?.textContent || '';
              const input = group.querySelector('input, select, textarea');
              if (input) {
                fields[label] = input.value;
              }
            });
            items.push(fields);
          });
          return items.length > 0 ? items : null;
        }

        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;

        const profileData = {
          // Personal
          first_legal_name: firstName || null,
          middle_legal_name: middleName || null,
          last_legal_name: lastName || null,
          legal_full_name: fullName || null,
          title: document.getElementById('title').value || null,
          gender: document.getElementById('gender').value || null,
          date_of_birth: document.getElementById('dateOfBirth').value || null,
          display_name: document.getElementById('displayName').value.trim() || null,
          artistic_slug: document.getElementById('artisticSlug').value.trim() || null,
          user_type: document.getElementById('userType').value || null,
          user_roles: userRoles.length > 0 ? userRoles : null,
          biography: document.getElementById('biography').value.trim() || null,
          
          // Professional
          employment_history: collectItems('employmentList'),
          education: collectItems('educationList'),
          skills: collectItems('skillsList'),
          publications: collectItems('publicationsList'),
          achievements: collectItems('achievementsList'),
          affiliations: collectItems('affiliationsList'),
          
          // Residential
          physical_address_line1: document.getElementById('physicalAddress1').value.trim() || null,
          physical_address_line2: document.getElementById('physicalAddress2').value.trim() || null,
          postal_address_line1: document.getElementById('postalAddress1').value.trim() || null,
          postal_address_line2: document.getElementById('postalAddress2').value.trim() || null,
          city_of_residence: document.getElementById('city').value.trim() || null,
          province_of_residence: document.getElementById('province').value.trim() || null,
          country_of_residence: document.getElementById('countryOfResidence').value.trim() || null,
          city_of_birth: document.getElementById('cityCode').value.trim() || null,
          province_of_birth: document.getElementById('provinceCode').value.trim() || null,
          nationality: document.getElementById('countryCode').value.trim() || null,
          
          // Communication
          recovery_email: document.getElementById('primaryEmail').value.trim() || null,
          secondary_email: document.getElementById('secondaryEmail').value.trim() || null,
          primary_phone: document.getElementById('primaryPhone').value.trim() || null,
          secondary_phone: document.getElementById('secondaryPhone').value.trim() || null,
          
          // Social
          social_links: socialLinks.length > 0 ? socialLinks : null,
          
          // Photos
          banner_photo_url: coverDataURL || null,
          profile_photo_url: profileDataURL || null,
          
          // Status
          onboarding_completed: true,
          onboarding_step: 5,
          profile_completion_percentage: calculateCompletion()
        };

        console.log('Profile Data:', profileData);
        
        showMsg('Profile created successfully! Redirecting...', 'success');
        setBusy('completeBtn', false);
        
        setTimeout(() => {
          window.location.href = '/profile.html';
        }, 1500);
      }, 1500);
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────
    function calculateCompletion() {
      let filled = 0;
      const fields = [
        document.getElementById('firstName').value.trim(),
        document.getElementById('lastName').value.trim(),
        document.getElementById('displayName').value.trim(),
        document.getElementById('artisticSlug').value.trim(),
        document.getElementById('userType').value,
        document.getElementById('biography').value.trim(),
        document.getElementById('physicalAddress1').value.trim(),
        document.getElementById('city').value.trim(),
        document.getElementById('countryOfResidence').value.trim(),
        document.getElementById('primaryEmail').value.trim(),
        document.getElementById('primaryPhone').value.trim()
      ];
      
      fields.forEach(f => { if (f) filled++; });
      if (userRoles.length > 0) filled++;
      if (socialLinks.length > 0) filled++;
      if (document.getElementById('employmentList').children.length > 0) filled++;
      if (document.getElementById('educationList').children.length > 0) filled++;
      if (document.getElementById('skillsList').children.length > 0) filled++;
      if (document.getElementById('publicationsList').children.length > 0) filled++;
      if (document.getElementById('achievementsList').children.length > 0) filled++;
      if (document.getElementById('affiliationsList').children.length > 0) filled++;
      if (profileDataURL || coverDataURL) filled++;
      
      return Math.min(Math.round((filled / 20) * 100), 100);
    }

    function showMsg(text, type = 'error') {
      const el = document.getElementById('message-container');
      if (!el) return;
      const icon = { error:'exclamation-circle', success:'check-circle', info:'info-circle' }[type] || 'info-circle';
      el.innerHTML = `<div class="msg msg-${type}"><i class="fas fa-${icon}"></i><span>${escapeHtml(text)}</span></div>`;
    }

    function clearMsg() {
      const el = document.getElementById('message-container');
      if (el) el.innerHTML = '';
    }

    function clearMsgAfter(ms) {
      setTimeout(clearMsg, ms);
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function setBusy(id, busy) {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.disabled = busy;
      btn.style.opacity = busy ? '0.6' : '1';
      btn.style.cursor = busy ? 'not-allowed' : '';
    }

    // ─── KEYBOARD SHORTCUTS ────────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const activeStep = document.querySelector('.step.active');
        if (activeStep && activeStep.id !== 'step2' && activeStep.id !== 'step3' && activeStep.id !== 'step4') {
          const nextBtn = activeStep.querySelector('.btn-primary');
          if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
          }
        }
      }
    });

    // ─── INIT ────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('progressFill').style.width = '0%';
      
      // Drag and drop
      document.querySelectorAll('.photo-upload-box').forEach(box => {
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          box.classList.add('dragover');
        });
        box.addEventListener('dragleave', () => {
          box.classList.remove('dragover');
        });
        box.addEventListener('drop', (e) => {
          e.preventDefault();
          box.classList.remove('dragover');
          const file = e.dataTransfer.files[0];
          if (file) {
            const type = box.id === 'coverUploadBox' ? 'cover' : 'profile';
            const input = box.querySelector('.file-input');
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            handleFileUpload({ target: { files: [file] } }, type);
          }
        });
      });

      // Slug auto-generation
      document.getElementById('displayName').addEventListener('blur', () => {
        const slugInput = document.getElementById('artisticSlug');
        if (!slugInput.dataset.userEdited) {
          updateSlug();
        }
      });

      // Enter key on role input
      document.getElementById('roleInput').addEventListener('keydown', handleRoleInput);

      // Enter key on social handle
      document.getElementById('socialHandle').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addSocial();
        }
      });

      // Update summary on input changes
      document.querySelectorAll('#step2 input, #step2 select, #step2 textarea, #step3 input, #step3 select, #step4 input, #step4 select').forEach(el => {
        el.addEventListener('input', updateSummary);
        el.addEventListener('change', updateSummary);
      });

      // Initial render
      updateSectionCounts();
    });
