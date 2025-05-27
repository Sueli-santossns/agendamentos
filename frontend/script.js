// Inicializa o flatpickr com bloqueio de datas ocupadas
flatpickr("#data", {
  dateFormat: "Y-m-d",
  minDate: "today",
  onOpen: async function(selectedDates, dateStr, instance) {
    try {
      const response = await fetch("http://localhost:5000/api/horarios-ocupados");
      const agendamentos = await response.json();

      // Agrupa os horários por data
      const datasCheias = agendamentos.reduce((acc, item) => {
        acc[item.data] = acc[item.data] || [];
        acc[item.data].push(item.hora);
        return acc;
      }, {});

      // Define limite: se uma data tiver todos os horários ocupados, bloqueia
      const horariosPossiveis = [
        "09:00", "10:00", "11:00",
        "13:00", "14:00", "15:00",
        "16:00", "17:00"
      ];

      const datasBloqueadas = Object.entries(datasCheias)
        .filter(([data, horas]) => horas.length >= horariosPossiveis.length)
        .map(([data]) => data);

      instance.set("disable", datasBloqueadas);

    } catch (err) {
      console.error("Erro ao carregar datas ocupadas:", err);
    }
  }
});
// Envio do agendamento
document.getElementById("form-agendamento").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;
  const servico = document.getElementById("servico").value;

  if (!nome || !email || !data || !hora || !servico) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  fetch("http://localhost:5000/api/agendar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, data, hora, servico }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || "Erro ao agendar");
        });
      }
      return res.json();
    })
    .then((data) => {
      alert(data.message);
      document.getElementById("form-agendamento").reset();
      document.getElementById("hora").innerHTML = "<option value=''>Selecione a hora</option>";
    })
    .catch((err) => {
      alert(err.message || "Erro no agendamento");
      console.error(err);
    });
});

// Atualiza os horários disponíveis com base na data
document.getElementById("data").addEventListener("change", async function () {
  const data = this.value;
  const selectHora = document.getElementById("hora");

  const horarios = [
    "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00",
    "16:00", "17:00"
  ];

  try {
    const response = await fetch(`http://localhost:5000/api/horarios-ocupados/${data}`);
    const ocupados = await response.json();

    selectHora.innerHTML = "<option value=''>Selecione a hora</option>";

    horarios.forEach(hora => {
      const option = document.createElement("option");
      option.value = hora;
      option.textContent = ocupados.includes(hora)
        ? `${hora} (indisponível)`
        : hora;
      option.disabled = ocupados.includes(hora);
      selectHora.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar horários:", error);
    alert("Não foi possível carregar os horários disponíveis.");
  }
});
