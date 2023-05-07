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

                const DateTicket = item.date;
                const formattedDate = formatDate(DateTicket);
                console.log(formattedDate); 

                let html = `
                  <div class="card">
                    <div class="card-body py-3">
                      <h5 class="card-title m-0">
                        <span class="badge badge-secondary"><a title="Find other content with the 'question' tag">QUESTION</a></span>
                        <span>${item.title}</span>
                      </h5>
                    </div>
                  </div>
            
                  <div class="container mt-4 position-relative">
                    <div class="row border p-3">
                      <div class="col-sm-3 align-self-center mt-2 text-center">
                        <h5 class="mb-5 mt-2">Username</h5>
                      </div>
            
                      <div class="col-sm-9 align-self-start mt-2">
                        <h5 class="text-muted mb-0">${formattedDate}</h5>
                        <p class="mt-4">${item.description}</p>
                      </div>
                    </div>
                  </div>
                `;

                // Вставьте HTML-строку в нужное место на вашей странице
                const container = document.getElementById('ticketdataupload'); // замените 'container' на ID элемента, который должен содержать данные тикета
                container.innerHTML = html;



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



function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }