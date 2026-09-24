// PAUSE — griglia informativa della storia (presentazione, sotto l'introduzione):
// un'unica scheda in vetro con tre colonne separate da linee sottili —
// Tipo di storia · Categoria (icona 3D) · Tempo di lettura. In ogni colonna:
// icona, valore in evidenza, etichetta piccola. Dati presi dalla storia stessa.
import { View, Text } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

import { StoryPreview, isLesson } from "@/src/api";
import { makeStyles, radius, spacing, typography, useTheme, withAlpha } from "@/src/theme";
import { useI18n } from "@/src/i18n";
import { KindIcon } from "./kind-icon";
import { CategoryArtMark } from "./category-artwork";

export function StoryInfoGrid({ story, minutes, testID = "story-info-grid" }: { story: StoryPreview; minutes: number; testID?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const lesson = isLesson(story);
  const category = story.category_name.split("·")[0].trim();
  const cells = [
    { id: "kind", label: t.info_kind, value: lesson ? t.lesson_badge : t.curiosity_badge, glow: colors.cyan,
      icon: <KindIcon kind={lesson ? "lessons" : "stories"} size={30} glow={false} testID={`${testID}-kind-icon`} /> },
    { id: "category", label: t.info_category, value: category, glow: story.category_color,
      icon: <CategoryArtMark categoryId={story.category_id} color={story.category_color} size={32} testID={`${testID}-category-icon`} /> },
    { id: "time", label: t.info_time, value: `${minutes} ${t.min}`, glow: colors.brand,
      icon: <Ionicons name="time-outline" size={27} color={colors.brand} /> },
  ];
  return (
    <View style={styles.card} testID={testID}>
      {cells.map((c, i) => (
        <View key={c.id} style={[styles.cell, i > 0 && styles.cellDivider]} testID={`${testID}-${c.id}`}>
          <View pointerEvents="none" style={[styles.glow, { backgroundColor: withAlpha(c.glow, 0.18) }]} />
          <View style={styles.iconWrap}>{c.icon}</View>
          <Text style={styles.value} numberOfLines={2} testID={`${testID}-${c.id}-value`}>{c.value}</Text>
          <Text style={styles.label} numberOfLines={1} testID={`${testID}-${c.id}-label`}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: "row", alignItems: "stretch", borderRadius: radius.lg, overflow: "hidden",
    backgroundColor: withAlpha(colors.onGradient, 0.05), borderWidth: 1, borderColor: withAlpha(colors.onGradient, 0.12),
  },
  cell: { flex: 1, minHeight: 104, paddingVertical: spacing.md, paddingHorizontal: spacing.xs, alignItems: "center", justifyContent: "center", gap: 4 },
  cellDivider: { borderLeftWidth: 1, borderLeftColor: withAlpha(colors.onGradient, 0.1) },
  glow: { position: "absolute", top: -34, left: "22%", right: "22%", height: 64, borderRadius: 40 },
  iconWrap: { height: 36, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  value: { color: colors.textWarm, fontFamily: typography.bodyBold, fontSize: 13, lineHeight: 16, textAlign: "center" },
  label: { color: withAlpha(colors.textWarm, 0.55), fontFamily: typography.bodyBold, fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" },
}));
