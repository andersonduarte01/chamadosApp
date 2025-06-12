import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function EditarChamadoTecnico() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chamadoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [chamado, setChamado] = useState(null);
  const [statusChamado, setStatusChamado] = useState('');

  useEffect(() => {
    const fetchChamado = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        const response = await axios.get(
          `http://192.168.0.114:8000/api/chamadas-tecnico/${chamadoId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChamado(response.data);
        setStatusChamado(response.data.status_chamado?.toString() || '');
      } catch (error) {
        Alert.alert('Erro', 'Erro ao buscar chamado');
      } finally {
        setLoading(false);
      }
    };

    fetchChamado();
  }, [chamadoId]);

  const handleSalvar = async () => {
    try {
      const token = await AsyncStorage.getItem('@access_token');
      await axios.patch(
        `http://192.168.0.114:8000/api/chamadas-tecnico/${chamadoId}/`,
        { status_chamado: Number(statusChamado) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Status atualizado com sucesso');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar o status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

      {/* Topo com gradiente ocupando flex:1 */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.topContainer}>
        <View style={styles.topContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Atendimento Chamado</Text>
          <View style={{ width: 24 }} /> {/* espaço para equilibrar visualmente */}
        </View>
      </LinearGradient>

      {/* Conteúdo principal ocupando flex:2 */}
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.infoText}>{chamado.usuario?.nome || 'Não informado'}</Text>

            <Text style={styles.label}>Título:</Text>
            <Text style={styles.infoText}>{chamado.titulo || 'Não informado'}</Text>

            <Text style={styles.label}>Descrição:</Text>
            <Text style={styles.infoText}>{chamado.descricao || 'Não informado'}</Text>

            <Text style={styles.label}>Data de Abertura:</Text>
            <Text style={styles.infoText}>{formatDate(chamado.data) || 'Não informado'}</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.label}>Status do Chamado:</Text>
            <Picker
              selectedValue={statusChamado}
              onValueChange={(itemValue) => setStatusChamado(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Aberto" value="1" />
              <Picker.Item label="Em andamento" value="2" />
              <Picker.Item label="Concluído" value="3" />
            </Picker>

            <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // espaço entre botão e espaço vazio
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  contentWrapper: {
    flex: 2,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 10,
  },
  picker: {
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
