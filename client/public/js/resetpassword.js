document.querySelector('#resetPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirmPassword').value;
  
    if (password !== confirmPassword) {
      alert('Пароли не совпадают!');
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
      alert("Пароль успешно сброшен");
      window.location.href = "/#main"; // перенаправление на страницу входа после успешного сброса пароля
    } catch (error) {
      console.log(error.message);
    }
  });