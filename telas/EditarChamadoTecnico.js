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
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
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
          `http://192.168.0.100:8000/api/chamadas-tecnico/${chamadoId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChamado(response.data);
        setStatusChamado(response.data.status_chamado?.toString() || '1');
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
        `http://192.168.0.100:8000/api/chamadas-tecnico/${chamadoId}/`,
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

      {/* Topo sem gradiente */}
      <View style={styles.topContainer}>
        <View style={styles.topContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Atendimento</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.infoText}>{chamado.usuario?.nome || 'Não informado'}</Text>

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
              <Picker.Item label="Concluído" value="2" />
              <Picker.Item label="Cancelado" value="3" />
            </Picker>

            <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D47A1',
  },
  topContainer: {
    backgroundColor: '#0D47A1',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  topContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0D47A1',
    marginBottom: 10,
    fontFamily: 'Poppins-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  picker: {
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    color: '#0D47A1',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
