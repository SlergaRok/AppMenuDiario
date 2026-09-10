const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function nombreMes(mesIndex) {
  return MESES[mesIndex];
}

export function diasSemanaCortos() {
  return DIAS_SEMANA;
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

export function dateKey(year, monthIndex, day) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

// Devuelve un array con los días del mes, incluyendo espacios vacíos (null)
// al principio para alinear con el día de la semana correcto (empezando en Lunes).
export function getMonthGrid(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  // getDay(): 0 = Domingo ... 6 = Sábado. Convertimos a que 0 = Lunes.
  let firstWeekday = firstDay.getDay();
  firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const grid = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= totalDays; d++) grid.push(d);
  return grid;
}

export function nombreDiaCorto(year, monthIndex, day) {
  const date = new Date(year, monthIndex, day);
  return DIAS_SEMANA[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

// Devuelve las claves ("YYYY-MM-DD") de varios días consecutivos a partir
// del indicado, cruzando de mes o de año si hace falta.
export function getWeekKeys(year, monthIndex, day, length = 7) {
  const start = new Date(year, monthIndex, day);
  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
  });
}
