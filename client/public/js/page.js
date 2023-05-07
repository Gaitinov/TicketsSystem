const currentUrl = window.location.pathname;
const id = currentUrl.split('/').pop();

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch(`/auth/ticketdata/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const item = data.data;
        
        console.log('_id:', item._id);
        console.log('title:', item.title);
        console.log('author:', item.author);
        console.log('date:', item.date);
        console.log('description:', item.description);
        console.log('--------------------');
      } else {
        console.error('Ошибка получения данных от сервера:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
    }
  } else {
    console.log('Токен не найден');
  }
});
