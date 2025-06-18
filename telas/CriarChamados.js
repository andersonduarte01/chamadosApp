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
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CriarChamado() {
  const [manutencao, setManutencao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getToken = async () => {
      const savedToken = await AsyncStorage.getItem('@access_token');
      if (!savedToken) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        navigation.goBack();
        return;
      }
      setToken(savedToken);
    };
    getToken();
  }, []);

  async function handleSubmit() {
    if (!manutencao || !descricao) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.100:8000/api/chamadas-usuario/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ manutencao: Number(manutencao), descricao }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Chamado criado com sucesso.');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Não foi possível criar o chamado.');
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

        <Text style={styles.headerTitle}>Novo Chamado</Text>
      </View>


      {/* FORMULÁRIO */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Manutenção</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={manutencao}
              onValueChange={(itemValue) => setManutencao(itemValue)}
              style={styles.picker}
              dropdownIconColor="#1565C0"
            >
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Computador" value="1" />
              <Picker.Item label="Impressora" value="2" />
              <Picker.Item label="Computador e Impressora" value="3" />
              <Picker.Item label="Outro" value="4" />
            </Picker>
          </View>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o problema"
            multiline
            textAlignVertical="top"
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
              <Text style={styles.buttonText}>Abrir Chamado</Text>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 24,
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
