import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Função para formatar datas
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para cortar textos longos
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function ListaChamadosAtendidos() {
  const navigation = useNavigation();
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTecnico, setIsTecnico] = useState(false);

  // Verificar se é técnico
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) throw new Error('Token não encontrado');

        const response = await axios.get('http://192.168.0.103:8000/api/usuario-logado/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsTecnico(response.data.is_tecnico);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error.message || error);
      }
    };

    fetchUsuario();
  }, []);

  // Função para buscar os chamados
  const fetchChamadas = async () => {
    try {
      const token = await AsyncStorage.getItem('@access_token');
      if (!token) throw new Error('Token não encontrado');

      const endpoint = isTecnico
        ? 'http://192.168.0.103:8000/api/chamados-finalizados/'
        : 'http://192.168.0.103:8000/api/chamados-usuario-finalizados/';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChamadas(response.data);
    } catch (error) {
      console.error('Erro ao buscar chamadas:', error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Atualizar sempre que entrar na tela
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchChamadas();
    }, [isTecnico])
  );

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchChamadas();
  };

  // Mapas de manutenção e status
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

  // Tela de loading inicial
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

      {/* Header com gradiente */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Main')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Lista de Chamados</Text>
      </LinearGradient>

      {/* Lista de chamados */}
      <View style={styles.content}>
        <FlatList
          data={chamadas}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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

// 🎨 Estilo profissional
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
    color: '#555',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#e8e9eb',
  },
});
