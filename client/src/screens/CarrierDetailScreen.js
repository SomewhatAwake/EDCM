import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSocket} from '../context/SocketContext';
import {carrierService} from '../services/api';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../styles/theme';

const CarrierDetailScreen = ({route}) => {
  const {carrier} = route.params;
  const [carrierData, setCarrierData] = useState(carrier);
  const [marketData, setMarketData] = useState(null);
  const {socket, subscribeToCarrierUpdates, unsubscribeFromCarrierUpdates} = useSocket();

  useEffect(() => {
    subscribeToCarrierUpdates(carrier.id);
    loadMarketData();
    
    return () => {
      unsubscribeFromCarrierUpdates(carrier.id);
    };
  }, [carrier.id]);

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

  const loadMarketData = async () => {
    try {
      const data = await carrierService.getMarketData(carrier.id);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
    }
  };

  const handleCarrierUpdate = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, ...data}));
    }
  };

  const handleCarrierJump = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, current_system: data.system}));
    }
  };

  const handleCarrierFinance = (data) => {
    if (data.carrierId === carrier.id) {
      setCarrierData(prev => ({...prev, balance: data.balance}));
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

  const InfoSection = ({title, children}) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <LinearGradient
        colors={[Colors.card, Colors.secondary]}
        style={styles.sectionContent}>
        {children}
      </LinearGradient>
    </View>
  );

  const InfoRow = ({label, value}) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <InfoSection title="CARRIER INFORMATION">
        <InfoRow label="Name" value={carrierData.name} />
        <InfoRow label="ID" value={carrierData.id} />
        <InfoRow label="Current System" value={carrierData.current_system || 'Unknown'} />
        <InfoRow label="Docking Access" value={carrierData.docking_access || 'All'} />
        <InfoRow label="Notorious Access" value={carrierData.notorious_access ? 'Allowed' : 'Denied'} />
      </InfoSection>

      <InfoSection title="STATUS">
        <InfoRow label="Fuel Level" value={`${carrierData.fuel_level || 0}/1000`} />
        <InfoRow label="Jump Cooldown" value={`${carrierData.jump_cooldown || 0} minutes`} />
        <InfoRow label="Balance" value={formatCredits(carrierData.balance || 0)} />
        <InfoRow label="Last Updated" value={new Date(carrierData.last_updated).toLocaleString()} />
      </InfoSection>

      {marketData && (
        <InfoSection title="MARKET DATA">
          {marketData.commodities.map((commodity, index) => (
            <View key={index} style={styles.commodityRow}>
              <Text style={styles.commodityName}>{commodity.name}</Text>
              <View style={styles.commodityData}>
                <Text style={styles.commodityText}>
                  Supply: {commodity.supply}
                </Text>
                <Text style={styles.commodityText}>
                  Demand: {commodity.demand}
                </Text>
                <Text style={styles.commodityText}>
                  Buy: {formatCredits(commodity.buyPrice)}
                </Text>
                <Text style={styles.commodityText}>
                  Sell: {formatCredits(commodity.sellPrice)}
                </Text>
              </View>
            </View>
          ))}
        </InfoSection>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.secondary,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  commodityRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commodityName: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  commodityData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  commodityText: {
    fontSize: 12,
    fontFamily: Fonts.secondary,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});

export default CarrierDetailScreen;
