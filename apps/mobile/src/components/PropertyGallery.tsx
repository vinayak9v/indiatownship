import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import type { PropertyImage } from '@indiatownship/types';
import { colors, radius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = 64;

interface PropertyGalleryProps {
  images: PropertyImage[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0);
  if (!images.length) return null;

  return (
    <View>
      {/* Main image */}
      <Image
        source={{ uri: images[selected].url }}
        style={styles.main}
        contentFit="cover"
        transition={200}
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <FlatList
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelected(index)}
              style={[styles.thumbWrap, index === selected && styles.thumbActive]}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.thumb}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { width: SCREEN_WIDTH, height: 240 },
  thumbs: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  thumbWrap: { borderRadius: radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: colors.navy },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE },
});
