import LoginForm from "./components/LoginForm";
import GuestLayout from "../guest/layout";


export const metadata = {
  title: "Login",
  description: "Log in to your CharityStride account and continue your journey of making a difference.",
};


const page = () => {
    return (
        <GuestLayout>
            <LoginForm />
        </GuestLayout>
    );
};

export default page;
