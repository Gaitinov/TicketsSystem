document.querySelector('#loginButton1').addEventListener('click', async function (event) {
  event.preventDefault();

  var loginUsername = document.querySelector('#loginUsername');
  var loginPassword = document.querySelector('#loginPassword');
  var errorMessage = document.querySelector('#errorMessagelog');

  loginUsername.classList.remove('is-invalid');
  loginPassword.classList.remove('is-invalid');

  if (!loginUsername.value) {
    errorMessage.innerHTML = 'Please fill username field';
    errorMessage.style.display = 'block';
    loginUsername.classList.add('is-invalid');
  }
  else if (!loginPassword.value) {
    errorMessage.innerHTML = 'Please fill password field';
    errorMessage.style.display = 'block';
    loginPassword.classList.add('is-invalid');
  }
  else {
    errorMessage.style.display = 'none';
    const username = document.querySelector('#loginUsername').value;
    const password = document.querySelector('#loginPassword').value;

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log(data);

      if (data.token) {
        localStorage.setItem('token', data.token);
        const token = localStorage.getItem('token');
        console.log(token);
        location.reload();
      } else {
        errorMessage.innerHTML = 'Incorrect username or password';
        errorMessage.style.display = 'block';
        loginUsername.classList.add('is-invalid');
        loginPassword.classList.add('is-invalid');
      }
    } catch (error) {
      console.error(error);
    }
  }
});







document.querySelector('#registorButton1').addEventListener('click', async function (event) {
  event.preventDefault();

  var registerUsername = document.querySelector('#registerUsername');
  var registerEmail = document.querySelector('#registerEmail');
  var registerPassword = document.querySelector('#registerPassword');
  var registerConfirmPassword = document.querySelector('#registerConfirmPassword');
  var errorMessage = document.querySelector('#errorMessagereg');

  registerUsername.classList.remove('is-invalid');
  registerEmail.classList.remove('is-invalid');
  registerPassword.classList.remove('is-invalid');
  registerConfirmPassword.classList.remove('is-invalid');

  if (!registerUsername.value) {
    errorMessage.innerHTML = 'Please enter a username';
    errorMessage.style.display = 'block';
    registerUsername.classList.add('is-invalid');
  } else if (!registerEmail.value || !/^[^@]+@[^@]+\.[^@]+$/.test(registerEmail.value)) {
    errorMessage.innerHTML = 'Please enter a valid email address';
    errorMessage.style.display = 'block';
    registerEmail.classList.add('is-invalid');
  } else if (!registerPassword.value || !registerConfirmPassword.value || registerPassword.value !== registerConfirmPassword.value) {
    errorMessage.innerHTML = 'Please enter and confirm your password';
    errorMessage.style.display = 'block';
    registerPassword.classList.add('is-invalid');
    registerConfirmPassword.classList.add('is-invalid');
  } else {
    errorMessage.style.display = 'none';

    const username = document.querySelector('#registerUsername').value;
    const email = document.querySelector('#registerEmail').value;
    const password = document.querySelector('#registerPassword').value;

    try {
      const response = await fetch('/auth/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      location.reload();
    } catch (error) {
      errorMessage.innerHTML = error.message;
      errorMessage.style.display = 'block';
    }
  }
});





const state = {};

window.addEventListener('beforeunload', () => {
  console.log('beforeunload event fired');
  if (window.location.hash === '#main') {
    state.mainContent = document.getElementById('ticketsupload').innerHTML;
    console.log('Saved mainContent:', state.mainContent);
  }
});

document.querySelectorAll(".link-item a").forEach(link => {
  link.addEventListener("click", async function (event) {
    event.preventDefault();

    document.querySelectorAll('a.nav-link').forEach(function (link) {
      link.classList.remove('disabled');
    });

    this.classList.add('disabled');
    let href = this.href;
    let data = await fetch(href);
    document.querySelector("#containermain").innerHTML = await data.text();
    window.location.hash = this.getAttribute("data-hash");

    if (window.location.hash === '#main') {
      loadUserData();
    }

    if (window.location.hash === '#viewtickets') {
      loadAllTickets();
    }

  });
});

// Добавления контента на страницу от хэша
async function start() {
  let hash = window.location.hash;
  hash = hash.substring(1);
  if (!hash) {
    hash = "main";
  }
  let data = await fetch(`${hash}.ejs`);
  document.querySelector("#containermain").innerHTML = await data.text();

  const token = localStorage.getItem('token');

  if (!token) {
    document.querySelector('#loginButton2').addEventListener('click', function () {
      $('#navbarNav').collapse('toggle');
      $('#loginModal').modal('show');
    });

    document.querySelector('#registerButton2').addEventListener('click', function () {
      $('#navbarNav').collapse('toggle');
      $('#registerModal').modal('show');
    });
  }



  if (token) {
    try {

      if (window.location.hash == "#main" || location.hash === '') {
        const h2Element = document.querySelector('#h2recenttickets');
        h2Element.classList.remove('d-none');
        const containerElement = document.querySelector('div.container-fluid.p-0.mt-4.d-flex.justify-content-center.d-none');
        containerElement.classList.remove('d-none');
        const spinnerBorderElement = document.querySelector('div.spinner-border.d-none');
        spinnerBorderElement.classList.remove('d-none');
        const formcreateticketElement = document.querySelector('form#ticket-form.d-none');
        formcreateticketElement.classList.remove("d-none")
        const block = document.querySelector('#blockloginregistor');
        const loginButton2 = block.querySelector('#loginButton2');
        const registerButton2 = block.querySelector('#registerButton2');
        loginButton2.classList.add('d-none');
        registerButton2.classList.add('d-none');
        const orText = block.querySelector('#orelement');
        orText.classList.add('d-none');
        loadUserData();
      }

      const liElement1 = document.querySelector('li#linkitemli1.nav-item');
      liElement1.classList.remove('d-none');
      const aElement1 = liElement1.querySelector('a.nav-link');
      aElement1.classList.remove('d-none');
      const liElement2 = document.querySelector('li#linkitemli2.nav-item');
      liElement2.classList.remove('d-none');
      const aElement2 = liElement2.querySelector('a.nav-link');
      aElement2.classList.remove('d-none');
    } catch (error) {
      console.error(error);
    }
  }



  // Инициализация Summernote
  $(document).ready(function () {
    $('#summernote').summernote({
      placeholder: 'Hello',
      tabsize: 2,
      height: 500,
      width: '100%',
    });
  });

  // Прикрепление обработчика событий для кнопки отправки
  attachSubmitButtonListener();
}



async function attachSubmitButtonListener() {
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', async () => {
      const token = localStorage.getItem('token');

      const title = document.getElementById('subject').value;
      const description = $('#summernote').summernote('code');

      // Удаляем все HTML-теги и заменяем неразрывные пробелы на обычные пробелы
      const strippedContent = description.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, ' ');

      // Проверка, что оба поля заполнены
      if (!title || !strippedContent.trim()) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      const ticketData = {
        title: title,
        description: description,
      };

      try {
        const response = await fetch('/auth/ticket/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(ticketData),
        });

        if (response.ok) {
          // Тикет успешно создан
          alert('Тикет создан');
          location.reload();

          // Очистка полей после успешного создания тикета
          document.getElementById('subject').value = '';
          $('#summernote').summernote('reset');

        } else {
          // Произошла ошибка при создании тикета
          const errorData = await response.json();
          if (errorData.message === 'Вы не можете создать больше 3 открытых тикетов') {
            alert('Вы не можете создать больше 3 открытых тикетов');
          } else {
            alert('Ошибка при создании тикета');
          }
        }
      } catch (error) {
        console.error('Ошибка при отправке тикета:', error);
      }
    });
  }
}



start();


function updateNavLinkState() {
  let hash = window.location.hash;
  hash = hash.substring(1);
  if (!hash) {
    hash = "main";
  }
  document.querySelectorAll("a.nav-link").forEach(link => {
    // Проверка, является ли ссылка текущей
    if (link.dataset.hash === hash) {
      link.classList.add("disabled");
    } else {
      link.classList.remove("disabled");
    }
  });
}

function updateHash(newHash) {
  window.location.hash = newHash;
}

window.addEventListener("hashchange", function () {
  start();
  updateNavLinkState();
});



window.onload = function () {

  // Check if token exists in local storage
  const token = localStorage.getItem('token');
  if (token) {
    const loginButton = document.querySelector(`a[data-target='#loginModal']`);
    loginButton.style.display = 'none';
    const registerButton = document.querySelector(`a[data-target='#registerModal']`);
    registerButton.style.display = 'none';
    const loginButtonTelephone = document.querySelector(`a[data-target='#loginModalTelephone']`);
    loginButtonTelephone.style.display = 'none';
    const registerButtonTelephone = document.querySelector(`a[data-target='#registerModalTelephone']`);
    registerButtonTelephone.style.display = 'none';
    const logoutButton = document.querySelector(`a[data-target='#logout']`);
    logoutButton.classList.remove('d-none');
    const logoutButtonTelephone = document.querySelector(`a[data-target='#logouttelephone']`);
    logoutButtonTelephone.classList.remove('d-none');
    const nickname = document.querySelector(`a[data-target='#nickname']`);
    nickname.classList.remove('d-none');
    const nicknameTelephone = document.querySelector(`a[data-target='#nicknameTelephone']`);
    nicknameTelephone.classList.remove('d-none');
  }
};


const logoutButton = document.querySelector(`a[data-target='#logout']`);
logoutButton.addEventListener('click', function () {
  localStorage.removeItem('token');
  location.reload();
});

const logoutButtonTelephone = document.querySelector(`a[data-target='#logouttelephone']`);
logoutButtonTelephone.addEventListener('click', function () {
  localStorage.removeItem('token');
  location.reload();
});



var content = '\
<div class="card bg-light text-black mb-3"><div class="card-header">Notification Title</div><div class="card-body"><p class="card-text">Date: January 7, 2023</p></div></div>\
';

function createPopoverWithContent(content) {
  $(function () {
    $('[data-toggle="popover"]').popover({
      placement: 'auto',
      trigger: 'click',
      html: true,
      content: content,
      container: 'body',
      sanitize: false,
    });

    $(document).click(function (event) {
      if (!$(event.target).closest('[data-toggle="popover"]').length && !$(event.target).closest('.popover').length) {
        $('[data-toggle="popover"]').popover('hide');
      }
    });

    $('[data-toggle="popover"]').on('shown.bs.popover', () => {
      document.querySelectorAll('.goto-ticket-btn').forEach((button) => {
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          const notificationId = event.target.dataset.id;
          await deleteNotification(notificationId);
          window.location.href = event.target.href;
        });
      });
    });
  });
}








document.querySelector('#loginButton').addEventListener('click', function () {
  $('#navbarNav').collapse('toggle');
  $('#loginModal').modal('show');
});

document.querySelector('#registerButton').addEventListener('click', function () {
  $('#navbarNav').collapse('toggle');
  $('#registerModal').modal('show');
});


// Получение ника пользователя и данных вывода

window.addEventListener('DOMContentLoaded', async () => {


  updateNavLinkState();

  const token = localStorage.getItem('token');

  if (token) {
    try {
      const response = await fetch('/auth/userinfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        const userNicknameElement = document.getElementById('userNickname');
        userNicknameElement.textContent = data.username;

        const userNicknameElementTelephone = document.getElementById('userNicknameTelephone');
        userNicknameElementTelephone.textContent = data.username;


        const isAdmin = data.roles.includes('ADMIN');

        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach((link) => {
          if (isAdmin) {
            link.classList.remove('d-none');
          }
        });

        const unreadNotificationsCount = data.notifications.filter(
          (notification) => !notification.isRead
        ).length;

        const notifyLinks = document.querySelectorAll('.notify-linkclass');
        notifyLinks.forEach((notifyLink) => {
          const notifyBadge = notifyLink.querySelector('.badge.badge-pill.badge-primary');
          if (notifyBadge) {
            notifyBadge.textContent = unreadNotificationsCount;
          }
        });

        const notificationsContent = data.notifications
          .map(notification => notificationToCard(notification))
          .join('');

        createPopoverWithContent(notificationsContent);




      } else {
        console.error('Ошибка получения информации о пользователе');
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
    }
  } else {
    // console.log('Токен не найден');
  }

  if (location.hash === '#main' || location.hash === '') {
    loadUserData();
  }

  if (location.hash === '#viewtickets') {

    document.getElementById('filter-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      // Получите значения полей формы
      const search = document.getElementById('search-input').value;
      const searchBy = document.getElementById('search-by').value;
      const status = document.getElementById('status').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;

      // Загрузите тикеты с учетом фильтров и сортировки
      loadAllTickets(1, 10, search, searchBy, status, startDate, endDate);
    });
  }


});






async function loadAllTickets(page = 1, limit = 10, search = '', searchBy = '', status = '', startDate = '', endDate = '') {
  const token = localStorage.getItem('token');
  const url = new URL(`/auth/alltickets`, window.location.origin);

  // Добавьте параметры запроса
  const params = {
    page,
    limit,
    search,
    searchBy,
    status,
    startDate,
    endDate
  };

  Object.keys(params).forEach(key => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });

  console.log('Параметры запроса:', url.search);

  if (token) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let html = '';
        data.data.forEach(item => {

          const DateTicket = item.date;
          const formattedDate = formatDate(DateTicket);

          html += `
                <div class="card mb-0 mb-3">
                  <div class="card-body d-flex">
                    <div class="col-md-8">
                    <a href="/page/${item._id}">
                        <h5 class="card-title pb-3">
                          ${item.title}
                        </h5>
                      </a>
                      <p class="card-text">Date: ${formattedDate}</p>
                    </div>
                    <div id="themediv" class="card-body">
                      <img class="imagesized d-block mx-auto" src="img/loced.png" alt="Centered image">
                    </div>
                  </div>
                </div>
              `;
        });

        document.getElementById('ticketadminsupload').innerHTML = html;

        const total = data.total;
        const currentPage = page;
        createPagination(total, limit, currentPage);

      } else {
        console.error('Ошибка получения всех тикетов');
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
    }
  } else {
    // console.log('Токен не найден');
  }
}


async function loadUserData() {

  const token = localStorage.getItem('token');



  if (token) {
    try {
      const response = await fetch('/auth/userdata', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let html = '';
        data.data.forEach(item => {

          const DateTicket = item.date;
          const formattedDate = formatDate(DateTicket);

          html += `
                <div class="card mb-0 mb-3">
                  <div class="card-body d-flex">
                    <div class="col-md-8">
                    <a href="/page/${item._id}">
                        <h5 class="card-title pb-3">
                          ${item.title}
                        </h5>
                      </a>
                      <p class="card-text">Date: ${formattedDate}</p>
                    </div>
                    <div id="themediv" class="card-body">
                      <img class="imagesized d-block mx-auto" src="img/loced.png" alt="Centered image">
                    </div>
                  </div>
                </div>
              `;
        });

        document.getElementById('ticketsupload').innerHTML = html;








      } else {
        console.error('Ошибка получения данных пользователя');
      }
    } catch (error) {
      console.error('Ошибка при проверке токена:', error);
    }
  } else {
    // console.log('Токен не найден');
  }


}

function createPagination(totalTickets, currentPage) {
  const totalPages = Math.ceil(totalTickets / 10);
  let html = '';

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link" href="#" onclick="handlePageClick(event, ${i})">${i}</a></li>`;
  }

  const paginationContainer = document.getElementById('pagination-container');
  if (paginationContainer) {
    paginationContainer.innerHTML = `
    <nav aria-label="Page navigation" class="d-flex justify-content-center">
    <ul class="pagination">
      ${html}
    </ul>
  </nav>  
    `;
  } else {
    console.error('Pagination container not found');
  }
}

function handlePageClick(event, pageNumber) {
  event.preventDefault();
  loadAllTickets(pageNumber);
}



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


function notificationToCard(notification) {
  const date = new Date(notification.date).toLocaleDateString();
  const title = notification.type;
  const message = notification.message;
  const ticketId = notification.ticketId;


  return `
    <div class="card bg-light text-black mb-2" style="max-width: 15rem;">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>${title}</span>
      </div>
      <div class="card-body">
        <h6 class="card-title">${message}</h6>
        <p class="card-text">Дата: ${new Date(notification.date).toLocaleString()}</p>
        <a href="/page/${ticketId}" class="btn btn-sm btn-info goto-ticket-btn" data-id="${notification._id}">Перейти к тикету</a>
      </div>
    </div>
  `;
}

async function deleteNotification(notificationId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/auth/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Ошибка удаления уведомления');
    }
  } catch (error) {
    console.error('Ошибка при удалении уведомления:', error);
  }
}

