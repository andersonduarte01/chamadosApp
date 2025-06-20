import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
    const fetchToken = async () => {
      const savedToken = await AsyncStorage.getItem('@access_token');
      if (!savedToken) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        navigation.goBack();
        return;
      }
      setToken(savedToken);
      return savedToken;
    };

    const fetchChamado = async (savedToken) => {
      try {
        const resChamado = await fetch(
          `http://192.168.0.19:8000/api/v1/chamados-usuario/${chamadoId}/`,
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }
        );

        if (!resChamado.ok) throw new Error('Erro ao buscar chamado.');

        const data = await resChamado.json();
        setManutencao(data.manutencao?.toString() || '');
        setDescricao(data.descricao || '');
        setStatusChamado(data.status_chamado?.toString() || '');
      } catch (err) {
        console.error(err);
        Alert.alert('Erro', 'Falha ao carregar dados do chamado.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchToken().then((savedToken) => {
      if (savedToken) fetchChamado(savedToken);
    });
  }, [chamadoId, navigation]);

  async function handleSubmit() {
    if (!statusChamado) {
      Alert.alert('Erro', 'Selecione um status para o chamado.');
      return;
    }

    if (!manutencao || !descricao) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const body = {
        status_chamado: Number(statusChamado),
        manutencao: Number(manutencao),
        descricao: descricao,
      };

      const response = await fetch(
        `https://smepedrabranca.com.br/api/v1/chamados-usuario/${chamadoId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        Alert.alert('Sucesso', 'Chamado atualizado com sucesso');
        navigation.goBack();
      } else {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />

      {/* TOPO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Chamado</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de Manutenção</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={manutencao}
              onValueChange={(itemValue) => setManutencao(itemValue)}
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
            style={[styles.input, { height: 100 }]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva o problema"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Status do Chamado</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={statusChamado}
              onValueChange={(itemValue) => setStatusChamado(itemValue)}
              dropdownIconColor="#1565C0"
            >
              <Picker.Item label="Aguardando" value="1" />
              <Picker.Item label="Finalizado" value="2" />
              <Picker.Item label="Cancelado" value="3" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  container: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    backgroundColor: '#0D47A1',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    marginRight: 16,
  },

  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  content: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },

  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },

  button: {
    backgroundColor: '#1565C0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
