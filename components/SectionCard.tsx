import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.lightGray, borderColor: colors.primary }]} onPress={handlePress}>
      <ImageWithLoading 
        source={{ uri: image }} 
        width={50} 
        height={50} 
        borderRadius={25}
      />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 100,
    marginRight: 12,
  },

  title: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});