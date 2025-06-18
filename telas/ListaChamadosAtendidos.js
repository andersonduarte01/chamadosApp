import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

export default function ListaChamadosAtendidos() {
  const navigation = useNavigation();
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTecnico, setIsTecnico] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Busca tipo de usuário (técnico ou não)
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) return;

        const response = await axios.get('http://192.168.0.100:8000/api/usuario-logado/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsTecnico(response.data.is_tecnico);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error.message || error);
      }
    };

    fetchUsuario();
  }, []);

  // Busca chamadas (primeira página ou próxima)
  const fetchChamadas = async (url = null) => {
    try {
      const token = await AsyncStorage.getItem('@access_token');
      if (!token) return;

      const endpoint = url || (isTecnico
        ? 'http://192.168.0.100:8000/api/chamados-finalizados/'
        : 'http://192.168.0.100:8000/api/chamados-usuario-finalizados/');

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (url) {
        // Carregando próxima página: concatena
        setChamadas(prev => [...prev, ...response.data.results]);
      } else {
        // Primeira página: substitui
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

  // Atualiza lista toda ao focar na tela ou quando isTecnico muda
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchChamadas();
    }, [isTecnico])
  );

  // Atualiza lista com pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchChamadas();
  };

  // Carrega mais quando chegar no fim da lista
  const loadMore = () => {
    if (nextPageUrl && !loadingMore) {
      setLoadingMore(true);
      fetchChamadas(nextPageUrl);
    }
  };

  // Formata data para dd/mm/aaaa
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Mapeia tipo manutenção
  const mapManutencao = (codigo) => ({
    '1': 'Computador',
    '2': 'Impressora',
    '3': 'Computador e Impressora',
    '4': 'Outro',
  }[codigo] || 'Desconhecido');

  // Mapeia status chamado
  const mapStatus = (codigo) => ({
    '1': 'Aguardando',
    '2': 'Finalizado',
    '3': 'Cancelado',
  }[codigo] || 'Desconhecido');

  // Trunca texto muito longo
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading && chamadas.length === 0) {
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

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chamados Atendidos</Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {chamadas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum chamado atendido.</Text>
          </View>
        ) : (
          <FlatList
            data={chamadas}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#1976D2" style={{ marginVertical: 15 }} />
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>
                  {mapManutencao(item.manutencao)}
                </Text>
                <Text style={styles.description}>
                  {truncateText(item.descricao, 100)}
                </Text>
                <View style={styles.footer}>
                  <Text style={styles.status}>
                    Status: {mapStatus(item.status_chamado)}
                  </Text>
                  <Text style={styles.date}>
                    {formatDate(item.data)}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    color: '#1565C0',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'Poppins-Medium',
  },
  date: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#E3ECF3',
  },
});
