import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSocket} from '../context/SocketContext';
import {carrierService} from '../services/api';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../styles/theme';

const CarrierControlScreen = ({route, navigation}) => {
  const {carrier} = route.params;
  const [carrierData, setCarrierData] = useState(carrier);
  const [loading, setLoading] = useState(false);
  const [jumpTarget, setJumpTarget] = useState('');
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const {socket, subscribeToCarrierUpdates, unsubscribeFromCarrierUpdates} = useSocket();

  useEffect(() => {
    subscribeToCarrierUpdates(carrier.id);
    
    return () => {
      unsubscribeFromCarrierUpdates(carrier.id);
    };
  }, [carrier.id]);

  useEffect(() => {
    if (socket) {
      socket.on('carrier_stats', handleCarrierUpdate);
      socket.on('carrier_jump', handleCarrierJump);
      socket.on('carrier_finance', handleCarrierFinance);
      socket.on('carrier_docking_permission', handleDockingUpdate);

      return () => {
        socket.off('carrier_stats');
        socket.off('carrier_jump');
        socket.off('carrier_finance');
        socket.off('carrier_docking_permission');
      };
    }
  }, [socket]);

  const handleCarrierUpdate = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, ...data}));
    }
  };

  const handleCarrierJump = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, current_system: data.system}));
      Alert.alert('Jump Complete', `Carrier has arrived at ${data.system}`);
    }
  };

  const handleCarrierFinance = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, balance: data.balance}));
    }
  };

  const handleDockingUpdate = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({
        ...prev, 
        docking_access: data.dockingAccess,
        notorious_access: data.allowNotorious
      }));
    }
  };

  const handleJump = async () => {
    if (!jumpTarget.trim()) {
      Alert.alert('Error', 'Please enter a target system');
      return;
    }

    setLoading(true);
    try {
      await carrierService.jumpToSystem(carrier.id, jumpTarget.trim());
      Alert.alert('Success', 'Jump initiated successfully');
      setShowJumpDialog(false);
      setJumpTarget('');
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate jump');
    } finally {
      setLoading(false);
    }
  };

  const handleDockingPermissionChange = async (access, notorious = false) => {
    setLoading(true);
    try {
      await carrierService.updateDockingPermissions(carrier.id, access, notorious);
      Alert.alert('Success', 'Docking permissions updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update docking permissions');
    } finally {
      setLoading(false);
    }
  };

  const formatCredits = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B CR`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M CR`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K CR`;
    }
    return `${amount} CR`;
  };

  const getDockingAccessText = (access) => {
    switch (access) {
      case 'all': return 'All Commanders';
      case 'friends': return 'Friends Only';
      case 'squadron': return 'Squadron Only';
      case 'squadronfriends': return 'Squadron & Friends';
      default: return 'Unknown';
    }
  };

  const ControlSection = ({title, children}) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <LinearGradient
        colors={[Colors.card, Colors.secondary]}
        style={styles.sectionContent}>
        {children}
      </LinearGradient>
    </View>
  );

  const ControlButton = ({title, icon, onPress, variant = 'default', disabled = false}) => (
    <TouchableOpacity
      style={[
        styles.controlButton,
        variant === 'danger' && styles.dangerButton,
        disabled && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      <LinearGradient
        colors={variant === 'danger' ? [Colors.danger, '#cc0000'] : [Colors.accent, '#cc4400']}
        style={styles.buttonGradient}>
        <Icon name={icon} size={20} color={Colors.textPrimary} />
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carrier Info Header */}
      <LinearGradient
        colors={[Colors.card, Colors.secondary]}
        style={styles.header}>
        <Text style={styles.carrierName}>{carrierData.name}</Text>
        <Text style={styles.carrierId}>ID: {carrierData.id}</Text>
        <View style={styles.headerInfo}>
          <View style={styles.infoItem}>
            <Icon name="location-on" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              {carrierData.current_system || 'Unknown System'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="account-balance-wallet" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              {formatCredits(carrierData.balance || 0)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Jump Controls */}
      <ControlSection title="NAVIGATION">
        <View style={styles.jumpInfo}>
          <Text style={styles.jumpText}>
            Fuel: {carrierData.fuel_level || 0}/1000
          </Text>
          <Text style={styles.jumpText}>
            Cooldown: {carrierData.jump_cooldown || 0}min
          </Text>
        </View>
        
        {!showJumpDialog ? (
          <ControlButton
            title="INITIATE JUMP"
            icon="flight-takeoff"
            onPress={() => setShowJumpDialog(true)}
            disabled={carrierData.jump_cooldown > 0 || carrierData.fuel_level < 50}
          />
        ) : (
          <View style={styles.jumpDialog}>
            <TextInput
              style={styles.jumpInput}
              value={jumpTarget}
              onChangeText={setJumpTarget}
              placeholder="Enter target system name"
              placeholderTextColor={Colors.textTertiary}
            />
            <View style={styles.jumpButtons}>
              <TouchableOpacity
                style={styles.jumpButton}
                onPress={handleJump}
                disabled={loading}>
                <Text style={styles.jumpButtonText}>JUMP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.jumpButton, styles.cancelButton]}
                onPress={() => {
                  setShowJumpDialog(false);
                  setJumpTarget('');
                }}>
                <Text style={styles.jumpButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ControlSection>

      {/* Docking Permissions */}
      <ControlSection title="DOCKING PERMISSIONS">
        <Text style={styles.currentSetting}>
          Current: {getDockingAccessText(carrierData.docking_access)}
          {carrierData.notorious_access ? ' (Notorious Allowed)' : ''}
        </Text>
        
        <View style={styles.permissionButtons}>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              carrierData.docking_access === 'all' && styles.activePermission
            ]}
            onPress={() => handleDockingPermissionChange('all')}>
            <Text style={styles.permissionText}>ALL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.permissionButton,
              carrierData.docking_access === 'friends' && styles.activePermission
            ]}
            onPress={() => handleDockingPermissionChange('friends')}>
            <Text style={styles.permissionText}>FRIENDS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.permissionButton,
              carrierData.docking_access === 'squadron' && styles.activePermission
            ]}
            onPress={() => handleDockingPermissionChange('squadron')}>
            <Text style={styles.permissionText}>SQUADRON</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.notoriousButton,
            carrierData.notorious_access && styles.activeNotorious
          ]}
          onPress={() => handleDockingPermissionChange(
            carrierData.docking_access, 
            !carrierData.notorious_access
          )}>
          <Text style={styles.notoriousText}>
            {carrierData.notorious_access ? '✓' : '✗'} ALLOW NOTORIOUS
          </Text>
        </TouchableOpacity>
      </ControlSection>

      {/* Quick Actions */}
      <ControlSection title="QUICK ACTIONS">
        <View style={styles.actionButtons}>
          <ControlButton
            title="MARKET"
            icon="store"
            onPress={() => navigation.navigate('MarketScreen', {carrier: carrierData})}
          />
          
          <ControlButton
            title="SERVICES"
            icon="build"
            onPress={() => navigation.navigate('ServicesScreen', {carrier: carrierData})}
          />
          
          <ControlButton
            title="SETTINGS"
            icon="settings"
            onPress={() => navigation.navigate('CarrierSettings', {carrier: carrierData})}
          />
        </View>
      </ControlSection>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    padding: Spacing.lg,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  carrierName: {
    fontSize: 24,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  carrierId: {
    fontSize: 12,
    fontFamily: Fonts.secondary,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.secondary,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  sectionContent: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  controlButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  dangerButton: {
    // Additional styles for danger buttons
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  jumpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  jumpText: {
    fontSize: 14,
    fontFamily: Fonts.secondary,
    color: Colors.textSecondary,
  },
  jumpDialog: {
    marginTop: Spacing.lg,
  },
  jumpInput: {
    backgroundColor: Colors.input,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: Fonts.secondary,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  jumpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jumpButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors.textTertiary,
  },
  jumpButtonText: {
    fontSize: 14,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
  },
  currentSetting: {
    fontSize: 14,
    fontFamily: Fonts.secondary,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  permissionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    flex: 1,
    backgroundColor: Colors.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activePermission: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  permissionText: {
    fontSize: 12,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
  },
  notoriousButton: {
    backgroundColor: Colors.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeNotorious: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  notoriousText: {
    fontSize: 14,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

export default CarrierControlScreen;
