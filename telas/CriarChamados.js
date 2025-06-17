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
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function CriarChamados() {
  const [manutencao, setManutencao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getToken = async () => {
      const savedToken = await AsyncStorage.getItem('@access_token');
      if (!savedToken) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }
      setToken(savedToken);
    };
    getToken();
  }, []);

  async function handleSubmit() {
    if (!manutencao || !descricao) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.0.103:8000/api/chamadas-usuario/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ manutencao, descricao }),
      });

      if (response.ok) {
        Alert.alert(
          'Sucesso',
          'Chamado criado com sucesso',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ],
          { cancelable: false }
        );

        setManutencao('');
        setDescricao('');
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na comunicação com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      )}

      <View style={styles.container}>
        {/* Topo */}
        <View style={styles.top}>
          <Text style={styles.title}>Novo Chamado</Text>
        </View>

        {/* Formulário */}
        <View style={styles.bottom}>
          <View style={styles.card}>
            <Text style={styles.label}>Tipo de Manutenção</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={manutencao}
                onValueChange={(itemValue) => setManutencao(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
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
              placeholder="Descreva o problema..."
              multiline
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Enviando...' : 'Criar Chamado'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D47A1', // Mantém a cor do topo na borda superior dos devices
  },

  container: {
    flex: 1,
    backgroundColor: '#E3ECF3',
  },

  top: {
    flex: 1,
    backgroundColor: '#0D47A1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  bottom: {
    flex: 2,
    padding: 10,
    marginTop: -40,    
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center'
  },

  label: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold'
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },

  picker: {
    height: 50,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },

  pickerItem: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },

  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 24,
  },

  button: {
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});
