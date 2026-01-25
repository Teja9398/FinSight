import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  AppBar,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Home";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useAuth } from "../contexts/AuthContext";

const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER_URL;

const drawerWidth = 300;

const navItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    to: "/dashboard",
  },
  {
    label: "Transactions",
    icon: <ReceiptLongIcon />,
    to: "/transactions",
  },
];

function AppSidebar({ window }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const [summaryData, setSummaryData] = React.useState({});
  const [netBalance, SetNetBalance] = React.useState(0);

  useEffect(() => {
    fetch(`${BACKEND_SERVER}/transactions/totalincomeandexpenses`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("summary data: ", data);
        setSummaryData(data);
      });
    fetch(`${BACKEND_SERVER}/transactions/getnetbalance`, {
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((data) => {
        SetNetBalance(data.netbalance);
      }); //Need to be filled
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Container>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: "#3a8dde",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "#fff" }}>
            ₹
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            FinSight
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial Tracker
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          NAVIGATION
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
            component={NavLink}
            to={item.to}
            sx={{
              color: "grey",
              padding: "10px 16px",
              borderRadius: 2,
              margin: "4px 0 2px 0",
              "&.active": {
                background: "#3a8dde",
                color: "#fff",
                "& .MuiListItemIcon-root": { color: "#fff" },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          QUICK STATS
        </Typography>
      </Box>
      <List>
        <ListItem sx={{ bgcolor: "#eaffef", borderRadius: 2, mb: 1 }}>
          <ListItemIcon>
            <TrendingUpIcon sx={{ color: "#1a7f37" }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{ color: "#1a7f37", fontWeight: 600 }}
              >
                Income This Month
              </Typography>
            }
            secondary={
              <Typography
                variant="h6"
                sx={{ color: "#1a7f37", fontWeight: 700 }}
              >
                +₹{summaryData.income}
              </Typography>
            }
          />
        </ListItem>
        <ListItem sx={{ bgcolor: "#eaf3ff", borderRadius: 2 }}>
          <ListItemIcon>
            <AccountBalanceWalletIcon sx={{ color: "#1a4fff" }} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{ color: "#1a4fff", fontWeight: 600 }}
              >
                Net Balance
              </Typography>
            }
            secondary={
              <Typography
                variant="h6"
                sx={{ color: "#1a4fff", fontWeight: 700 }}
              >
                ₹{netBalance}
              </Typography>
            }
          />
        </ListItem>
      </List>
    </Container>
  );

  // For mobile container
  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              FinSight
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      {/* Drawer for desktop */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          container={container}
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
          <Box sx={{ px: 2, py: 3, mt: "auto" }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#e3e6f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <Typography variant="h6" sx={{ color: "#3a8dde" }}>
                  {user &&
                  user.name &&
                  typeof user.name === "string" &&
                  user.name.length > 0
                    ? user.name.charAt(0).toUpperCase()
                    : user && user.email
                    ? user.email.charAt(0).toUpperCase()
                    : "NA"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {/* {user ? user.name?user.name:user.email.split("@")[0] : "User Name"} */}
                  {user && user.name}
                  {console.log("user:", user)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user ? user.email : "Notfound"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <NavLink
                to="/profile"
                style={{ textDecoration: "none", flex: 1 }}
              >
                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    color: "#3a8dde",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#e3e6f0" },
                  }}
                >
                  View Profile
                </Box>
              </NavLink>
              <Box
                sx={{
                  bgcolor: "#fdeaea",
                  color: "#d32f2f",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  flex: 1,
                  "&:hover": { bgcolor: "#f8d7da" },
                }}
                onClick={() => {
                  // Add your logout logic here
                  logout();
                  window.location.href = "/login";
                }}
              >
                Logout
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Box>
      {/* Add a toolbar spacer for mobile so content isn't hidden under AppBar */}
      {isMobile && <Toolbar />}
    </>
  );
}

export default AppSidebar;
