import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import CriarChamado from './CriarChamados';
import ListaChamadas from './ListaChamadas';

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - CARD_MARGIN * (NUM_COLUMNS * 2 + 1)) / NUM_COLUMNS;
const FLEX_TWO_HEIGHT = height * (2 / 3);
const CARD_HEIGHT = (FLEX_TWO_HEIGHT - CARD_MARGIN * 6) / 3; // 3 rows


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
  return (
    <View style={styles.container}>
      {/* Topo com gradiente e título */}
      <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.flexOne}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Bem-vindo à Tela Inicial</Text>
        </View>
      </LinearGradient>

      {/* Cards na parte inferior */}
      <View style={styles.flexTwo}>
        <View style={styles.grid}>
          <Card iconName="add-circle" label="Novo Chamado" onPress={() => navigation.navigate('Novo Chamado')} />
          <Card iconName="list" label="Histórico Chamados" onPress={() => navigation.navigate('Chamados')} />
          <Card iconName="message" label="Mensagens" onPress={() => {}} />
          <Card iconName="logout" label="Sair" onPress={() => navigation.navigate('Sair')} />             
          <Card iconName="settings" label="Configurações" onPress={() => {}} />  
          <Card iconName="person" label="Perfil" onPress={() => {}} />  
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flexOne: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContent: {
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  flexTwo: {
    flex: 2,
    backgroundColor: '#e8e9eb',
    padding: CARD_MARGIN,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: -30,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CARD_MARGIN * 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  cardText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1565C0',
    fontWeight: '600',
    textAlign: 'center',
  },
});
