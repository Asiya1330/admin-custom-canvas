'use client'
import Layout from "@/components/Layout";
import React from "react";
import { withAuth } from "@/components/withAuth";

const Settings = () => {
  return <Layout>Seetings</Layout>;
};

export default withAuth(Settings);
