import React from 'react';
import Layout from '../components/Layout';
import EventsPage from './EventPage'; // Pastikan import correct

const page = () => {
    return (
       <Layout>
        <EventsPage/>
       </Layout>
    );
};

export default page;