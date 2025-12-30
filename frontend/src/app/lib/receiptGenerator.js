import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReceipt = (registration, payment) => {
  const doc = new jsPDF();

  // Add border around entire page
  doc.setDrawColor(16, 185, 129); // Green border
  doc.setLineWidth(2);
  doc.rect(5, 5, 200, 287);

  // Header with green background
  doc.setFillColor(16, 185, 129);
  doc.rect(5, 5, 200, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, "bold");
  doc.text("PAYMENT RECEIPT", 105, 25, { align: "center" });

  doc.setFontSize(14);
  doc.setFont(undefined, "normal");
  const ngoName = registration?.event?.ngo?.name || "Test NGO Organization";
  doc.text(ngoName, 105, 40, { align: "center" });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Receipt Details Section
  let yPos = 60;

  const receiptDetails = [
    ["Receipt No:", payment?.payment_reference || "N/A"],
    [
      "Date:",
      payment?.created_at
        ? new Date(payment.created_at).toLocaleString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
    ],
    ["Participant:", registration?.user?.name || "N/A"],
    ["Email:", registration?.user?.email || "N/A"],
  ];

  autoTable(doc, {
    startY: yPos,
    body: receiptDetails,
    theme: "plain",
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 11,
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 50,
        fillColor: [249, 250, 251],
      },
      1: {
        fontStyle: "normal",
        cellWidth: "auto",
      },
    },
    didDrawCell: (data) => {
      // Add bottom border to each row
      if (data.section === "body") {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  // Event Details Section
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Event Details", 15, yPos);
  yPos += 5;

  const eventDetails = [
    ["Event:", registration?.event?.title || "N/A"],
    ["Category:", registration?.participant_category?.category_name || "N/A"],
    ["BIB Number:", registration?.bib_number || "N/A"],
    [
      "Event Date:",
      registration?.event?.start_date
        ? new Date(registration.event.start_date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "N/A",
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    body: eventDetails,
    theme: "plain",
    margin: { left: 15, right: 15 },
    styles: {
      fontSize: 11,
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 50,
        fillColor: [249, 250, 251],
      },
      1: {
        fontStyle: "normal",
        cellWidth: "auto",
      },
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  // Payment Details Section
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Payment Details", 15, yPos);
  yPos += 5;

  const categoryName =
    registration?.participant_category?.category_name || "N/A";
  const amount = payment?.amount ? (payment.amount / 100).toFixed(2) : "0.00";

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Amount (RM)"]],
    body: [[`Registration Fee - ${categoryName}`, amount]],
    theme: "plain",
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 11,
      cellPadding: 4,
    },
    styles: {
      fontSize: 11,
      cellPadding: 4,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { halign: "right", cellWidth: "auto" },
    },
  });

  // Total Section
  yPos = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Paid: RM ${amount}`, 195, yPos, { align: "right" });

  // Footer
  yPos = 275;
  doc.setFontSize(9);
  doc.setFont(undefined, "italic");
  doc.setTextColor(107, 114, 128);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    105,
    yPos,
    { align: "center" }
  );

  return doc;
};

export const previewReceipt = (registration, payment) => {
  const doc = generateReceipt(registration, payment);
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
};

export const downloadReceipt = (registration, payment) => {
  const doc = generateReceipt(registration, payment);
  const filename = registration?.bib_number
    ? `receipt-${registration.bib_number}.pdf`
    : "receipt.pdf";
  doc.save(filename);
};
