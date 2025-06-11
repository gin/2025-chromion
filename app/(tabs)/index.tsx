import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Quick start</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Use GPS</ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Record</ThemedText> a golf shot.
          {'\n'}
          <ThemedText type="defaultSemiBold">Pick</ThemedText> golf club.
          {'\n'}
          <ThemedText type="defaultSemiBold">Walk</ThemedText> to your ball.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore scorecard</ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Distance</ThemedText> for each club you hit.
          {'\n'}
          <ThemedText type="defaultSemiBold">Shots took</ThemedText> for each hole.
          {'\n'}
          <ThemedText type="defaultSemiBold">Score</ThemedText> for the round.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Review your performance</ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Gapping</ThemedText> between clubs.
          {'\n'}
          <ThemedText type="defaultSemiBold">Consistency</ThemedText> per club.
          {'\n'}
          <ThemedText type="defaultSemiBold">Trends</ThemedText> in your game.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
