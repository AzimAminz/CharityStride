import React from "react";
import Layout from "../components/Layout";
import EventsPageClient from "./EventPage";

export const metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <Layout>
      <EventsPageClient />
    </Layout>
  );
}
