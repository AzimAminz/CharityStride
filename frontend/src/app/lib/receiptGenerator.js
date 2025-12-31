import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getRegistrationType = (payment) => {
  const payableType = payment?.payable_type;

  if (payableType?.includes("ParticipantRegistration")) {
    return "participant";
  } else if (payableType?.includes("VolunteerRegistration")) {
    return "volunteer";
  } else if (payableType?.includes("Donation")) {
    return "donation";
  }

  if (payment?.payable?.participant_category) {
    return "participant";
  } else if (payment?.payable?.volunteer_role) {
    return "volunteer";
  } else if (payment?.payable?.donation_type) {
    return "donation";
  }

  return "participant";
};

export const generateReceipt = (registration, payment) => {
  const doc = new jsPDF();
  const registrationType = getRegistrationType(payment);

  // Add border
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(2);
  doc.rect(5, 5, 200, 287);

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(5, 5, 200, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, "bold");
  doc.text("PAYMENT RECEIPT", 105, 25, { align: "center" });

  doc.setFontSize(14);
  doc.setFont(undefined, "normal");

  const ngoName =
    registration?.event?.ngo?.name ||
    payment?.payable?.event?.ngo?.name ||
    "CharityStride Foundation";

  doc.text(ngoName, 105, 40, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // Receipt Details
  let yPos = 60;

  const userName =
    registration?.user?.name ||
    payment?.payable?.user?.name ||
    payment?.user?.name ||
    "N/A";
  const userEmail =
    registration?.user?.email ||
    payment?.payable?.user?.email ||
    payment?.user?.email ||
    "N/A";

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
    ["Name:", userName],
    ["Email:", userEmail],
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
  });

  // Event Details - Dynamic
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");

  let detailsTitle = "Event Details";
  let eventDetails = [];

  const eventTitle =
    registration?.event?.title || payment?.payable?.event?.title || "N/A";
  const eventDate =
    registration?.event?.start_date || payment?.payable?.event?.start_date;

  if (registrationType === "participant") {
    detailsTitle = "Participant Registration Details";

    const categoryName =
      registration?.participant_category?.category_name ||
      payment?.payable?.participant_category?.category_name ||
      "N/A";
    const bibNumber =
      registration?.bib_number || payment?.payable?.bib_number || "N/A";

    eventDetails = [
      ["Event:", eventTitle],
      ["Category:", categoryName],
      ["BIB Number:", bibNumber],
      [
        "Event Date:",
        eventDate
          ? new Date(eventDate).toLocaleDateString("en-MY", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A",
      ],
    ];
  } else if (registrationType === "volunteer") {
    detailsTitle = "Volunteer Registration Details";
    eventDetails = [
      ["Event:", eventTitle],
      ["Role:", registration?.volunteer_role?.role_name || "N/A"],
      ["Shift:", registration?.volunteer_shift?.shift_name || "N/A"],
      [
        "Date:",
        registration?.volunteer_shift?.shift_date
          ? new Date(
              registration.volunteer_shift.shift_date
            ).toLocaleDateString("en-MY")
          : "N/A",
      ],
      [
        "Time:",
        registration?.volunteer_shift
          ? `${registration.volunteer_shift.start_time} - ${registration.volunteer_shift.end_time}`
          : "N/A",
      ],
    ];
  } else if (registrationType === "donation") {
    detailsTitle = "Donation Details";
    eventDetails = [
      ["Event/Campaign:", eventTitle],
      [
        "Donation Type:",
        registration?.donation_type === "money"
          ? "Monetary Donation"
          : "Item Donation",
      ],
      [
        "Date:",
        registration?.created_at
          ? new Date(registration.created_at).toLocaleDateString("en-MY")
          : "N/A",
      ],
    ];
  }

  doc.text(detailsTitle, 15, yPos);
  yPos += 5;

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
  });

  // Payment Details
  yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Payment Details", 15, yPos);
  yPos += 5;

  let description = "";
  if (registrationType === "participant") {
    const categoryName =
      registration?.participant_category?.category_name ||
      payment?.payable?.participant_category?.category_name ||
      "Registration";
    description = `Registration Fee - ${categoryName}`;
  } else if (registrationType === "volunteer") {
    description = `Volunteer Registration`;
  } else {
    description = "Donation";
  }

  const amount = payment?.amount ? (payment.amount / 100).toFixed(2) : "0.00";

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Amount (RM)"]],
    body: [[description, amount]],
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

  // Total
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
    : `receipt-${payment?.payment_reference || "download"}.pdf`;
  doc.save(filename);
};
