import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';

export default function EditarChamado() {
  
  const route = useRoute();
  const { chamadoId } = route.params;
  const [statusChamado, setStatusChamado] = useState('');

  const [manutencao, setManutencao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChamado = async () => {
      const savedToken = await AsyncStorage.getItem('@access_token');
      if (!savedToken) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }
      setToken(savedToken);

      try {
        const res = await fetch(`http://192.168.0.114:8000/api/chamadas/${chamadoId}/`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const data = await res.json();
        setManutencao(data.manutencao?.toString());
        setDescricao(data.descricao);
        setStatusChamado(data.status_chamado?.toString());

      } catch (err) {
        Alert.alert('Erro', 'Falha ao carregar dados do chamado.');
      } finally {
        setLoading(false);
      }
    };

    fetchChamado();
  }, [chamadoId]);

  async function handleSubmit() {
   
  if (!manutencao || !descricao) {
    Alert.alert('Erro', 'Preencha todos os campos');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`http://192.168.0.114:8000/api/chamadas/${chamadoId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        manutencao,
        descricao,
        status_chamado: statusChamado,
      }),
    });

    if (response.ok) {
            Alert.alert(
              'Sucesso',
              'Chamado atualizado com sucesso',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('ListaChamadas'),
                },
              ],
              { cancelable: false }
            );
    
            setManutencao('');
            setDescricao('');
          } else {
      const errorData = await response.json();
      console.error('Erro na atualização:', errorData);
      Alert.alert('Erro', 'Não foi possível atualizar o chamado.');
    }
  } catch (error) {
    console.error('Erro:', error);
    Alert.alert('Erro', 'Ocorreu um erro ao atualizar o chamado.');
  } finally {
    setLoading(false);
  }
}


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      )}

      {/* TOPO COM GRADIENTE */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.flexOne}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 40, left: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Editar Chamado</Text>
        </View>
      </LinearGradient>

      {/* FORMULÁRIO */}
      <View style={styles.flexTwo}>
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Manutenção:</Text>
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

          <Text style={styles.label}>Descrição:</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o problema"
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.label}>Status do Chamado:</Text>
          <Picker
            selectedValue={statusChamado}
            onValueChange={(itemValue) => setStatusChamado(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Aguardando" value="1" />
            <Picker.Item label="Finalizado" value="2" />
            <Picker.Item label="Cancelado" value="3" />
          </Picker>
          <Button
            title="Salvar Alterações"
            onPress={handleSubmit}
            color="#1565C0"
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  flexOne: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  flexTwo: {
    flex: 2,
    padding: 8,
    backgroundColor: '#e8e9eb',
  },

  headerContent: {
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    textAlign: 'center',
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: -40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },

  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 6,
    color: '#333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },

  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    height: 50,
  },
});
