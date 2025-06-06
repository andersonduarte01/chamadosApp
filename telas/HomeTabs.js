import React from 'react';
import { View, Button } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import Chamados from './Chamados';
import CriarChamado from './CriarChamados';
import LogoutButton from './LogoutButton';

const Tab = createBottomTabNavigator();

export default function HomeTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Chamados') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Novo Chamado') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'Sair'){
          iconName = focused ? 'log-out-outline' : 'log-out-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chamados" component={Chamados} />
      <Tab.Screen name="Novo Chamado" component={CriarChamado} />
      <Tab.Screen name="Sair"  component={LogoutButton}/>      
      {/* Tela só para logout, pode ser substituída pela sua lógica */}
    </Tab.Navigator>
  );
}
