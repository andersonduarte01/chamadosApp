import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CadastrarUsuario() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const carregarToken = async () => {
      const savedToken = await AsyncStorage.getItem('@access_token');
      if (!savedToken) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        navigation.goBack();
        return;
      }
      setToken(savedToken);
    };

    carregarToken();
  }, []);

  async function handleSubmit() {
    if (!nome || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://smepedrabranca.com.br/api/v1/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          email,
          password,
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso.');
        setNome('');
        setEmail('');
        setPassword('');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.log(errorData);
        Alert.alert('Erro', 'Não foi possível cadastrar o usuário.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  }

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

        <Text style={styles.headerTitle}>Cadastrar Usuário</Text>
      </View>

      {/* FORMULÁRIO */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite o nome"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite o email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite a senha"
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
});
