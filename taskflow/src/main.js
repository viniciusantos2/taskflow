
import ".style.css";

const app = document.querySelector("#app");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loginScreen(){

  app.innerHTML = `
    <div class="login-screen">
      <div class="login-box">
        <h1>TaskFlow Pro</h1>

        <input type="text" id="name" placeholder="Seu nome">
        <input type="password" placeholder="Senha">

        <button id="loginBtn">Entrar</button>
      </div>
    </div>
  `;

  document.querySelector("#loginBtn").addEventListener("click", ()=>{

    const name = document.querySelector("#name").value;

    if(name.trim() === "") return;

    localStorage.setItem("user", name);

    dashboard();
  });
}

function dashboard(){

  const user = localStorage.getItem("user") || "Usuário";

  app.innerHTML = `
  <div class="dashboard">

    <aside class="sidebar">

      <div class="logo">TaskFlow</div>

      <div class="menu">
        <button class="nav active" data-page="dashboardPage">Dashboard</button>
        <button class="nav" data-page="tasksPage">Tarefas</button>
        <button class="nav" data-page="kanbanPage">Kanban</button>
        <button class="nav" data-page="statsPage">Estatísticas</button>
        <button class="nav" data-page="calendarPage">Calendário</button>
        <button class="nav" data-page="settingsPage">Configurações</button>
      </div>

    </aside>

    <main class="main">

      <div class="page active" id="dashboardPage">

        <h1>Bem-vindo, ${user}</h1>

        <div class="cards">

          <div class="card">
            <h3>Total</h3>
            <p id="totalTasks">0</p>
          </div>

          <div class="card">
            <h3>Concluídas</h3>
            <p id="doneTasks">0</p>
          </div>

          <div class="card">
            <h3>Pendentes</h3>
            <p id="pendingTasks">0</p>
          </div>

        </div>

      </div>

      <div class="page" id="tasksPage">

        <h1>Tarefas</h1>

        <div class="task-form">
          <input type="text" id="taskInput" placeholder="Nova tarefa">

          <select id="priority">
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
          </select>

          <button id="addBtn">Adicionar</button>
        </div>

        <input class="search" id="searchInput" placeholder="Pesquisar tarefa">

        <div class="tasks" id="taskList"></div>

      </div>

      <div class="page" id="kanbanPage">
        <h1>Kanban</h1>

        <div class="kanban">

          <div class="column">
            <h2>A Fazer</h2>
            <div id="todoColumn"></div>
          </div>

          <div class="column">
            <h2>Concluído</h2>
            <div id="doneColumn"></div>
          </div>

        </div>
      </div>

      <div class="page" id="statsPage">
        <h1>Estatísticas</h1>

        <div class="chart">

          <h2>Produtividade</h2>

          <div class="bars">
            <div class="bar" style="height:40%">4</div>
            <div class="bar" style="height:70%">7</div>
            <div class="bar" style="height:50%">5</div>
            <div class="bar" style="height:90%">9</div>
            <div class="bar" style="height:60%">6</div>
          </div>

        </div>

      </div>

      <div class="page" id="calendarPage">
        <h1>Calendário</h1>

        <div class="calendar">
          <h2>Próximas tarefas</h2>
          <p>Organize seus prazos e atividades.</p>
        </div>

      </div>

      <div class="page" id="settingsPage">
        <h1>Configurações</h1>

        <div class="settings">
          <button id="logoutBtn">Sair da Conta</button>
        </div>

      </div>

    </main>

  </div>
  `;

  setupNavigation();
  setupTasks();
  updateStats();
  renderTasks();
}

function setupNavigation(){

  const buttons = document.querySelectorAll(".nav");

  buttons.forEach(button=>{

    button.addEventListener("click", ()=>{

      document.querySelectorAll(".nav").forEach(btn=>{
        btn.classList.remove("active");
      });

      button.classList.add("active");

      document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active");
      });

      document
        .querySelector(`#${button.dataset.page}`)
        .classList.add("active");
    });
  });

  const logoutBtn = document.querySelector("#logoutBtn");

  if(logoutBtn){

    logoutBtn.addEventListener("click", ()=>{
      localStorage.removeItem("user");
      loginScreen();
    });
  }
}

function setupTasks(){

  const addBtn = document.querySelector("#addBtn");

  if(addBtn){

    addBtn.addEventListener("click", ()=>{

      const title = document.querySelector("#taskInput").value;
      const priority = document.querySelector("#priority").value;

      if(title.trim() === "") return;

      tasks.push({
        id:Date.now(),
        title,
        priority,
        completed:false
      });

      saveTasks();

      document.querySelector("#taskInput").value = "";

      renderTasks();
      updateStats();
    });
  }

  const search = document.querySelector("#searchInput");

  if(search){

    search.addEventListener("input", (e)=>{
      renderTasks(e.target.value);
    });
  }
}

function renderTasks(filter = ""){

  const list = document.querySelector("#taskList");
  const todo = document.querySelector("#todoColumn");
  const done = document.querySelector("#doneColumn");

  if(!list) return;

  list.innerHTML = "";
  todo.innerHTML = "";
  done.innerHTML = "";

  const filtered = tasks.filter(task=>
    task.title.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.map(task=>{

    const card = document.createElement("div");

    card.classList.add("task");

    card.innerHTML = `
      <h3>${task.title}</h3>
      <span class="priority">${task.priority}</span>

      <div class="actions">
        <button class="complete">Concluir</button>
        <button class="delete">Excluir</button>
      </div>
    `;

    card.querySelector(".complete").addEventListener("click", ()=>{

      tasks = tasks.map(item=>{

        if(item.id === task.id){
          return {
            ...item,
            completed:true
          };
        }

        return item;
      });

      saveTasks();

      renderTasks();
      updateStats();
    });

    card.querySelector(".delete").addEventListener("click", ()=>{

      tasks = tasks.filter(item=> item.id !== task.id);

      saveTasks();

      renderTasks();
      updateStats();
    });

    list.appendChild(card);

    const kanbanCard = card.cloneNode(true);

    if(task.completed){
      done.appendChild(kanbanCard);
    }else{
      todo.appendChild(kanbanCard);
    }

  });
}

function updateStats(){

  const total = document.querySelector("#totalTasks");
  const done = document.querySelector("#doneTasks");
  const pending = document.querySelector("#pendingTasks");

  if(total){

    total.textContent = tasks.length;

    done.textContent =
      tasks.filter(task=>task.completed).length;

    pending.textContent =
      tasks.filter(task=>!task.completed).length;
  }
}

if(localStorage.getItem("user")){
  dashboard();
}else{
  loginScreen();
}
