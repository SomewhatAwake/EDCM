import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../context/AuthContext';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../styles/theme';

const SettingsScreen = () => {
  const {user, logout} = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Logout', style: 'destructive', onPress: logout},
      ]
    );
  };

  const SettingItem = ({title, subtitle, icon, onPress}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <LinearGradient
        colors={[Colors.card, Colors.secondary]}
        style={styles.settingContent}>
        <View style={styles.settingInfo}>
          <Icon name={icon} size={24} color={Colors.accent} />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={Colors.textTertiary} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      <View style={styles.userInfo}>
        <LinearGradient
          colors={[Colors.card, Colors.secondary]}
          style={styles.userCard}>
          <Icon name="person" size={48} color={Colors.accent} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userSubtext}>Commander</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.settingsGroup}>
        <SettingItem
          title="Server Configuration"
          subtitle="Configure connection settings"
          icon="dns"
          onPress={() => Alert.alert('Coming Soon', 'Server configuration will be available in a future update')}
        />
        
        <SettingItem
          title="Notifications"
          subtitle="Manage alert preferences"
          icon="notifications"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in a future update')}
        />
        
        <SettingItem
          title="Security"
          subtitle="Authentication and security"
          icon="security"
          onPress={() => Alert.alert('Coming Soon', 'Security settings will be available in a future update')}
        />
        
        <SettingItem
          title="About"
          subtitle="App information and credits"
          icon="info"
          onPress={() => Alert.alert(
            'Elite Dangerous Carrier Companion',
            'Version 1.0.0\n\nA companion app for managing Fleet Carriers remotely.\n\nCreated for Elite Dangerous commanders.',
            [{text: 'OK'}]
          )}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={[Colors.danger, '#cc0000']}
          style={styles.logoutGradient}>
          <Icon name="exit-to-app" size={20} color={Colors.textPrimary} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  userInfo: {
    padding: Spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  userDetails: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userSubtext: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },
  settingsGroup: {
    paddingHorizontal: Spacing.lg,
  },
  settingItem: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },
  logoutButton: {
    margin: Spacing.lg,
    marginTop: 'auto',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
});

export default SettingsScreen;
