import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa em 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function ListaChamadas() {
  const navigation = useNavigation();
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTecnico, setIsTecnico] = useState(false);

  // Verifica se é técnico
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) throw new Error('Token não encontrado');

        const response = await axios.get('http://192.168.0.114:8000/api/usuario-logado/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsTecnico(response.data.is_tecnico);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error.message || error);
      }
    };

    fetchUsuario();
  }, []);

  // Busca os chamados
  useEffect(() => {
    const fetchChamadas = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) throw new Error('Token não encontrado');

        const endpoint = isTecnico
          ? 'http://192.168.0.114:8000/api/chamadas-tecnico/'
          : 'http://192.168.0.114:8000/api/chamadas-usuario/';

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChamadas(response.data);
      } catch (error) {
        console.error('Erro ao buscar chamadas:', error.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchChamadas();
  }, [isTecnico]);

  const mapManutencao = (codigo) => ({
    '1': 'Computador',
    '2': 'Impressora',
    '3': 'Computador e Impressora',
    '4': 'Outro',
  }[codigo] || 'Desconhecido');

  const mapStatus = (codigo) => ({
    '1': 'Aguardando',
    '2': 'Finalizado',
    '3': 'Cancelado',
  }[codigo] || 'Desconhecido');

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      )}

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={{ position: 'absolute', top: 40, left: 20 }}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Lista de Chamados</Text>
      </LinearGradient>

      <View style={styles.content}>
        <FlatList
          data={chamadas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  isTecnico ? 'EditarChamadoTecnico' : 'EditarChamado',
                  { chamadoId: item.id }
                )
              }
            >
              <View style={styles.card}>
                <Text style={styles.title}>
                  Manutenção: {mapManutencao(item.manutencao)}
                </Text>
                <Text style={styles.text}>
                  {truncateText(item.descricao, 100)}
                </Text>
                <Text style={styles.text}>
                  Status: {mapStatus(item.status_chamado)}
                </Text>
                  <Text style={styles.dataText}>
                    Data: {formatDate(item.data)}
                  </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e9eb',
  },
  header: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#e8e9eb',
    padding: 7,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  dataText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#e8e9eb',
  },
});
