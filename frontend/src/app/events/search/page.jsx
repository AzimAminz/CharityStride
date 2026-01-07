import React from "react";
import Layout from "../../components/Layout";
import SearchPageClient from "./SearchPage";

export const metadata = {
  title: "Search Events",
};

export default function SearchPage() {
  return (
    <Layout>
      <SearchPageClient />
    </Layout>
  );
}
