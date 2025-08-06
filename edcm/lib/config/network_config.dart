import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_config.dart';

class NetworkConfig {
  // Cached values for performance
  static bool? _cachedUseTailscale;
  static String? _cachedTailscaleHostname;
  static String? _cachedTailscalePort;
  
  // Get configuration with SharedPreferences override, then environment variables, then app config defaults
  static Future<bool> get useTailscale async {
    if (_cachedUseTailscale != null) return _cachedUseTailscale!;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      _cachedUseTailscale = prefs.getBool('useTailscale') ?? 
        const bool.fromEnvironment('USE_TAILSCALE', defaultValue: AppConfig.useTailscale);
      return _cachedUseTailscale!;
    } catch (e) {
      _cachedUseTailscale = AppConfig.useTailscale;
      return _cachedUseTailscale!;
    }
  }
  
  static Future<String> get tailscaleHostname async {
    if (_cachedTailscaleHostname != null) return _cachedTailscaleHostname!;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      _cachedTailscaleHostname = prefs.getString('tailscaleHostname') ?? 
        const String.fromEnvironment('TAILSCALE_HOSTNAME', defaultValue: AppConfig.tailscaleHostname);
      return _cachedTailscaleHostname!;
    } catch (e) {
      _cachedTailscaleHostname = AppConfig.tailscaleHostname;
      return _cachedTailscaleHostname!;
    }
  }
    
  static Future<String> get tailscalePort async {
    if (_cachedTailscalePort != null) return _cachedTailscalePort!;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      _cachedTailscalePort = prefs.getString('tailscalePort') ?? 
        const String.fromEnvironment('TAILSCALE_PORT', defaultValue: AppConfig.tailscalePort);
      return _cachedTailscalePort!;
    } catch (e) {
      _cachedTailscalePort = AppConfig.tailscalePort;
      return _cachedTailscalePort!;
    }
  }
  
  // Clear cache to force reload of settings
  static void clearCache() {
    _cachedUseTailscale = null;
    _cachedTailscaleHostname = null;
    _cachedTailscalePort = null;
  }
  
  // Default local development endpoints
  static String get localAndroidEmulator => AppConfig.localAndroidEmulator;
  static String get localDevice => AppConfig.localNetworkIP;
  
  // Tailscale endpoint - Use HTTP for now (could be HTTPS with certificates)
  static Future<String> get tailscaleEndpoint async {
    final hostname = await tailscaleHostname;
    final port = await tailscalePort;
    return 'http://$hostname:$port';
  }
  
  // Determine the base URL based on configuration
  static Future<String> get baseUrl async {
    final useTailscaleValue = await useTailscale;
    final tailscaleHostnameValue = await tailscaleHostname;
    
    if (AppConfig.enableDebugLogging) {
      print('NetworkConfig - useTailscale: $useTailscaleValue, hostname: $tailscaleHostnameValue');
    }
    
    if (useTailscaleValue && tailscaleHostnameValue.isNotEmpty) {
      final endpoint = await tailscaleEndpoint;
      if (AppConfig.enableDebugLogging) {
        print('Using Tailscale endpoint: $endpoint');
      }
      return endpoint;
    }
    
    // For development, default to Android emulator endpoint
    // This works for both emulator and can be easily changed
    if (AppConfig.enableDebugLogging) {
      print('Using Android emulator endpoint: $localAndroidEmulator');
    }
    return localAndroidEmulator;
  }
  
  // API endpoints
  static Future<String> get apiUrl async => '${await baseUrl}/api';
  static Future<String> get wsUrl async => (await baseUrl).replaceFirst('http', 'ws');
}
