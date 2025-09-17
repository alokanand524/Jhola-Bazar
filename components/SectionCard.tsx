import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ImageWithLoading } from '@/components/ImageWithLoading';

interface SectionCardProps {
  title: string;
  image: string;
  category?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, image, category }) => {
  const { colors } = useTheme();
  
  const handlePress = () => {
    if (category) {
      router.push(`/category/${encodeURIComponent(title)}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.imageContainer, { backgroundColor: colors.lightGray }]}>
        <ImageWithLoading 
          source={{ uri: image }} 
          width={45} 
          height={45} 
          borderRadius={0}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});