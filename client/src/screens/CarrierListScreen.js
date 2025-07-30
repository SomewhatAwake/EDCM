import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useSocket} from '../context/SocketContext';
import {carrierService} from '../services/api';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../styles/theme';

const CarrierListScreen = ({navigation}) => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {socket, connected} = useSocket();

  useEffect(() => {
    loadCarriers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('carrier_stats', handleCarrierUpdate);
      socket.on('carrier_jump', handleCarrierJump);
      socket.on('carrier_finance', handleCarrierFinance);

      return () => {
        socket.off('carrier_stats');
        socket.off('carrier_jump');
        socket.off('carrier_finance');
      };
    }
  }, [socket]);

  const loadCarriers = async () => {
    try {
      const data = await carrierService.getCarriers();
      setCarriers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load carriers');
      console.error('Error loading carriers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCarrierUpdate = (data) => {
    setCarriers(prev => 
      prev.map(carrier => 
        carrier.id === data.carrierId 
          ? {...carrier, ...data, last_updated: data.timestamp}
          : carrier
      )
    );
  };

  const handleCarrierJump = (data) => {
    setCarriers(prev => 
      prev.map(carrier => 
        carrier.id === data.carrierId 
          ? {...carrier, current_system: data.system, last_updated: data.timestamp}
          : carrier
      )
    );
  };

  const handleCarrierFinance = (data) => {
    setCarriers(prev => 
      prev.map(carrier => 
        carrier.id === data.carrierId 
          ? {...carrier, balance: data.balance, last_updated: data.timestamp}
          : carrier
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCarriers();
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

  const getStatusColor = (carrier) => {
    if (carrier.jump_cooldown > 0) return Colors.warning;
    if (carrier.fuel_level < 100) return Colors.danger;
    return Colors.success;
  };

  const renderCarrier = ({item}) => (
    <TouchableOpacity
      style={styles.carrierCard}
      onPress={() => navigation.navigate('CarrierDetail', {carrier: item})}>
      <LinearGradient
        colors={[Colors.card, Colors.secondary]}
        style={styles.cardGradient}>
        
        <View style={styles.cardHeader}>
          <View style={styles.carrierInfo}>
            <Text style={styles.carrierName}>{item.name}</Text>
            <Text style={styles.carrierId}>ID: {item.id}</Text>
          </View>
          <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(item)}]} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              {item.current_system || 'Unknown System'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="local-gas-station" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              Fuel: {item.fuel_level || 0}/1000
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="account-balance-wallet" size={16} color={Colors.accent} />
            <Text style={styles.infoText}>
              {formatCredits(item.balance || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.navigate('CarrierControl', {carrier: item})}>
            <Text style={styles.controlButtonText}>MANAGE</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading carriers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FLEET CARRIERS</Text>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.connectionDot, 
            {backgroundColor: connected ? Colors.success : Colors.danger}
          ]} />
          <Text style={styles.connectionText}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </Text>
        </View>
      </View>

      {carriers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="airport-shuttle" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No carriers found</Text>
          <Text style={styles.emptySubtext}>
            Your fleet carriers will appear here when detected
          </Text>
        </View>
      ) : (
        <FlatList
          data={carriers}
          renderItem={renderCarrier}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
              colors={[Colors.accent]}
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  connectionText: {
    fontSize: 12,
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.primaryBold,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  listContainer: {
    padding: Spacing.lg,
  },
  carrierCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  cardGradient: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  carrierInfo: {
    flex: 1,
  },
  carrierName: {
    fontSize: 18,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  carrierId: {
    fontSize: 12,
    fontFamily: Fonts.secondary,
    color: Colors.textTertiary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContent: {
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    fontFamily: Fonts.secondary,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  controlButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  controlButtonText: {
    fontSize: 12,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
});

export default CarrierListScreen;
