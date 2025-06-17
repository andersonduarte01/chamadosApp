import React from 'react';
import { View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogoutButton({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@access_token');
      await AsyncStorage.removeItem('@refresh_token');
      navigation.replace('Inicio');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <SafeAreaView>
      <View style={{ padding: 10 }}>
        <Button title="Sair" color="red" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

