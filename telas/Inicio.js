import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const logo = require('../imagens/logo1.png');
const background = require('../imagens/fundo.webp'); // sua imagem de fundo

export default function InicioScreen({ navigation }) {
  return (
    <ImageBackground source={background} style={styles.container} resizeMode="cover">
      <Animatable.Image
        animation="fadeInDown"
        duration={1200}
        source={logo}
        style={styles.logo}
        resizeMode="contain"
      />

      <Animatable.Text animation="fadeInUp" delay={1100} style={styles.info}>
        Sistema de Chamados Técnicos de TI
      </Animatable.Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.botaoTexto}>Entrar no Sistema</Text>
      </TouchableOpacity>

      <Text style={styles.rodape}>v1.0.0 - DEV: Anderson Duarte</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '98%',
    height: undefined,
    aspectRatio: 2759 / 843,
    marginTop: 20,
    marginBottom: 20,
  },
  info: {
    fontSize: 18, // antes era 16
    fontFamily: 'Poppins-Bold', // ou Bold se preferir
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 100,
    marginBottom: 22,
    textTransform: 'uppercase',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 2,
  },
  botao: {
    backgroundColor: '#4088cf',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rodape: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#ddd',
  },
});
