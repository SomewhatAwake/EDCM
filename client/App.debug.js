import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Elite Dangerous Carrier Manager</Text>
      <Text style={styles.subtext}>Debug Version - App Started Successfully!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    fontSize: 24,
    color: '#ff6600',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default App;
