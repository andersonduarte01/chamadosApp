import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, StatusBar, Platform, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';


const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export default function ListaChamadas() {
  const navigation = useNavigation();
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChamadas = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) throw new Error('Token não encontrado');

        const response = await axios.get('http://192.168.0.114:8000/api/chamadas/', {
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
  }, []);

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
      {/* Ajusta a StatusBar para o Android */}
      {Platform.OS === 'android' && <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />}

      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.header}>
        <Text style={styles.headerText}>Lista de Chamados</Text>
      </LinearGradient>

      <View style={styles.content}>
      <FlatList
        data={chamadas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditarChamado', { chamadoId: item.id })}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Manutenção: {mapManutencao(item.manutencao)}</Text>
              <Text style={styles.text}>
                {truncateText(item.descricao, 100)}
              </Text>
              <Text style={styles.text}>Status: {mapStatus(item.status_chamado)}</Text>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#e8e9eb',
  },
});
