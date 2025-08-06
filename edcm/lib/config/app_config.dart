// Network configuration for Elite Dangerous Carrier Manager
// Edit this file to change your connection settings

class AppConfig {
  // Network Configuration
  static const bool useTailscale = false; // Set to true to use Tailscale
  static const String tailscaleHostname = '100.103.140.29'; // Your Tailscale IP
  static const String tailscalePort = '3000';
  
  // Local Development Endpoints (fallbacks when Tailscale is disabled)
  static const String localAndroidEmulator = 'http://10.0.2.2:3000';
  static const String localNetworkIP = 'http://192.168.68.64:3000';
  
  // Auto-switch based on environment
  static const bool autoDetectEnvironment = true;
  
  // Debug logging
  static const bool enableDebugLogging = true;
}
