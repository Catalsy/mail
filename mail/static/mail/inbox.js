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

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails from mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(element => {

      // Get email data
      const sender = element.sender;
      const subject = element.subject;
      const timestamp = element.timestamp;

      // Create email element and assign attribute/value
      const email = document.createElement('div');
      email.className = 'email';
      email.innerHTML = `<p>From: ${sender}</p>
                        <p>Subject: ${subject}<p/>
                        <p>Time: ${timestamp}</p>`;

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