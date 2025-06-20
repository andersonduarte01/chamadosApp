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

export default function ListaChamadas() {
  const navigation = useNavigation();
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTecnico, setIsTecnico] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Verificar se é técnico
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) throw new Error('Token não encontrado');

        const response = await axios.get('https://smepedrabranca.com.br/api/usuario-logado/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsTecnico(response.data.is_tecnico);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error.message || error);
      }
    };

    fetchUsuario();
  }, []);

  // Função para buscar chamadas, pode receber URL customizada para paginação
  const fetchChamadas = async (url = null) => {
    try {
      const token = await AsyncStorage.getItem('@access_token');
      if (!token) throw new Error('Token não encontrado');

      const endpoint = url || (isTecnico
        ? 'https://smepedrabranca.com.br/api/v1/chamados-tecnico-aguardando/'
        : 'https://smepedrabranca.com.br/api/v1/chamados-usuario-aguardando/');

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (url) {
        // Carregando página adicional — concatena os resultados
        setChamadas(prev => [...prev, ...response.data.results]);
      } else {
        // Primeira página ou refresh — substitui a lista
        setChamadas(response.data.results);
      }

      setNextPageUrl(response.data.next);
    } catch (error) {
      console.error('Erro ao buscar chamadas:', error.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchChamadas();
    }, [isTecnico])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChamadas();
  };

  const loadMore = () => {
    if (nextPageUrl && !loadingMore) {
      setLoadingMore(true);
      fetchChamadas(nextPageUrl);
    }
  };

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

  if (loading && chamadas.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
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
        <Text style={styles.headerTitle}>Lista de Chamados</Text>
      </View>

      {/* LISTA */}
      <View style={styles.content}>
        <FlatList
          data={chamadas}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#1565C0" style={{ marginVertical: 15 }} />
            ) : null
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
                  {mapManutencao(item.manutencao)}
                </Text>
                <Text style={styles.text}>
                  {truncateText(item.descricao, 100)}
                </Text>
                <Text style={styles.status}>
                  Status: {mapStatus(item.status_chamado)}
                </Text>
                <Text style={styles.data}>
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
    backgroundColor: '#E3ECF3',
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
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 15,
    color: '#1565C0',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
  },
  data: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E3ECF3',
  },
});
