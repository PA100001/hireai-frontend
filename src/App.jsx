import React from "react";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeModeProvider } from "./contexts/ThemeModeContext"; // Import ThemeModeProvider
import AppRoutes from "./routes/AppRoutes";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
const queryClient = new QueryClient({
  /* ... */
});

function App() {
  return (
    <ThemeModeProvider>
      {" "}
      // Use ThemeModeProvider
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SnackbarProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeModeProvider>
  );
}

export default App;
