const currentUrl = window.location.pathname;
const id = currentUrl.split('/').pop();

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {

      initializeEditor();

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
                        <h5 class="mb-5 mt-2">User</h5>
                      </div>
            
                      <div class="col-sm-9 align-self-start mt-2">
                        <h5 class="text-muted mb-0">${formattedDate}</h5>
                        <p class="mt-4">${item.description}</p>
                      </div>
                    </div>
                  </div>
                `;

        const container = document.getElementById('ticketdataupload');
        container.innerHTML = html;

        const ticketContainer = document.getElementById('ticketContainer');

        let messageHtml = '';

        item.messages.forEach(message => {
          const formattedDate = formatDate(message.date);
          const isUserMessage = message.sender === item.author;

          messageHtml += `
      <div class="container mt-4">
        <div class="row border p-3 ${isUserMessage ? 'user-block' : 'admin-block'}">
          <div class="col-sm-3 align-self-center mt-2 text-center">
            <h5 class="mb-5 mt-2">${isUserMessage ? 'User' : 'Admin'}</h5>
          </div>
          <div class="col-sm-9 align-self-start mt-2">
            <h5 class="text-muted mb-0">${formattedDate}</h5>
            <p class="mt-4">${message.content}</p>
          </div>
        </div>
      </div>
    `;
        });

        ticketContainer.innerHTML = messageHtml;
      } else {
        console.error('Ошибка получения данных от сервера:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
    }
  } else {
    console.log('Токен не найден');
  }


  document.getElementById('submitMessageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageContent = $('#summernote').summernote('code');
  
    // Удаляем все HTML-теги и заменяем неразрывные пробелы на обычные пробелы
    const strippedContent = messageContent.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, ' ');
  
    // Проверяем, что сообщение не пустое и не состоит только из пробелов
    if (strippedContent.trim() !== '') {
      try {
        const response = await fetch(`/auth/ticket/${id}/addmessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content: messageContent }),
        });
  
        if (response.ok) {
          const data = await response.json();
          location.reload();
        } else {
          console.error('Ошибка отправки сообщения:', response.statusText);
        }
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    } else {
      alert('Пожалуйста, введите ваше сообщение');
    }
  });
  
  
  
  


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

function initializeEditor() {
  $('#summernote').summernote({
    placeholder: '',
    tabsize: 2,
    height: 300,
    width: '100%',
  });

  // Confirm close action
  $('#confirmClose').click(function () {
    // Your code to close the topic goes here
    console.log('Topic closed');

    // Close the modal
    $('#closeModal').modal('hide');
  });
}
