import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS * 2 + 1)) / NUM_COLUMNS;

function Card({ iconName, label, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Icon name={iconName} size={32} color="#1565C0" />
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userType, setUserType] = useState(null); // 'tecnico' ou 'usuario'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserType = async () => {
      try {
        const token = await AsyncStorage.getItem('@access_token');
        if (!token) {
          Alert.alert('Erro', 'Token não encontrado');
          navigation.navigate('Login');
          return;
        }

        const response = await fetch('https://smepedrabranca.com.br/api/usuario-logado/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao obter dados do usuário');
        }

        const userData = await response.json();

        if (userData.is_tecnico) {
          setUserType('tecnico');
        } else if (userData.is_solicitante) {
          setUserType('usuario');
        } else {
          Alert.alert('Erro', 'Tipo de usuário não reconhecido');
          navigation.navigate('Login');
        }
      } catch (error) {
        Alert.alert('Erro', error.message);
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    loadUserType();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  const handleNovo = () => {
    if (userType === 'tecnico') {
      navigation.navigate('CadastrarUsuario');
    } else {
      navigation.navigate('Novo Chamado');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor="#0D47A1" barStyle="light-content" />
      )}

      {/* TOPO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tela Inicial</Text>
      </View>

      {/* GRID */}
      <View style={styles.content}>
        <View style={styles.grid}>
          <Card
            iconName={userType === 'tecnico' ? 'person-add' : 'add-circle'}
            label={userType === 'tecnico' ? 'Cadastrar Usuário' : 'Novo Chamado'}
            onPress={handleNovo}
          />
          <Card
            iconName="list"
            label="Meus Chamados"
            onPress={() => navigation.navigate('Chamados')}
          />
          <Card
            iconName="reorder"
            label="Histórico"
            onPress={() => navigation.navigate('ChamadosAtendidos')}
          />
          <Card iconName="settings" label="Configurações" onPress={() => {}} />
          <Card iconName="person" label="Perfil" onPress={() => {}} />
          <Card iconName="logout" label="Sair" onPress={() => navigation.navigate('Sair')} />
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CARD_MARGIN * 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardText: {
    marginTop: 8,
    fontSize: 15,
    color: '#1565C0',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
