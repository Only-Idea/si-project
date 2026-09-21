import { trapDialogFocus } from './dialog.js';

export function initContact() {
  const contact = document.createElement('dialog');
  contact.className = 'contact-dialog';
  contact.setAttribute('aria-labelledby', 'contact-title');
  contact.innerHTML = `<div class="dialog-top"><p class="eyebrow">Your next idea starts here</p><button class="dialog-close" aria-label="Close contact preview" autofocus>×</button></div><div class="dialog-copy"><h2 id="contact-title">Let’s give it shape.</h2><p>Tell us about the object you have in mind, how you’ll use it, and the finish you’re looking for.</p><p class="note">This is a design preview. SI 3D PROJECT’s public contact details and enquiry channel will be connected before launch. No enquiry can be sent from this preview.</p><button class="button secondary dialog-dismiss">Keep exploring <span aria-hidden="true">→</span></button></div>`;
  document.body.append(contact);
  let contactReturnFocus;
  document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
    contactReturnFocus = button;
    contact.showModal();
  }));
  contact.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => contact.close()));
  contact.addEventListener('close', () => contactReturnFocus?.focus());

  trapDialogFocus(contact);
  return contact;
}
