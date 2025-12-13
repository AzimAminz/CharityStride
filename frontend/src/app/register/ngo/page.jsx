import SimpleNgoRegisterForm from "./components/SimpleNgoRegisterForm";
import { getFormStaticData } from "@/app/lib/ngoStaticData";

// Server-side validation & authentication
export default async function NgoRegisterPage() {
  const formData = await getFormStaticData();

  return (
    <SimpleNgoRegisterForm
      states={formData.states}
      categories={formData.categories}
      registrationTypes={formData.registrationTypes}
    />
  );
}
