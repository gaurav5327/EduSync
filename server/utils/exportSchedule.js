import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function exportToCSV(schedule) {
  const rows = [["Course", "Teacher", "Day", "Time", "Room", "Students"]];

  schedule.classes.forEach((cls) => {
    rows.push([
      cls.course,
      cls.teacher,
      cls.day,
      cls.time,
      cls.room,
      cls.students.join(", "),
    ]);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "schedule.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportToPDF(schedule) {
  const doc = new jsPDF();

  doc.text("Class Schedule", 14, 15);

  const rows = schedule.classes.map((cls) => [
    cls.course,
    cls.teacher,
    cls.day,
    cls.time,
    cls.room,
    cls.students.join(", "),
  ]);

  doc.autoTable({
    head: [["Course", "Teacher", "Day", "Time", "Room", "Students"]],
    body: rows,
    startY: 20,
  });

  doc.save("schedule.pdf");
}
