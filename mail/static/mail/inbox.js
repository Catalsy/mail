document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').addEventListener('submit', submit_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(element => {

      // Get email data
      const id = element.id;
      const sender = element.sender;
      const subject = element.subject;
      const timestamp = element.timestamp;

      // Create email element and assign attribute/value
      const email = document.createElement('div');
      email.className = 'emails-list';
      email.innerHTML = `<p>From: ${sender}</p>
                        <p>Subject: ${subject}<p/>
                        <p>Time: ${timestamp}</p>`;

      // Atach event listener to read email
      email.addEventListener('click', () => load_email(mailbox, id));

      // If read, set background color to gray, else to white
      if (element.read) {
        email.style.backgroundColor = "lightgray";
      } else {
        email.style.backgroundColor = "white";
      };
      
      document.querySelector('#emails-view').append(email);
    });
  })
}


function submit_email(event) {
  // Do not refresh page
  event.preventDefault();

  // Get values from form fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // POST email to API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients,
        subject,
        body
    })
  })
  .then(response => response.json())
  .then(result => console.log(result))

  // Load "Sent" mailbox after sending an email
  load_mailbox('sent');
}


function load_email(mailbox, id) {
  
  // Check if there is already another email in the DOM
  if (document.querySelector('.email')) {

    // Remove such element
    const emailToRemove = document.querySelector('.email');
    document.querySelector('#email-view').removeChild(emailToRemove);

  };

  // show email-view and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  // Get email content
  fetch (`/emails/${id}`)
  .then(res => res.json())
  .then(email => {

    // Create elements for email content
    const sender = document.createElement('p');
    sender.innerHTML = `Sender: ${email.sender}`;
    sender.style.fontWeight = 'bold';

    const recipients = document.createElement('p');
    recipients.innerHTML = `Recipients: ${email.recipients}`;

    const subject = document.createElement('p');
    subject.innerHTML = `Subject: ${email.subject}`;
    subject.style.fontWeight = 'bold';

    const timestamp = document.createElement('p');
    timestamp.innerHTML = email.timestamp;

    const body = document.createElement('p');
    body.innerHTML = email.body;

    // Create div element to show email
    const displayEmail = document.createElement('div');
    displayEmail.className = 'email';
    
    // Append elements to email
    displayEmail.appendChild(sender);
    displayEmail.appendChild(timestamp);
    displayEmail.appendChild(recipients);
    displayEmail.appendChild(subject);
    displayEmail.appendChild(body);

    if (mailbox != 'sent') {

      // Create archive/unarchive button
      const archButton = document.createElement('button');

      if (mailbox == 'inbox') {
        archButton.innerHTML = 'Archive';

        // Archive message when button is clicked
        archButton.addEventListener('click', () => {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })

          // Load inbox after clicking button
          load_mailbox('inbox');
        });
      } 

      // If the mailbox is Archive
      else {
        archButton.innerHTML = 'Unarchive';
        
        archButton.addEventListener('click', () => {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })

          // Load inbox after clicking button
          load_mailbox('inbox');
        });
      }

      // Insert at the beginning of the div 
      displayEmail.insertBefore(archButton, displayEmail.childNodes[0]);
    }

    // Append email to email-view
    document.querySelector('#email-view').appendChild(displayEmail);

  })

  // Set read propertie to true
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}