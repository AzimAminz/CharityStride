export async function getFormStaticData() {
  const states = [
    { value: "johor", label: "Johor" },
    { value: "kedah", label: "Kedah" },
    { value: "kelantan", label: "Kelantan" },
    { value: "melaka", label: "Melaka" },
    { value: "negeri_sembilan", label: "Negeri Sembilan" },
    { value: "pahang", label: "Pahang" },
    { value: "penang", label: "Penang" },
    { value: "perak", label: "Perak" },
    { value: "perlis", label: "Perlis" },
    { value: "selangor", label: "Selangor" },
    { value: "terengganu", label: "Terengganu" },
    { value: "sabah", label: "Sabah" },
    { value: "sarawak", label: "Sarawak" },
    { value: "kl", label: "Kuala Lumpur" },
    { value: "labuan", label: "Labuan" },
    { value: "putrajaya", label: "Putrajaya" },
  ];

  const categories = [
    "Animal Welfare",
    "Children & Youth",
    "Community Development",
    "Disability Services",
    "Education & Literacy",
    "Environmental Conservation",
    "Healthcare & Medical",
    "Human Rights",
    "Poverty Alleviation",
    "Religious & Spiritual",
    "Women Empowerment",
    "Other",
  ];

  const registrationTypes = [
    "ROS (Registrar of Societies)",
    "ROB (Registrar of Businesses)",
    "Company Commission",
    "Government Agency",
    "International NGO",
    "Other",
  ];

  return { states, categories, registrationTypes };
}
