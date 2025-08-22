import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const banners = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400&h=200&fit=crop',
];

export const BannerCarousel: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % banners.length;
      scrollRef.current?.scrollTo({
        x: currentIndex.current * width * 0.9,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {banners.map((banner, index) => (
          <Image key={index} source={{ uri: banner }} style={styles.banner} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    marginVertical: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  banner: {
    width: width * 0.9,
    height: 130,
    borderRadius: 12,
    marginRight: 16,
  },
});