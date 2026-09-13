// ─── STATE ──────────────────────────────────────────────────────────────
    let currentStep = 1;
    let totalSteps = 5;
    let uploadedFiles = { cover: null, profile: null };
    let coverDataURL = null;
    let profileDataURL = null;
    let userRoles = [];
    let socialLinks = [];
    let itemCounter = 0;
  let _completingProfile = false;

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
      const role = input.value;
      if (role && SELF_SERVICE_ROLES.includes(role) && !userRoles.includes(role)) {
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
          ${escapeHtml(ROLE_LABELS[role] || role)}
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
      return item;
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
      return item;
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
      return item;
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
      return item;
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
      return item;
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
      return item;
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

    // ─── API HELPER ─────────────────────────────────────────────────────────
const TIER4_BASE = 'https://seekreap-tier-4-orchestrator-1.onrender.com';
let _pcJwt = null;

async function _getPcJwt() {
  if (_pcJwt) return _pcJwt;
  if (window.supabaseClient) {
    try {
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      if (!error && session) {
        _pcJwt = session.access_token;
        return _pcJwt;
      }
    } catch (e) {
      console.error('[Auth]', e);
    }
  }
  return null;
}

async function profileCompletionApiFetch(path, opts = {}) {
  const jwt = await _getPcJwt();
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };
  if (jwt) headers['Authorization'] = 'Bearer ' + jwt;
  const res = await fetch(TIER4_BASE + path, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || 'HTTP ' + res.status);
  }
  return res.json();
}

function setProfileField(id, value) {
  const el = document.getElementById(id);
  if (!el || value === null || value === undefined) return;
  if (el.tagName === 'SELECT') {
    const exists = Array.from(el.options).some(o => o.value === String(value));
    if (exists) el.value = String(value);
    return;
  }
  el.value = String(value);
}

// ─── USER TYPE REFERENCE ────────────────────────────────────────────────
async function loadUserTypeReference() {
  try {
    const ref = await profileCompletionApiFetch('/api/profile/reference');
    const select = document.getElementById('userType');
    if (!select) return;
    const types = (ref.user_types || []).filter(t => t.is_active !== false);
    types.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.display_name || t.code || t.id;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('[Profile Completion] Failed to load user type reference:', e);
  }
}

// ─── PLATFORM ROLES ─────────────────────────────────────────────────────
const SELF_SERVICE_ROLES = [
  'creator', 'delegate', 'organization', 'member', 'investor',
  'collector', 'buyer', 'supporter', 'publisher', 'distributor'
];

const ROLE_LABELS = {
  creator: 'Creator', delegate: 'Delegate', organization: 'Organization',
  member: 'Member', investor: 'Investor', collector: 'Collector',
  buyer: 'Buyer', supporter: 'Supporter', publisher: 'Publisher',
  distributor: 'Distributor'
};

async function loadUserRoles() {
  const data = await profileCompletionApiFetch('/api/profile/roles');
  const rows = data.roles || [];
  userRoles = [...new Set(
    rows.filter(r => r.active === true && SELF_SERVICE_ROLES.includes(r.role))
        .map(r => r.role)
  )];
  renderRoles();
}

async function saveUserRoles() {
  return profileCompletionApiFetch('/api/profile/roles', {
    method: 'PUT',
    body: JSON.stringify({ roles: userRoles })
  });
}

// ─── PROFESSIONAL PERSISTENCE ──────────────────────────────────────────
const professionalLoadedIds = {
  employment: new Set(), education: new Set(), skills: new Set(),
  publications: new Set(), achievements: new Set(), identifiers: new Set()
};

function professionalFieldValues(item) {
  const values = {};
  item.querySelectorAll('.field-group').forEach(group => {
    const label = group.querySelector('.field-label')?.textContent?.trim();
    if (!label) return;
    const control = group.querySelector('input, select, textarea');
    if (!control) return;
    values[label] = control.value?.trim?.() ?? control.value ?? '';
  });
  return values;
}

function professionalHasMeaningfulValue(values) {
  return Object.values(values).some(v => String(v ?? '').trim() !== '');
}

function yesNoToBoolean(value) {
  if (value === 'yes') return true;
  if (value === 'no') return false;
  return null;
}

function numberOrNull(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function professionalSectionContainer(section) {
  const ids = {
    employment: 'employmentList', education: 'educationList', skills: 'skillsList',
    publications: 'publicationsList', achievements: 'achievementsList', identifiers: 'affiliationsList'
  };
  return document.getElementById(ids[section]);
}

function professionalItemIdsInDom(section) {
  const container = professionalSectionContainer(section);
  if (!container) return new Set();
  return new Set(
    [...container.querySelectorAll('.professional-item[data-persisted-id]')]
      .map(item => item.dataset.persistedId).filter(Boolean)
  );
}

function setProfessionalControl(item, label, value) {
  if (value === undefined || value === null) return;
  const groups = [...item.querySelectorAll('.field-group')];
  for (const group of groups) {
    const groupLabel = group.querySelector('.field-label')?.textContent?.trim();
    if (groupLabel !== label) continue;
    const control = group.querySelector('input, select, textarea');
    if (!control) return;
    control.value = String(value);
    control.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
}

function setProfessionalPersistedId(item, id) {
  if (!item || !id) return;
  item.dataset.persistedId = String(id);
}

function normalizeResumeItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function buildEmploymentPayload(v) {
  return {
    organization_name: v['Organization Name'] || null,
    organization_type: v['Organization Type'] || null,
    relationship_type: v['Relationship Type'] || null,
    job_title: v['Job Title'] || null,
    employment_type: v['Employment Type'] || null,
    start_date: v['Start Date'] || null,
    end_date: v['End Date'] || null,
    is_current: yesNoToBoolean(v['Currently Employed']),
    description: v['Description'] || null,
    website: v['Website'] || null,
    logo_url: v['Logo URL'] || null,
    is_public: true
  };
}

function buildEducationPayload(v) {
  return {
    institution_name: v['Institution Name'] || null,
    institution_type: v['Institution Type'] || null,
    degree: v['Qualification'] || null,
    field_of_study: v['Field of Study'] || null,
    specialization: v['Specialization'] || null,
    start_date: v['Start Date'] || null,
    end_date: v['End Date'] || null,
    currently_studying: yesNoToBoolean(v['Currently Studying']),
    grade: v['Academic Achievement/Grade'] || null,
    description: v['Description'] || null,
    certificate_url: v['Certificate URL'] || null
  };
}

function buildSkillPayload(v) {
  return {
    skill_name: v['Skill Name'] || null,
    proficiency_level: v['Proficiency Level'] || null,
    years_experience: numberOrNull(v['Years of Experience']),
    skill_provider: v['Skill Provider/Institution'] || null,
    skill_field: v['Field of Skill'] || null,
    start_date: v['Start Date'] || null,
    end_date: v['End Date'] || null,
    is_currently_attending: yesNoToBoolean(v['Currently Attending']),
    certificate_url: v['Certificate URL'] || null,
    metadata: { description: v['Description'] || null }
  };
}

function buildPublicationPayload(v) {
  return {
    title: v['Publication Title'] || null,
    publication_type: v['Publication Type'] || null,
    publisher: v['Publication Name'] || null,
    publication_date: v['Publication Date'] || null,
    publication_url: v['Publication URL'] || null,
    description: v['Publication Description'] || null,
    metadata: {
      identifier: v['Publication Identifier'] || null,
      additional_details: v['Additional Details'] || null
    }
  };
}

function buildAchievementPayload(v) {
  return {
    category: v['Achievement Category'] || null,
    title: v['Achievement Title'] || null,
    subtitle: v['Achievement Subtitle'] || null,
    issuer: v['Issuer'] || null,
    description: v['Description'] || null,
    achievement_date: v['Achievement Date'] || null,
    achievement_level: v['Achievement Level'] || null,
    evidence_url: v['Publication URL'] || null,
    city: v['City'] || null,
    country_code: v['Country Code'] ? v['Country Code'].toUpperCase() : null
  };
}

function buildAffiliationPayload(v) {
  return {
    identifier_type: v['Identification Type'] || null,
    identifier_value: v['Identification Number'] || null,
    status: v['Status'] || null,
    issuing_authority: v['Issuing Authority'] || null,
    issued_at: v['Issued At'] || null,
    expires_at: v['Expires At'] || null,
    is_public: true
  };
}

async function persistProfessionalItem(section, item, payload) {
  const existingId = item.dataset.persistedId;
  let result;
  if (existingId) {
    result = await profileCompletionApiFetch(
      `/api/profile/resume/${section}/${encodeURIComponent(existingId)}`,
      { method: 'PATCH', body: JSON.stringify(payload) }
    );
  } else {
    result = await profileCompletionApiFetch(
      `/api/profile/resume/${section}`,
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }
  if (!result?.id) {
    throw new Error(`The ${section} record was saved but no record ID was returned.`);
  }
  setProfessionalPersistedId(item, result.id);
  return result;
}

async function persistProfessionalSection(section, listId, payloadBuilder) {
  const list = document.getElementById(listId);
  if (!list) return [];
  const items = Array.from(list.querySelectorAll('.professional-item'));
  const saved = [];
  for (const item of items) {
    const values = professionalFieldValues(item);
    const existingId = item.dataset.persistedId;
    if (!professionalHasMeaningfulValue(values)) {
      if (existingId) {
        await profileCompletionApiFetch(
          `/api/profile/resume/${section}/${encodeURIComponent(existingId)}`,
          { method: 'DELETE' }
        );
        item.remove();
      }
      continue;
    }
    const payload = payloadBuilder(values);
    const result = await persistProfessionalItem(section, item, payload);
    saved.push(result);
  }
  await reconcileDeletedProfessionalItems(section);
  return saved;
}

async function reconcileDeletedProfessionalItems(section) {
  const loaded = professionalLoadedIds[section];
  if (!loaded) return;
  const current = professionalItemIdsInDom(section);
  for (const id of loaded) {
    if (current.has(id)) continue;
    await profileCompletionApiFetch(
      `/api/profile/resume/${section}/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  }
  loaded.clear();
  for (const id of current) loaded.add(id);
}

async function loadProfessionalSection(section, listId, addFunction, populate) {
  const payload = await profileCompletionApiFetch(`/api/profile/resume/${section}`, { method: 'GET' });
  const items = normalizeResumeItems(payload);
  const container = document.getElementById(listId);
  if (!container) return;
  container.querySelectorAll('.professional-item').forEach(i => i.remove());
  professionalLoadedIds[section].clear();
  for (const record of items) {
    const item = addFunction();
    if (!item) throw new Error(`Unable to create ${section} form card.`);
    setProfessionalPersistedId(item, record.id);
    professionalLoadedIds[section].add(String(record.id));
    populate(item, record);
  }
}

function populateEmployment(item, r) {
  setProfessionalControl(item, 'Organization Name', r.organization_name);
  setProfessionalControl(item, 'Organization Type', r.organization_type);
  setProfessionalControl(item, 'Relationship Type', r.relationship_type);
  setProfessionalControl(item, 'Job Title', r.job_title);
  setProfessionalControl(item, 'Employment Type', r.employment_type);
  setProfessionalControl(item, 'Start Date', r.start_date);
  setProfessionalControl(item, 'End Date', r.end_date);
  setProfessionalControl(item, 'Currently Employed', r.is_current === true ? 'yes' : r.is_current === false ? 'no' : null);
  setProfessionalControl(item, 'Description', r.description);
  setProfessionalControl(item, 'Website', r.website);
  setProfessionalControl(item, 'Logo URL', r.logo_url);
}

function populateEducation(item, r) {
  setProfessionalControl(item, 'Institution Name', r.institution_name);
  setProfessionalControl(item, 'Institution Type', r.institution_type);
  setProfessionalControl(item, 'Qualification', r.degree);
  setProfessionalControl(item, 'Field of Study', r.field_of_study);
  setProfessionalControl(item, 'Specialization', r.specialization);
  setProfessionalControl(item, 'Start Date', r.start_date);
  setProfessionalControl(item, 'End Date', r.end_date);
  setProfessionalControl(item, 'Currently Studying', r.currently_studying === true ? 'yes' : r.currently_studying === false ? 'no' : null);
  setProfessionalControl(item, 'Academic Achievement/Grade', r.grade);
  setProfessionalControl(item, 'Description', r.description);
  setProfessionalControl(item, 'Certificate URL', r.certificate_url);
}

function populateSkill(item, r) {
  setProfessionalControl(item, 'Skill Name', r.skill_name);
  setProfessionalControl(item, 'Proficiency Level', r.proficiency_level);
  setProfessionalControl(item, 'Years of Experience', r.years_experience);
  setProfessionalControl(item, 'Skill Provider/Institution', r.skill_provider);
  setProfessionalControl(item, 'Start Date', r.start_date);
  setProfessionalControl(item, 'End Date', r.end_date);
  setProfessionalControl(item, 'Currently Attending', r.is_currently_attending === true ? 'yes' : r.is_currently_attending === false ? 'no' : null);
  setProfessionalControl(item, 'Field of Skill', r.skill_field);
  setProfessionalControl(item, 'Certificate URL', r.certificate_url);
  setProfessionalControl(item, 'Description', r.metadata?.description);
}

function populatePublication(item, r) {
  setProfessionalControl(item, 'Publication Title', r.title);
  setProfessionalControl(item, 'Publication Type', r.publication_type);
  setProfessionalControl(item, 'Publication Name', r.publisher);
  setProfessionalControl(item, 'Publication Date', r.publication_date);
  setProfessionalControl(item, 'Publication Identifier', r.metadata?.identifier);
  setProfessionalControl(item, 'Publication Description', r.description);
  setProfessionalControl(item, 'Publication URL', r.publication_url);
  setProfessionalControl(item, 'Additional Details', r.metadata?.additional_details);
}

function populateAchievement(item, r) {
  setProfessionalControl(item, 'Achievement Category', r.category);
  setProfessionalControl(item, 'Achievement Title', r.title);
  setProfessionalControl(item, 'Achievement Subtitle', r.subtitle);
  setProfessionalControl(item, 'Issuer', r.issuer);
  setProfessionalControl(item, 'Description', r.description);
  setProfessionalControl(item, 'Achievement Date', r.achievement_date);
  setProfessionalControl(item, 'Achievement Level', r.achievement_level);
  setProfessionalControl(item, 'Publication URL', r.evidence_url);
  setProfessionalControl(item, 'City', r.city);
  setProfessionalControl(item, 'Country Code', r.country_code);
}

function populateAffiliation(item, r) {
  setProfessionalControl(item, 'Identification Type', r.identifier_type);
  setProfessionalControl(item, 'Identification Number', r.identifier_value);
  setProfessionalControl(item, 'Status', r.status);
  setProfessionalControl(item, 'Issuing Authority', r.issuing_authority);
  setProfessionalControl(item, 'Issued At', r.issued_at);
  setProfessionalControl(item, 'Expires At', r.expires_at);
}

async function loadProfessionalSections() {
  const sections = [
    { section: 'employment', listId: 'employmentList', addFunction: addEmployment, populate: populateEmployment },
    { section: 'education', listId: 'educationList', addFunction: addEducation, populate: populateEducation },
    { section: 'skills', listId: 'skillsList', addFunction: addSkill, populate: populateSkill },
    { section: 'publications', listId: 'publicationsList', addFunction: addPublication, populate: populatePublication },
    { section: 'achievements', listId: 'achievementsList', addFunction: addAchievement, populate: populateAchievement },
    { section: 'identifiers', listId: 'affiliationsList', addFunction: addAffiliation, populate: populateAffiliation }
  ];
  for (const config of sections) {
    await loadProfessionalSection(config.section, config.listId, config.addFunction, config.populate);
  }
}

async function saveProfessionalSections() {
  await persistProfessionalSection('employment', 'employmentList', buildEmploymentPayload);
  await persistProfessionalSection('education', 'educationList', buildEducationPayload);
  await persistProfessionalSection('skills', 'skillsList', buildSkillPayload);
  await persistProfessionalSection('publications', 'publicationsList', buildPublicationPayload);
  await persistProfessionalSection('achievements', 'achievementsList', buildAchievementPayload);
  await persistProfessionalSection('identifiers', 'affiliationsList', buildAffiliationPayload);
}

// ─── CORE PROFILE ───────────────────────────────────────────────────────
function buildProfileData() {
  function val(id) {
    const el = document.getElementById(id);
    if (!el) return undefined;
    const v = el.value.trim();
    return v === '' ? null : v;
  }

  const firstName = val('firstName');
  const middleName = val('middleName');
  const lastName = val('lastName');
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ') || null;

  const data = {
    first_legal_name: firstName,
    middle_legal_name: middleName,
    last_legal_name: lastName,
    legal_full_name: fullName,
    title: val('title'),
    gender: val('gender'),
    date_of_birth: val('dateOfBirth'),
    display_name: val('displayName'),
    artistic_slug: val('artisticSlug'),
    biography: val('biography'),
    physical_address_line1: val('physicalAddress1'),
    physical_address_line2: val('physicalAddress2'),
    postal_address_line1: val('postalAddress1'),
    postal_address_line2: val('postalAddress2'),
    city_of_residence: val('city'),
    province_of_residence: val('province'),
    country_of_residence: val('countryOfResidence'),
    city_of_birth: val('cityCode'),
    province_of_birth: val('provinceCode'),
    nationality: val('countryCode'),
    secondary_email: val('secondaryEmail'),
    primary_phone: val('primaryPhone'),
    secondary_phone: val('secondaryPhone')
  };

  // user_type_id is NOT NULL in the database - only send it when a real
  // selection has been made; never send null/empty for this field.
  const userTypeId = document.getElementById('userType')?.value;
  if (userTypeId) {
    data.user_type_id = userTypeId;
  }

  return data;
}

async function saveCoreProfile(profileData) {
  return profileCompletionApiFetch('/api/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(profileData)
  });
}

async function loadExistingProfile() {
  try {
    await loadUserTypeReference();

    const profile = await profileCompletionApiFetch('/api/profile/me');

    if (profile.exists === false) {
      return null;
    }

    setProfileField('firstName', profile.first_legal_name);
    setProfileField('middleName', profile.middle_legal_name);
    setProfileField('lastName', profile.last_legal_name);
    setProfileField('title', profile.title);
    setProfileField('gender', profile.gender);
    setProfileField('dateOfBirth', profile.date_of_birth);
    setProfileField('displayName', profile.display_name);
    setProfileField('artisticSlug', profile.artistic_slug);
    setProfileField('biography', profile.biography);
    setProfileField('physicalAddress1', profile.physical_address_line1);
    setProfileField('physicalAddress2', profile.physical_address_line2);
    setProfileField('postalAddress1', profile.postal_address_line1);
    setProfileField('postalAddress2', profile.postal_address_line2);
    setProfileField('city', profile.city_of_residence);
    setProfileField('province', profile.province_of_residence);
    setProfileField('countryOfResidence', profile.country_of_residence);
    setProfileField('cityCode', profile.city_of_birth);
    setProfileField('provinceCode', profile.province_of_birth);
    setProfileField('countryCode', profile.nationality);
    setProfileField('secondaryEmail', profile.secondary_email);
    setProfileField('primaryPhone', profile.primary_phone);
    setProfileField('secondaryPhone', profile.secondary_phone);

    if (profile.user_type_id) {
      const select = document.getElementById('userType');
      const exists = Array.from(select.options).some(o => o.value === profile.user_type_id);
      if (exists) {
        select.value = profile.user_type_id;
      } else {
        console.warn('[Profile Completion] Stored user_type_id not found in active reference data:', profile.user_type_id);
      }
    }

    try {
      await loadUserRoles();
    } catch (e) {
      console.error('[Profile Completion] Failed to load roles:', e);
    }

    try {
      await loadProfessionalSections();
    } catch (e) {
      console.error('[Profile Completion] Failed to load professional sections:', e);
    }

    updateFullName();
    updateSummary();

    return profile;
  } catch (error) {
    console.error('[Profile Completion] Failed to load profile:', error);
    showMsg(error.message || 'Unable to load your profile. Please refresh and try again.', 'error');
    return null;
  }
}

// ─── COMPLETE PROFILE ─────────────────────────────────────────────────
function completeProfile() {
  if (_completingProfile) return;
  _completingProfile = true;
  setBusy('completeBtn', true);

  (async () => {
    try {
      const profileData = buildProfileData();
      await saveCoreProfile(profileData);

      try {
        await saveProfessionalSections();
      } catch (professionalError) {
        console.error('[Profile Completion] Professional sections could not be saved:', professionalError);
        showMsg('Core profile saved, but some professional records could not be saved. Please try again.', 'error');
        setBusy('completeBtn', false);
        _completingProfile = false;
        return;
      }

      try {
        await saveUserRoles();
      } catch (rolesError) {
        console.error('[Profile Completion] Roles could not be saved:', rolesError);
        showMsg('Profile and professional records saved, but platform roles could not be saved. Please try again.', 'error');
        setBusy('completeBtn', false);
        _completingProfile = false;
        return;
      }

      try {
        await saveCoreProfile({ onboarding_completed: true, onboarding_step: 5 });
      } catch (onboardingError) {
        console.error('[Profile Completion] Onboarding status could not be updated:', onboardingError);
      }

      showMsg('Your profile has been saved successfully.', 'success');
      setBusy('completeBtn', false);

      setTimeout(() => {
        window.location.href = '/profile.html';
      }, 1200);

    } catch (error) {
      console.error('[Profile Completion] Save failed:', error);
      showMsg(error.message || 'Unable to save your profile. Please try again.', 'error');
      setBusy('completeBtn', false);
      _completingProfile = false;
    }
  })();
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

      loadExistingProfile();
      
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
