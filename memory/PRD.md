# PRD — App (Expo + FastAPI + MongoDB)

## Problema originale
L'utente ha chiesto di: (1) analizzare l'app e rendere la preview pronta, (2) capire perché la dimensione dell'app è passata da ~30 MB a ~200 MB, (3) come ridurre le dimensioni.

## Stato attuale
- App = template starter Expo (SDK 57, RN 0.86, expo-router). Schermata singola `app/index.tsx` con immagine.
- Backend FastAPI minimale (`/api/`, `/api/status`) + MongoDB `test_database`.
- Preview VERIFICATA e funzionante (web bundle OK, backend `/api/` risponde "Hello World").
- Asset totali: 1.3 MB (nessun asset pesante nel repo attuale).

## Architettura
- Frontend: Expo Router, react-query, keyboard-controller, reanimated, gesture-handler, screens, blur, webview.
- Backend: FastAPI + Motor (async Mongo).

## Analisi dimensioni
La dimensione dell'app compilata (APK/IPA) NON dipende dagli asset del repo (solo 1.3 MB) ma da:
- runtime React Native/Hermes di base (~25-40 MB),
- numero di librerie native aggiunte,
- architetture CPU incluse (APK "universale" = arm64 + armv7 + x86 + x86_64 → 3-4x più grande),
- mancanza di minificazione R8/ProGuard e resource shrinking.

## Backlog
- P1: rimuovere dipendenze native non usate.
- P2: comprimere/convertire immagini (WebP), spostare asset pesanti su remote (Object Storage).
- P2: pubblicare come AAB (Play Store consegna per-device).

## Date
- 2026-06: analisi preview + spiegazione dimensioni app.
