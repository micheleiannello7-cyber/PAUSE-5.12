// PAUSE — una pagina del lettore a scorrimento a pagine: alta esattamente
// quanto lo ScrollView esterno. Il contenuto è centrato nell'area leggibile
// (sotto la barra); se è più alto della pagina, la pagina scorre al suo
// interno (nestedScrollEnabled) e il paging riprende ai suoi bordi.
import { ReactNode, useState } from "react";
import { ScrollView, View } from "react-native";

export function ReaderPage({ height, paddingTop, paddingBottom, center = true, children, testID }: {
  height: number; paddingTop: number; paddingBottom: number; center?: boolean; children: ReactNode; testID: string;
}) {
  const [tall, setTall] = useState(false);
  return (
    <View style={{ height, width: "100%" }} testID={testID}>
      <ScrollView
        nestedScrollEnabled
        scrollEnabled={tall}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_w, h) => setTall(h > height + 1)}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingTop, paddingBottom, justifyContent: center ? "center" : "flex-start" }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
