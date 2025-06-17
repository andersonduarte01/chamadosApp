import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const logo = require('../imagens/monitor.png');

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://192.168.0.103:8000/api/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      if (access) {
        await AsyncStorage.setItem('@access_token', access);
        await AsyncStorage.setItem('@refresh_token', refresh);
        navigation.replace('Main');
      } else {
        Alert.alert('Erro', 'Token não recebido da API');
      }
    } catch (error) {
      console.log('Erro na API:', error.response?.data || error.message);
      Alert.alert('Erro', 'Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Animatable.Image
          animation="fadeInDown"
          delay={200}
          source={logo}
          style={styles.image}
          resizeMode="contain"
        />

        <Animatable.Text
          animation="fadeIn"
          delay={300}
          style={styles.welcomeText}
        >
          Bem-vindo!
        </Animatable.Text>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.form}>
          <TextInput
            placeholder="Usuário"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#777"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
          ) : (
            <Button title="Entrar" onPress={login} color="#1976D2" />
          )}
        </Animatable.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    backgroundColor: '#ffffffdd',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  loader: {
    marginTop: 10,
  },
});
