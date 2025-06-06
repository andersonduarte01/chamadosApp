import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ListaChamadas from './ListaChamadas';

export default function Chamados({ navigation }) {
  return (
    <View style={styles.container}>
      <ListaChamadas />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
});
