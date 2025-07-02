import React from "react";
import AppSidebar from "../components/AppSidebar";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { Box,Typography } from "@mui/material";

const Layout = () => {
return (
      <div style={{ display: "flex", height: "100vh" }}>
            <AppSidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <header style={{ minWidth: "100%", height: 80, background: "#fff", borderBottom: "1px solid #e0e0e0" ,p: 4 }}>
                        {/* Empty header for spacing and appearance */}
                        <Header />
                  </header>
                  <main
                        style={{
                              flex: 1,
                              padding: 24,
                              minHeight: "calc(100vh - 80px)",
                              background: "#f5f5f5",
                        }}
                  >
                        <Box sx={{ mt: { xs: 2, md: 4 }, maxWidth: "md", mx: "auto" }}>
                              <Outlet />
                        </Box>
                  </main>
            </div>
      </div>
);
};

export default Layout;
