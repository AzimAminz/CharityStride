

import RegisterForm from './components/RegisterForm';
import GuestLayout from '../guest/layout';

export const metadata = {
    title: 'Register',
    description: 'Create a new account on MyApp.',
};

const page = () => {
    return (
        <GuestLayout>
            <RegisterForm />
        </GuestLayout>
    );
};

export default page;