import 'package:json_annotation/json_annotation.dart';

part 'carrier.g.dart';

// Helper functions for int to bool conversion
bool _boolFromInt(dynamic value) {
  if (value is bool) return value;
  if (value is int) return value == 1;
  if (value is String) return value == '1' || value.toLowerCase() == 'true';
  return false;
}

int _boolToInt(bool value) => value ? 1 : 0;

@JsonSerializable()
class Carrier {
  final String id;
  final String name;
  @JsonKey(name: 'owner_id')
  final int? ownerId; // Made nullable since it's not always present
  @JsonKey(name: 'current_system')
  final String? currentSystem;
  @JsonKey(name: 'docking_access')
  final String dockingAccess;
  @JsonKey(name: 'notorious_access', fromJson: _boolFromInt, toJson: _boolToInt)
  final bool notoriousAccess;
  @JsonKey(name: 'fuel_level')
  final int fuelLevel;
  @JsonKey(name: 'jump_cooldown')
  final int jumpCooldown;
  @JsonKey(name: 'last_updated')
  final String? lastUpdated;
  
  // Financial data
  final int? balance;
  @JsonKey(name: 'upkeep_cost')
  final int? upkeepCost;
  @JsonKey(name: 'next_upkeep')
  final String? nextUpkeep;
  
  // Services list - will be populated separately
  final List<CarrierService>? services;

  const Carrier({
    required this.id,
    required this.name,
    this.ownerId, // Made optional since it's nullable
    this.currentSystem,
    this.dockingAccess = 'all',
    this.notoriousAccess = false,
    this.fuelLevel = 0,
    this.jumpCooldown = 0,
    this.lastUpdated,
    this.balance,
    this.upkeepCost,
    this.nextUpkeep,
    this.services,
  });

  factory Carrier.fromJson(Map<String, dynamic> json) => _$CarrierFromJson(json);
  Map<String, dynamic> toJson() => _$CarrierToJson(this);

  Carrier copyWith({
    String? id,
    String? name,
    int? ownerId, // Made nullable
    String? currentSystem,
    String? dockingAccess,
    bool? notoriousAccess,
    int? fuelLevel,
    int? jumpCooldown,
    String? lastUpdated,
    int? balance,
    int? upkeepCost,
    String? nextUpkeep,
    List<CarrierService>? services,
  }) {
    return Carrier(
      id: id ?? this.id,
      name: name ?? this.name,
      ownerId: ownerId ?? this.ownerId, // Will handle null correctly now
      currentSystem: currentSystem ?? this.currentSystem,
      dockingAccess: dockingAccess ?? this.dockingAccess,
      notoriousAccess: notoriousAccess ?? this.notoriousAccess,
      fuelLevel: fuelLevel ?? this.fuelLevel,
      jumpCooldown: jumpCooldown ?? this.jumpCooldown,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      balance: balance ?? this.balance,
      upkeepCost: upkeepCost ?? this.upkeepCost,
      nextUpkeep: nextUpkeep ?? this.nextUpkeep,
      services: services ?? this.services,
    );
  }

  // Helper methods
  String get formattedBalance {
    if (balance == null) return '0 CR';
    return '${(balance! / 1000000).toStringAsFixed(1)}M CR';
  }

  String get fuelStatus {
    return '$fuelLevel / 1000 TONS';
  }

  double get fuelPercentage {
    return fuelLevel / 1000.0;
  }

  bool get isJumpReady {
    return jumpCooldown <= 0 && fuelLevel >= 5; // Minimum fuel for jump
  }

  String get jumpCooldownFormatted {
    if (jumpCooldown <= 0) return '00:00:00';
    
    final hours = jumpCooldown ~/ 3600;
    final minutes = (jumpCooldown % 3600) ~/ 60;
    final seconds = jumpCooldown % 60;
    
    return '${hours.toString().padLeft(2, '0')}:'
           '${minutes.toString().padLeft(2, '0')}:'
           '${seconds.toString().padLeft(2, '0')}';
  }
}

@JsonSerializable()
class CarrierService {
  @JsonKey(name: 'service_type')
  final String serviceType;
  @JsonKey(name: 'enabled', fromJson: _boolFromInt, toJson: _boolToInt)
  final bool enabled;

  const CarrierService({
    required this.serviceType,
    required this.enabled,
  });

  factory CarrierService.fromJson(Map<String, dynamic> json) => _$CarrierServiceFromJson(json);
  Map<String, dynamic> toJson() => _$CarrierServiceToJson(this);

  // Helper methods
  String get displayName {
    switch (serviceType.toLowerCase()) {
      case 'universal_cartographics':
        return 'UNIVERSAL CARTOGRAPHICS';
      case 'shipyard':
        return 'SHIPYARD';
      case 'outfitting':
        return 'OUTFITTING';
      case 'commodities':
        return 'COMMODITIES MARKET';
      case 'refuel':
        return 'REFUEL';
      case 'redemption':
        return 'REDEMPTION OFFICE';
      default:
        return serviceType.toUpperCase();
    }
  }

  String get description {
    switch (serviceType.toLowerCase()) {
      case 'universal_cartographics':
        return 'Exploration data sales';
      case 'shipyard':
        return 'Ship purchase & outfitting';
      case 'outfitting':
        return 'Module sales & upgrades';
      case 'commodities':
        return 'Trade goods exchange';
      case 'refuel':
        return 'Fuel services';
      case 'redemption':
        return 'Bounty & bond processing';
      default:
        return 'Carrier service';
    }
  }

  String? get iconAsset {
    switch (serviceType.toLowerCase()) {
      case 'universal_cartographics':
        return 'assets/images/icons/Universal-Cartographics.svg';
      default:
        return null; // Will use Material icons
    }
  }
}
