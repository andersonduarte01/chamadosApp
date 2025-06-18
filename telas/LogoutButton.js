import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function LogoutScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@access_token');
      await AsyncStorage.removeItem('@refresh_token');
      navigation.replace('Inicio');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      )}

      {/* TOPO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sair</Text>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.text}>
            Tem certeza que deseja sair do aplicativo?
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D47A1',
  },
  header: {
    backgroundColor: '#0D47A1',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#E3ECF3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
});
