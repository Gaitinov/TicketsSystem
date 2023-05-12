document.querySelector('#resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;
  
    if (password !== confirmPassword) {
      showModalWithMessage('Пароли не совпадают!');
      return;
    }
  
    // Поскольку вы находитесь на странице resetpassword/:token, вы можете получить токен из URL
    const token = window.location.pathname.split('/')[2];
  
    try {
      const response = await fetch(`/resetpassword/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
  
      const data = await response.json();
      showModalWithMessage('Пароль успешно сброшен');

          $('#close-popup').click(function () {
            $('#popup').modal('hide');
            window.location.href = "/#main";
          });

    } catch (error) {
      console.log(error.message);
    }
  });

  function showModalWithMessage(message) {
    $(document).ready(function () {
      $('#loginModal').modal('hide');
  
      $("#forgotPasswordForm").hide();
      $("#errorMessageForgotPassword").hide();
  
      $("#errorMessagelog").hide();
  
      $("#ResetpasswordLabel").hide();
      const pnotification = document.querySelector('#notificationmodalwindow');
      pnotification.innerHTML = message;
  
      $('#popup').modal('show');
  
      $('#close-popup').click(function () {
        $('#popup').modal('hide');
      });
    });
  }