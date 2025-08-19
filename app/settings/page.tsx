'use client'
import Layout from "@/components/Layout";
import React from "react";
import { withAuth } from "@/components/withAuth";

const Settings = () => {
  return <Layout>Settings</Layout>;
};

export default withAuth(Settings);
