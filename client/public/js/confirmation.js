$(document).ready(function () {
    showModalWithMessage(message);
  });
  
  function showModalWithMessage(message) {
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
  
    $('#popup').on('hidden.bs.modal', function () {
      window.location.href = "http://localhost:3000/";
    });
  }
  