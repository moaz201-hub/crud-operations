const fullNameInput = document.getElementById('fullName');
const phoneNumberInput = document.getElementById('phoneNumber');
const emailAddressInput = document.getElementById('emailAddress');
const addressInput = document.getElementById('address');
const groupSelect = document.getElementById('group');
const notesInput = document.getElementById('notes');
const isFavoriteCheck = document.getElementById('isFavorite');
const isEmergencyCheck = document.getElementById('isEmergency');

const saveContactBtn = document.getElementById('saveContactBtn');
const updateContactBtn = document.getElementById('updateContactBtn');
const addContactBtn = document.getElementById('addContactBtn');
const searchInput = document.getElementById('searchInput');

const rowData = document.getElementById('rowData');
const favoritesList = document.getElementById('favoritesList');
const emergencyList = document.getElementById('emergencyList');

const totalContactsEl = document.getElementById('totalContacts');
const favoritesCountEl = document.getElementById('favoritesCount');
const emergencyCountEl = document.getElementById('emergencyCount');
const contactsCountEl = document.getElementById('contactsCount');

const modalElement = document.getElementById('addContactModal');
const contactModal = new bootstrap.Modal(modalElement);

let contactsList = [];
let updateIndex = null;

if (localStorage.getItem('contactsList') !== null) {
  contactsList = JSON.parse(localStorage.getItem('contactsList'));
  displayContacts(contactsList);
} else {
  contactsList = [
    {
      name: 'Alyssa Larsen',
      phone: '01050079305',
      email: 'hevufohejy@mailinator.com',
      address: 'Possimus veniam co',
      group: 'other',
      notes: '',
      isFavorite: false,
      isEmergency: false
    },
    {
      name: 'Uta Salas',
      phone: '01050079307',
      email: 'damuluvuca@mailinator.com',
      address: 'Architecto omnis qui',
      group: 'family',
      notes: '',
      isFavorite: true,
      isEmergency: true
    }
  ];
  saveToLocalStorage();
  displayContacts(contactsList);
}

function displayContacts(list) {
  let cartona = '';

  if (list.length === 0) {
    rowData.innerHTML = `<div class="col-12"><p class="alert alert-danger text-center">No contacts found</p></div>`;
  } else {
    for (let i = 0; i < list.length; i++) {
      const contact = list[i];
      const initials = getInitials(contact.name);

      cartona += `
        <div class="col-md-6">
          <div class="contact-card">
            <div class="contact-header">
              <div class="contact-avatar bg-primary">
                ${initials}
              </div>
              <div class="contact-info">
                <h4>${contact.name}</h4>
              </div>
            </div>
            <div class="contact-details">
              <div class="contact-detail phone">
                <i class="fas fa-phone"></i>
                <span>${contact.phone}</span>
              </div>
              <div class="contact-detail email">
                <i class="fas fa-envelope"></i>
                <span>${contact.email || 'N/A'}</span>
              </div>
              <div class="contact-detail address">
                <i class="fas fa-map-marker-alt"></i>
                <span>${contact.address || 'N/A'}</span>
              </div>
            </div>
            <div class="contact-tags">
              ${contact.group ? `<span class="tag ${contact.group}">${contact.group}</span>` : ''}
              ${contact.isEmergency ? `<span class="tag emergency"><i class="fas fa-heartbeat"></i> Emergency</span>` : ''}
            </div>
            <div class="contact-actions">
              <a href="tel:${contact.phone}" class="contact-action call" title="Call">
                <i class="fas fa-phone"></i>
              </a>
              <a href="mailto:${contact.email}" class="contact-action email ${!contact.email ? 'disabled' : ''}" title="Email">
                <i class="fas fa-envelope"></i>
              </a>
              <button onclick="toggleFavorite(${i})" class="contact-action favorite ${contact.isFavorite ? 'active' : ''}" title="Favorite">
                <i class="${contact.isFavorite ? 'fas' : 'far'} fa-star"></i>
              </button>
              <button onclick="toggleEmergency(${i})" class="contact-action emergency ${contact.isEmergency ? 'active' : ''}" title="Emergency">
                <i class="${contact.isEmergency ? 'fas' : 'far'} fa-heart"></i>
              </button>
              <button onclick="setupUpdateForm(${i})" class="contact-action" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteContact(${i})" class="contact-action delete" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }
    rowData.innerHTML = cartona;
  }

  updateSidebarAndStats();
}

function updateSidebarAndStats() {
  const favCount = contactsList.filter(c => c.isFavorite).length;
  const emergCount = contactsList.filter(c => c.isEmergency).length;

  totalContactsEl.innerText = contactsList.length;
  contactsCountEl.innerText = contactsList.length;
  favoritesCountEl.innerText = favCount;
  emergencyCountEl.innerText = emergCount;

  let favCartona = '';
  contactsList.forEach((c) => {
    if (c.isFavorite) {
      favCartona += `
        <div class="sidebar-contact-card">
          <div class="sidebar-contact-avatar" style="background: #3b82f6">
            ${getInitials(c.name)}
          </div>
          <div class="sidebar-contact-info">
            <h5>${c.name}</h5>
            <p>${c.phone}</p>
          </div>
          <a href="tel:${c.phone}" class="sidebar-call-btn favorites-call">
            <i class="fas fa-phone"></i>
          </a>
        </div>
      `;
    }
  });
  favoritesList.innerHTML = favCartona || '<p class="text-muted small">No favorite contacts</p>';

  let emergCartona = '';
  contactsList.forEach((c) => {
    if (c.isEmergency) {
      emergCartona += `
        <div class="sidebar-contact-card">
          <div class="sidebar-contact-avatar" style="background: #ef4444">
            ${getInitials(c.name)}
          </div>
          <div class="sidebar-contact-info">
            <h5>${c.name}</h5>
            <p>${c.phone}</p>
          </div>
          <a href="tel:${c.phone}" class="sidebar-call-btn emergency-call">
            <i class="fas fa-phone"></i>
          </a>
        </div>
      `;
    }
  });
  emergencyList.innerHTML = emergCartona || '<p class="text-muted small">No emergency contacts</p>';
}

saveContactBtn.addEventListener('click', function () {
  if (validateForm()) {
    const contact = {
      name: fullNameInput.value.trim(),
      phone: phoneNumberInput.value.trim(),
      email: emailAddressInput.value.trim(),
      address: addressInput.value.trim(),
      group: groupSelect.value,
      notes: notesInput.value.trim(),
      isFavorite: isFavoriteCheck.checked,
      isEmergency: isEmergencyCheck.checked
    };

    contactsList.push(contact);
    saveToLocalStorage();
    displayContacts(contactsList);
    clearForm();
    contactModal.hide();

    Swal.fire({
      icon: 'success',
      title: 'Added!',
      text: 'Contact added successfully.',
      timer: 1500,
      showConfirmButton: false
    });
  }
});

function deleteContact(index) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      contactsList.splice(index, 1);
      saveToLocalStorage();
      displayContacts(contactsList);

      Swal.fire('Deleted!', 'Contact has been deleted.', 'success');
    }
  });
}

function setupUpdateForm(index) {
  updateIndex = index;
  const contact = contactsList[index];

  fullNameInput.value = contact.name;
  phoneNumberInput.value = contact.phone;
  emailAddressInput.value = contact.email;
  addressInput.value = contact.address;
  groupSelect.value = contact.group;
  notesInput.value = contact.notes;
  isFavoriteCheck.checked = contact.isFavorite;
  isEmergencyCheck.checked = contact.isEmergency;

  saveContactBtn.classList.add('d-none');
  updateContactBtn.classList.remove('d-none');
  document.getElementById('addContactModalLabel').innerText = 'Update Contact';

  contactModal.show();
}

updateContactBtn.addEventListener('click', function () {
  if (validateForm()) {
    contactsList[updateIndex] = {
      name: fullNameInput.value.trim(),
      phone: phoneNumberInput.value.trim(),
      email: emailAddressInput.value.trim(),
      address: addressInput.value.trim(),
      group: groupSelect.value,
      notes: notesInput.value.trim(),
      isFavorite: isFavoriteCheck.checked,
      isEmergency: isEmergencyCheck.checked
    };

    saveToLocalStorage();
    displayContacts(contactsList);
    clearForm();
    contactModal.hide();

    Swal.fire({
      icon: 'success',
      title: 'Updated!',
      text: 'Contact updated successfully.',
      timer: 1500,
      showConfirmButton: false
    });
  }
});

function toggleFavorite(index) {
  contactsList[index].isFavorite = !contactsList[index].isFavorite;
  saveToLocalStorage();
  displayContacts(contactsList);
}

function toggleEmergency(index) {
  contactsList[index].isEmergency = !contactsList[index].isEmergency;
  saveToLocalStorage();
  displayContacts(contactsList);
}

searchInput.addEventListener('input', function () {
  const term = searchInput.value.toLowerCase().trim();
  const filteredList = contactsList.filter(contact => {
    return (
      contact.name.toLowerCase().includes(term) ||
      contact.phone.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term)
    );
  });
  displayContacts(filteredList);
});

function validateForm() {
  const nameRegex = /^[a-zA-Z\s]{3,30}$/;
  const phoneRegex = /^01[0125][0-9]{8}$/;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!nameRegex.test(fullNameInput.value.trim())) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Name',
      text: 'Please enter a valid name (at least 3 characters, letters only).'
    });
    return false;
  }

  if (!phoneRegex.test(phoneNumberInput.value.trim())) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Phone Number',
      text: 'Please enter a valid Egyptian phone number (e.g., 01012345678).'
    });
    return false;
  }

  if (emailAddressInput.value.trim() !== '' && !emailRegex.test(emailAddressInput.value.trim())) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address.'
    });
    return false;
  }

  return true;
}

function saveToLocalStorage() {
  localStorage.setItem('contactsList', JSON.stringify(contactsList));
}

function clearForm() {
  fullNameInput.value = '';
  phoneNumberInput.value = '';
  emailAddressInput.value = '';
  addressInput.value = '';
  groupSelect.value = '';
  notesInput.value = '';
  isFavoriteCheck.checked = false;
  isEmergencyCheck.checked = false;

  saveContactBtn.classList.remove('d-none');
  updateContactBtn.classList.add('d-none');
  document.getElementById('addContactModalLabel').innerText = 'Add New Contact';
}

function getInitials(name) {
  if (!name) return 'CU';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

addContactBtn.addEventListener('click', clearForm);