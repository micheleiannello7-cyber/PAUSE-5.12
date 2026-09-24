// PAUSE — scheda informativa della storia (presentazione, sotto l'introduzione):
// tre tessere "3D" — Tipo di storia · Categoria · Tempo di lettura — nello
// stesso linguaggio delle icone categoria: oggetto tridimensionale grande su un
// alone colorato, tessera in vetro con bordo luminoso e riflesso in alto.
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, Line, RadialGradient, Stop } from "react-native-svg";

import { StoryPreview, isLesson } from "@/src/api";
import { makeStyles, spacing, typography, useTheme, withAlpha } from "@/src/theme";
import { useI18n } from "@/src/i18n";
import { KindIcon } from "./kind-icon";
import { CategoryArtMark } from "./category-artwork";

const ICON = 46;

export function StoryInfoGrid({ story, minutes, testID = "story-info-grid" }: { story: StoryPreview; minutes: number; testID?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const lesson = isLesson(story);
  const category = story.category_name.split("·")[0].trim();
  const cells = [
    { id: "kind", label: t.info_kind, value: lesson ? t.lesson_badge : t.curiosity_badge, tint: lesson ? colors.cyan : colors.warning,
      icon: <KindIcon kind={lesson ? "lessons" : "stories"} size={ICON} glow={false} testID={`${testID}-kind-icon`} /> },
    { id: "category", label: t.info_category, value: category, tint: story.category_color,
      icon: <CategoryArtMark categoryId={story.category_id} color={story.category_color} size={ICON} testID={`${testID}-category-icon`} /> },
    { id: "time", label: t.info_time, value: `${minutes} ${t.min}`, tint: colors.brandSecondary,
      icon: <ClockMark size={ICON} body={colors.brandSecondary} hands={colors.cyan} face={colors.textWarm} /> },
  ];
  return (
    <View style={styles.grid} testID={testID}>
      {cells.map((c) => (
        <View key={c.id} style={styles.cell} testID={`${testID}-${c.id}`}>
          <LinearGradient
            pointerEvents="none"
            colors={[withAlpha(c.tint, 0.26), withAlpha(c.tint, 0.06), withAlpha(colors.onGradient, 0.03)]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Riflesso in alto: la tessera sembra un blocco di vetro. */}
          <LinearGradient
            pointerEvents="none"
            colors={[withAlpha(colors.onGradient, 0.22), withAlpha(colors.onGradient, 0)]}
            style={styles.shine}
          />
          {/* Alone colorato dietro l'oggetto 3D. */}
          <View pointerEvents="none" style={[styles.halo, { backgroundColor: withAlpha(c.tint, 0.3), boxShadow: `0px 0px 26px ${withAlpha(c.tint, 0.55)}` as any }]} />
          <View style={styles.iconWrap}>{c.icon}</View>
          <Text style={styles.value} numberOfLines={2} testID={`${testID}-${c.id}-value`}>{c.value}</Text>
          <Text style={styles.label} numberOfLines={1} testID={`${testID}-${c.id}-label`}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

// Orologio "clay 3D" in vettoriale: corpo tondo con luce da in alto a sinistra,
// quadrante chiaro leggermente incassato, lancette spesse, bottoncino in alto.
function ClockMark({ size, body, hands, face }: { size: number; body: string; hands: string; face: string }) {
  const c = size / 2;
  const r = size * 0.42;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="clockBody" cx="35%" cy="30%" r="80%">
          <Stop offset="0" stopColor={withAlpha("#FFFFFF", 0.55)} />
          <Stop offset="0.35" stopColor={body} />
          <Stop offset="1" stopColor={withAlpha("#000000", 0.35)} />
        </RadialGradient>
        <RadialGradient id="clockFace" cx="45%" cy="40%" r="70%">
          <Stop offset="0" stopColor={face} />
          <Stop offset="1" stopColor={withAlpha(face, 0.72)} />
        </RadialGradient>
      </Defs>
      {/* ombra a terra */}
      <Ellipse cx={c} cy={size * 0.93} rx={r * 0.7} ry={r * 0.14} fill={withAlpha("#000000", 0.35)} />
      {/* bottoncino */}
      <Circle cx={c} cy={size * 0.12} r={size * 0.075} fill={body} />
      <Circle cx={c - size * 0.02} cy={size * 0.105} r={size * 0.035} fill={withAlpha("#FFFFFF", 0.5)} />
      {/* corpo */}
      <Circle cx={c} cy={c + size * 0.03} r={r} fill={body} />
      <Circle cx={c} cy={c + size * 0.03} r={r} fill="url(#clockBody)" />
      {/* quadrante */}
      <Circle cx={c} cy={c + size * 0.03} r={r * 0.68} fill="url(#clockFace)" />
      {/* lancette */}
      <Line x1={c} y1={c + size * 0.03} x2={c} y2={c - r * 0.42} stroke={hands} strokeWidth={size * 0.075} strokeLinecap="round" />
      <Line x1={c} y1={c + size * 0.03} x2={c + r * 0.36} y2={c + size * 0.03 + r * 0.12} stroke={hands} strokeWidth={size * 0.075} strokeLinecap="round" />
      <Circle cx={c} cy={c + size * 0.03} r={size * 0.045} fill={hands} />
    </Svg>
  );
}

const useStyles = makeStyles((colors) => ({
  grid: { flexDirection: "row", gap: spacing.sm + 2 },
  cell: {
    flex: 1, minHeight: 128, paddingTop: spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.xs, gap: 3,
    alignItems: "center", justifyContent: "flex-end", borderRadius: 22, overflow: "hidden",
    backgroundColor: withAlpha(colors.onGradient, 0.04), borderWidth: 1, borderColor: withAlpha(colors.onGradient, 0.16),
    boxShadow: `0px 10px 24px ${colors.glassShadow}` as any,
  },
  shine: { position: "absolute", top: 0, left: 0, right: 0, height: 34 },
  halo: { position: "absolute", top: 14, width: 44, height: 44, borderRadius: 22 },
  iconWrap: { height: ICON + 6, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  value: { color: colors.textWarm, fontFamily: typography.bodyBold, fontSize: 13.5, lineHeight: 16, textAlign: "center" },
  label: { color: withAlpha(colors.textWarm, 0.55), fontFamily: typography.bodyBold, fontSize: 9, letterSpacing: 1.3, textTransform: "uppercase", textAlign: "center" },
}));
