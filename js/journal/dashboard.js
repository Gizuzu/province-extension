/*!
  * GTA Journal v0.0.1 (https://journal.province.site/)
  * Copyright 2024 Gizuzu (https://gizuzu.space/)
  * Licensed under MIT
  */

document.body.setAttribute("data-bs-theme", "dark");

const links = document.querySelectorAll("head > link");

for (let link of links) {
  link.remove();
}

let state = {
  currentUser: null,
  users: [],
  isProfileBoxOpened: false
};

state.currentUser = {
  username: document.querySelector("body > header > div > div > div > div > p").innerText,
  status: document.querySelector("body > header > div > div > div > div > div.avatar > span").className.split(" ")[1],
  isAdmin: Array.from(document.querySelector("body > header > div > div > div > div > div.box").childNodes.values()).some((s) => s.nodeName.toLowerCase().includes('details')),
  avatar: new URL(document.querySelector("body > header > div > div > div > div > div.avatar > img").src)
};

const usersContainerElement = document.querySelector("body > main > div > div:nth-child(2)").querySelectorAll(".col-12");
for (const child of usersContainerElement) {
  const usersList = child.querySelector(".dash-scroll-block");

  for (const userItem of usersList.querySelectorAll(".item")) {
    let userInfo = {
      id: Number(new URL(userItem.querySelector(".username").href).searchParams.get("id")),
      username: userItem.querySelector(".username").innerText,
      status: userItem.querySelector(".avatar").className.split(" ")[1],
      isAdmin: userItem.querySelector(".admin") != null,
      avatar: new URL(userItem.querySelector(".avatar > img").src)
    };

    state.users.push(userInfo);
  }
}

document.body.querySelector("header").remove();
document.body.querySelector("main").remove();
document.body.querySelector("footer").remove();

const navElement = document.createElement("nav");
navElement.className = 'navbar shadow-sm navbar-expand-lg sticky-top bg-body-tertiary border-bottom';
navElement.innerHTML = `
  <div class="container-xl">
    <a class="navbar-brand" href="#">GTA Journal</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/dashboard">Главная</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/top">Топ 10</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/statistics">Статистика</a>
        </li>
        ${state.currentUser.isAdmin ? `<li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Админ
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="/user/add">Добавить пользователя</a></li>
            <li><a class="dropdown-item" href="/user/statistics">Статистика пользователей</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="/settings">Настройки</a></li>
          </ul>
        </li>` : ''}
      </ul>
      <div class="d-flex align-items-center">
        <img class="rounded-circle me-1" src="${state.currentUser.avatar}" height="35">
        <span class="me-2">${state.currentUser.username}</span>
        <a class="btn btn-danger btn-sm" href="/logout">Выйти</a>
      </div>
    </div>
  </div>
`;
document.body.appendChild(navElement);

const mainElement = document.createElement("main");
mainElement.className = 'py-4';
mainElement.innerHTML = `
  <div class="container-xl">
    <div class="d-flex flex-column p-3 rounded shadow-sm bg-body-tertiary">
      <span class="fw-medium fs-4">Ваш текущий статус: <span class="text-${state.currentUser.status == 'online' ? 'success' : state.currentUser.status == 'afk' ? 'warning' : 'danger'}">${state.currentUser.status == 'online' ? 'Онлайн' : state.currentUser.status == 'afk' ? 'AFK' : 'Оффлайн'}</span></span>
      <div class="btn-group mt-3" role="group">
        <button type="button" class="btn btn-success" onclick="editStatus('1')">Онлайн</button>
        <button type="button" class="btn btn-warning" onclick="editStatus('2')">AFK</button>
        <button type="button" class="btn btn-danger" onclick="editStatus('0')">Оффлайн</button>
      </div>
    </div>

    <div class="d-flex flex-column p-3 rounded shadow-sm bg-body-tertiary mt-3  ">
      <label for="username-search" class="form-label fw-medium">Поиск</label>
      <input type="email" class="form-control" id="username-search" placeholder="Начните вводить ник">
    </div>

    <div class="user-container mt-4 rounded shadow-sm bg-body-tertiary p-2"></div>
  </div>
`;
document.body.appendChild(mainElement);

const footerElement = document.createElement("footer");
footerElement.className = 'px-3 py-5 bg-body-tertiary';
footerElement.innerHTML = `
  <div class="container-xl">
    <span class="fw-medium text-body-secondary">© Gizuzu, ${new Date().getFullYear()}. Расширение предоставлено "как есть", без каких-либо гарантий. Поддержка: mail@gizuzu.ru</span>
  </div> 
`;
document.body.appendChild(footerElement);

document.getElementById("username-search").addEventListener('input', () => {
  renderUsersList();
});

function getUsersElements(users) {
  if (!users.length) return `<span class="fw-medium text-body-secondary">Никого нет</span>`;

  return users.map((u) => 
    `<div class="bg-dark-subtle d-flex align-items-center p-2 rounded">
      <img class="rounded-circle me-2" src="${u.avatar}" height="50" />
      <div class="d-flex flex-column justify-content-center">
        <span class="fw-medium">${u.username}</span>
        <div class="d-flex gap-2">
          <a target="_blank" href="https://vk.com/id${new URL(u.avatar).pathname.split('/')[3].split('_')[0]}">Открыть ВК</a>
          ${state.currentUser.isAdmin ? `<a href="/user?id=${u.id}">Редактировать</a>` : ''}
        </div>
      </div>
    </div>`
  ).join('\n');
}

function renderUsersList() {
  const usersContainer = document.querySelector("body > main > div > div.user-container")
  if (!usersContainer) return;

  let users = state.users;
  if (document.getElementById("username-search").value) {
    users = users.filter((u) => u.username.toLowerCase().includes(document.getElementById("username-search").value.toLowerCase()));
  }

  const onlineUsers = users.filter((u) => u.status == 'online');
  const afkUsers = users.filter((u) => u.status == 'afk');
  const offlineUsers = users.filter((u) => u.status == 'offline');

  usersContainer.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-4">
          <span class="fw-medium fs-5">Онлайн (${onlineUsers.length})</span>
          <div class="d-flex flex-column gap-1 mt-2">
            ${getUsersElements(onlineUsers)}
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <span class="fw-medium fs-5">AFK (${afkUsers.length})</span>
          <div class="d-flex flex-column gap-1 mt-2">
            ${getUsersElements(afkUsers)}
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <span class="fw-medium fs-5">Оффлайн (${offlineUsers.length})</span>
          <div class="d-flex flex-column gap-1 mt-2">
            ${getUsersElements(offlineUsers)}
          </div>
        </div>
      </div>
    </div>
  `;
}

renderUsersList();

window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
