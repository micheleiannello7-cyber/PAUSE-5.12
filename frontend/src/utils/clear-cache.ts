import { Platform } from "react-native";
import { Image } from "expo-image";
import { Paths, Directory } from "expo-file-system";

/**
 * Svuota la cache temporanea (immagini + file temporanei) all'avvio.
 * NON tocca AsyncStorage / SecureStore, quindi login e dati utente restano.
 */
export async function clearAppCache(): Promise<void> {
  try {
    await Promise.all([Image.clearMemoryCache(), Image.clearDiskCache()]);
  } catch {
    // ignore
  }

  if (Platform.OS === "web") return;

  try {
    const cache = new Directory(Paths.cache);
    for (const entry of cache.list()) {
      try {
        entry.delete();
      } catch {
        // file in uso: ignora
      }
    }
  } catch {
    // ignore
  }
}
