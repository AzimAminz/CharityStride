

import RegisterForm from './RegisterForm';

export const metadata = {
    title: 'Register',
    description: 'Create a new account on MyApp.',
};

const page = () => {
    return (
        <RegisterForm />
    );
};

export default page;