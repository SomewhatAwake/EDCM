import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/carrier_provider.dart';
import '../services/api_service.dart';
import '../config/network_config.dart';

class ConnectionTestScreen extends StatefulWidget {
  const ConnectionTestScreen({Key? key}) : super(key: key);

  @override
  _ConnectionTestScreenState createState() => _ConnectionTestScreenState();
}

class _ConnectionTestScreenState extends State<ConnectionTestScreen> {
  String _baseUrl = 'Loading...';
  String _apiUrl = 'Loading...';
  String _wsUrl = 'Loading...';
  bool _useTailscale = false;
  String _tailscaleHostname = '';

  Map<String, bool>? _connectivityResults;
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _loadNetworkConfig();
    _testConnectivity();
  }

  Future<void> _loadNetworkConfig() async {
    final baseUrl = await NetworkConfig.baseUrl;
    final apiUrl = await NetworkConfig.apiUrl;
    final wsUrl = await NetworkConfig.wsUrl;
    final useTailscale = await NetworkConfig.useTailscale;
    final tailscaleHostname = await NetworkConfig.tailscaleHostname;
    
    setState(() {
      _baseUrl = baseUrl;
      _apiUrl = apiUrl;
      _wsUrl = wsUrl;
      _useTailscale = useTailscale;
      _tailscaleHostname = tailscaleHostname;
    });
  }

  Future<void> _testConnectivity() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final results = await _apiService.testConnectivity();
      setState(() {
        _connectivityResults = results;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error testing connectivity: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connection Test'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _testConnectivity,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Current configuration
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Current Configuration',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        IconButton(
                          icon: const Icon(Icons.refresh),
                          onPressed: () {
                            NetworkConfig.clearCache();
                            _loadNetworkConfig();
                          },
                          tooltip: 'Refresh Configuration',
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Base URL: $_baseUrl'),
                    Text('API URL: $_apiUrl'),
                    Text('WebSocket URL: $_wsUrl'),
                    Text('Tailscale Enabled: $_useTailscale'),
                    if (_useTailscale)
                      Text('Tailscale Hostname: $_tailscaleHostname'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Server connectivity status
            Consumer<CarrierProvider>(
              builder: (context, provider, child) {
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Server Status',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(
                              provider.isServerConnected
                                  ? Icons.check_circle
                                  : Icons.error,
                              color: provider.isServerConnected
                                  ? Colors.green
                                  : Colors.red,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              provider.isServerConnected
                                  ? 'Connected'
                                  : 'Disconnected',
                              style: TextStyle(
                                color: provider.isServerConnected
                                    ? Colors.green
                                    : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            // Load Carriers button
            Consumer<CarrierProvider>(
              builder: (context, provider, child) {
                return SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: provider.isServerConnected && !provider.isLoading
                        ? () async {
                            await provider.loadCarriers();
                            if (provider.carriers.isNotEmpty && mounted) {
                              // Navigate back to main screen if carriers loaded successfully
                              Navigator.of(context).pop();
                            }
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6600),
                      foregroundColor: const Color(0xFF000000),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: provider.isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Color(0xFF000000),
                              ),
                            ),
                          )
                        : const Text(
                            'LOAD CARRIER DATA',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            // Connectivity test results
            Text(
              'Endpoint Tests',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),

            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_connectivityResults != null)
              Expanded(
                child: ListView.builder(
                  itemCount: _connectivityResults!.length,
                  itemBuilder: (context, index) {
                    final entry = _connectivityResults!.entries.elementAt(index);
                    return Card(
                      child: ListTile(
                        leading: Icon(
                          entry.value ? Icons.check_circle : Icons.error,
                          color: entry.value ? Colors.green : Colors.red,
                        ),
                        title: Text(_formatEndpointName(entry.key)),
                        subtitle: Text(_getEndpointUrl(entry.key)),
                        trailing: Text(
                          entry.value ? 'Connected' : 'Failed',
                          style: TextStyle(
                            color: entry.value ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

            const SizedBox(height: 16),

            // Help text
            Card(
              color: Colors.blue.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info, color: Colors.blue.shade700),
                        const SizedBox(width: 8),
                        Text(
                          'Connection Help',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue.shade700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '• Android Emulator: For emulator development\n'
                      '• Local Network: For real devices on same WiFi\n'
                      '• Tailscale: For secure remote access\n\n'
                      'See docs/tailscale-setup.md for Tailscale configuration.',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatEndpointName(String key) {
    switch (key) {
      case 'android_emulator':
        return 'Android Emulator';
      case 'local_network':
        return 'Local Network';
      case 'tailscale':
        return 'Tailscale VPN';
      default:
        return key;
    }
  }

  String _getEndpointUrl(String key) {
    switch (key) {
      case 'android_emulator':
        return 'http://10.0.2.2:3000';
      case 'local_network':
        return 'http://192.168.68.64:3000';
      case 'tailscale':
        return 'http://100.103.140.29:3000';
      default:
        return 'Unknown';
    }
  }
}
