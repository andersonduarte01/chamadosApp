import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeTabs from './telas/HomeTabs';
import LoginScreen from './telas/LoginScreen';
import InicioScreen from './telas/Inicio';
import CriarChamado from './telas/CriarChamados';
import ListaChamadas from './telas/ListaChamadas';
import EditarChamado from './telas/EditarChamado';
import EditarChamadoTecnico from './telas/EditarChamadoTecnico'
import ListaChamadosAtendidos from './telas/ListaChamadosAtendidos';
import CadastrarUsuario from './telas/CadastrarUsuario';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('@user_token');
      setInitialRoute(token ? 'Main' : 'Inicio');
    };
    checkToken();
  }, []);

  if (!initialRoute) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Inicio" component={InicioScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen name="CriarChamado" component={CriarChamado} />
          <Stack.Screen name="ListaChamadas" component={ListaChamadas} />
          <Stack.Screen name="EditarChamado" component={EditarChamado} />
          <Stack.Screen name="EditarChamadoTecnico" component={EditarChamadoTecnico} />
          <Stack.Screen name="ChamadosAtendidos" component={ListaChamadosAtendidos} />
          <Stack.Screen name="CadastrarUsuario" component={CadastrarUsuario} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
