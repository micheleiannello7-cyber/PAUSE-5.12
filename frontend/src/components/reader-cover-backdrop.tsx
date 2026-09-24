// PAUSE — copertina del lettore. Un solo livello fisso dietro allo scroll:
// a riposo riempie la fascia alta della presentazione (tutta larghezza), e
// scorrendo verso i capitoli si ingrandisce fino a coprire lo schermo e si
// scurisce, diventando lo sfondo cinematografico della lettura.
// La trasformazione usa SOLO transform (translate + scale) e opacità: niente
// layout animato, niente blur → fluida anche su Android.
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { Story, isLesson } from "@/src/api";
import { makeStyles, useTheme, withAlpha } from "@/src/theme";
import { StoryHero } from "./story-hero";
import { LessonCover } from "./lesson-cover";

export function ReaderCoverBackdrop({ story, scrollY, coverH, screenW, screenH }: {
  story: Story; scrollY: SharedValue<number>;
  /** Altezza della fascia copertina a riposo (in alto, tutta larghezza). */
  coverH: number; screenW: number; screenH: number;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const hasCover = !!story.hero_image_generated || (!isLesson(story) && !!story.hero_image);

  // Il livello ha misura fissa (larghezza schermo × 4:3 circa): a riposo è
  // centrato verticalmente sulla fascia copertina; a fine trasformazione è
  // scalato e centrato sullo schermo intero.
  const layerH = Math.max(coverH, Math.round(screenW * 4 / 3));
  const restY = -(layerH - coverH) / 2;
  const endScale = Math.max(1, screenH / layerH);
  const endY = screenH / 2 - layerH / 2;
  const morphEnd = coverH;

  const image = useAnimatedStyle(() => {
    const y = scrollY.value;
    const p = interpolate(y, [0, morphEnd], [0, 1], Extrapolation.CLAMP);
    // Tirando verso il basso oltre l'inizio la foto si "stira" un po'.
    const stretch = y < 0 ? Math.min(0.14, -y / 520) : 0;
    return {
      transform: [
        { translateY: interpolate(p, [0, 1], [restY, endY]) + (y < 0 ? -y * 0.5 : 0) },
        { scale: interpolate(p, [0, 1], [1, endScale]) + stretch },
      ],
    };
  });
  const dim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, morphEnd * 0.5, morphEnd, morphEnd + screenH], [0, 0.35, 0.66, 0.74], Extrapolation.CLAMP),
  }));
  const fade = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [morphEnd * 0.3, morphEnd], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.box, { width: screenW, height: screenH }]} pointerEvents="none" testID="chapter-cover-bg">
      <Animated.View style={[styles.layer, { width: screenW, height: layerH }, image]}>
        {hasCover ? (
          <StoryHero story={story} style={StyleSheet.absoluteFill} transition={400} />
        ) : (
          <LessonCover color={colors.muted} icon={story.category_icon} iconSize={72} showBadge={false} style={StyleSheet.absoluteFill} />
        )}
        {/* Tinta notte: porta ogni foto verso la stessa temperatura blu-notte. */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.nightTint }]} />
      </Animated.View>
      {/* Velo scuro che cresce con lo scroll: il testo resta protagonista. */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }, dim]} />
      {/* Fusione verso il fondo pagina, solo quando è diventata sfondo. */}
      <Animated.View style={[StyleSheet.absoluteFill, fade]}>
        <LinearGradient
          colors={[withAlpha(colors.surface, 0), withAlpha(colors.surface, 0), withAlpha(colors.surface, 0.35), withAlpha(colors.surface, 0.75), colors.surface]}
          locations={[0, 0.5, 0.7, 0.88, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  box: { position: "absolute", top: 0, left: 0, overflow: "hidden", backgroundColor: colors.surface },
  layer: { position: "absolute", top: 0, left: 0, overflow: "hidden", backgroundColor: colors.surfaceSecondary },
}));
