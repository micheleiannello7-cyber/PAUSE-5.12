import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { clearAppCache } from "@/src/utils/clear-cache";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true)

export default function RootLayout() {
  // Svuota la cache temporanea ad ogni apertura (non tocca i dati utente).
  useEffect(() => {
    clearAppCache();
  }, []);

  // One app level ErrorBoundary; a render crash shows a reload screen
  // instead of a blank app.
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </KeyboardProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
