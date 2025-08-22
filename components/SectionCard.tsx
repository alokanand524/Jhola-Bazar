import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

interface SectionCardProps {
  title: string;
  image: string;
  category?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, image, category }) => {
  const handlePress = () => {
    if (category) {
      router.push(`/category/${encodeURIComponent(title)}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#00B761',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 100,
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});