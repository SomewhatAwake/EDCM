// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'carrier.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Carrier _$CarrierFromJson(Map<String, dynamic> json) => Carrier(
  id: json['id'] as String,
  name: json['name'] as String,
  ownerId: (json['owner_id'] as num?)?.toInt(),
  currentSystem: json['current_system'] as String?,
  dockingAccess: json['docking_access'] as String? ?? 'all',
  notoriousAccess: json['notorious_access'] == null
      ? false
      : _boolFromInt(json['notorious_access']),
  fuelLevel: (json['fuel_level'] as num?)?.toInt() ?? 0,
  jumpCooldown: (json['jump_cooldown'] as num?)?.toInt() ?? 0,
  lastUpdated: json['last_updated'] as String?,
  balance: (json['balance'] as num?)?.toInt(),
  upkeepCost: (json['upkeep_cost'] as num?)?.toInt(),
  nextUpkeep: json['next_upkeep'] as String?,
  services: (json['services'] as List<dynamic>?)
      ?.map((e) => CarrierService.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$CarrierToJson(Carrier instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'owner_id': instance.ownerId,
  'current_system': instance.currentSystem,
  'docking_access': instance.dockingAccess,
  'notorious_access': _boolToInt(instance.notoriousAccess),
  'fuel_level': instance.fuelLevel,
  'jump_cooldown': instance.jumpCooldown,
  'last_updated': instance.lastUpdated,
  'balance': instance.balance,
  'upkeep_cost': instance.upkeepCost,
  'next_upkeep': instance.nextUpkeep,
  'services': instance.services,
};

CarrierService _$CarrierServiceFromJson(Map<String, dynamic> json) =>
    CarrierService(
      serviceType: json['service_type'] as String,
      enabled: _boolFromInt(json['enabled']),
    );

Map<String, dynamic> _$CarrierServiceToJson(CarrierService instance) =>
    <String, dynamic>{
      'service_type': instance.serviceType,
      'enabled': _boolToInt(instance.enabled),
    };
