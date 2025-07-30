import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StatusBar, StyleSheet} from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import CarrierListScreen from './src/screens/CarrierListScreen';
import CarrierDetailScreen from './src/screens/CarrierDetailScreen';
import CarrierControlScreen from './src/screens/CarrierControlScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {SocketProvider} from './src/context/SocketContext';
import {Colors} from './src/styles/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CarrierStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {backgroundColor: Colors.primaryDark},
      headerTintColor: Colors.textPrimary,
      headerTitleStyle: {fontFamily: 'Orbitron-Bold'},
    }}>
    <Stack.Screen name="CarrierList" component={CarrierListScreen} options={{title: 'Fleet Carriers'}} />
    <Stack.Screen name="CarrierDetail" component={CarrierDetailScreen} options={{title: 'Carrier Details'}} />
    <Stack.Screen name="CarrierControl" component={CarrierControlScreen} options={{title: 'Carrier Control'}} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName;
        switch (route.name) {
          case 'Carriers':
            iconName = 'airport-shuttle';
            break;
          case 'Settings':
            iconName = 'settings';
            break;
          default:
            iconName = 'home';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.accent,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: {
        backgroundColor: Colors.primaryDark,
        borderTopColor: Colors.accent,
      },
      headerShown: false,
    })}>
    <Tab.Screen name="Carriers" component={CarrierStack} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const {isAuthenticated} = useAuth();
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
        <AppNavigator />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
