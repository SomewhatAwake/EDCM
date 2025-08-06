import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _tailscaleHostController = TextEditingController();
  final _tailscalePortController = TextEditingController();
  final _localNetworkController = TextEditingController();
  
  bool _useTailscale = AppConfig.useTailscale;
  bool _enableDebugLogging = AppConfig.enableDebugLogging;
  
  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _useTailscale = prefs.getBool('use_tailscale') ?? AppConfig.useTailscale;
      _enableDebugLogging = prefs.getBool('enable_debug_logging') ?? AppConfig.enableDebugLogging;
      _tailscaleHostController.text = prefs.getString('tailscale_hostname') ?? AppConfig.tailscaleHostname;
      _tailscalePortController.text = prefs.getString('tailscale_port') ?? AppConfig.tailscalePort;
      _localNetworkController.text = prefs.getString('local_network_ip') ?? AppConfig.localNetworkIP.replaceAll('http://', '').replaceAll(':3000', '');
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('use_tailscale', _useTailscale);
    await prefs.setBool('enable_debug_logging', _enableDebugLogging);
    await prefs.setString('tailscale_hostname', _tailscaleHostController.text);
    await prefs.setString('tailscale_port', _tailscalePortController.text);
    await prefs.setString('local_network_ip', _localNetworkController.text);
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Settings saved! Restart the app to apply changes.'),
        backgroundColor: Colors.green,
      ),
    );
  }

  Future<void> _resetToDefaults() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    
    setState(() {
      _useTailscale = AppConfig.useTailscale;
      _enableDebugLogging = AppConfig.enableDebugLogging;
      _tailscaleHostController.text = AppConfig.tailscaleHostname;
      _tailscalePortController.text = AppConfig.tailscalePort;
      _localNetworkController.text = AppConfig.localNetworkIP.replaceAll('http://', '').replaceAll(':3000', '');
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Settings reset to defaults!'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Connection Settings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveSettings,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Connection Mode
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Connection Mode',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    SwitchListTile(
                      title: const Text('Use Tailscale VPN'),
                      subtitle: Text(
                        _useTailscale 
                          ? 'Secure remote access via Tailscale' 
                          : 'Local network access only'
                      ),
                      value: _useTailscale,
                      onChanged: (value) {
                        setState(() {
                          _useTailscale = value;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Tailscale Settings
            if (_useTailscale) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tailscale Configuration',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _tailscaleHostController,
                        decoration: const InputDecoration(
                          labelText: 'Tailscale IP Address',
                          hintText: '100.x.x.x',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _tailscalePortController,
                        decoration: const InputDecoration(
                          labelText: 'Port',
                          hintText: '3000',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Local Network Settings
            if (!_useTailscale) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Local Network Configuration',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _localNetworkController,
                        decoration: const InputDecoration(
                          labelText: 'Computer IP Address',
                          hintText: '192.168.x.x',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'This is your computer\'s IP address on your local network. '
                        'Find it by running "ipconfig" in Command Prompt.',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Debug Settings
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Debug Options',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    SwitchListTile(
                      title: const Text('Enable Debug Logging'),
                      subtitle: const Text('Show network debugging information'),
                      value: _enableDebugLogging,
                      onChanged: (value) {
                        setState(() {
                          _enableDebugLogging = value;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),

            const Spacer(),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _saveSettings,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6600),
                      foregroundColor: Colors.black,
                    ),
                    child: const Text('Save Settings'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _resetToDefaults,
                    child: const Text('Reset to Defaults'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tailscaleHostController.dispose();
    _tailscalePortController.dispose();
    _localNetworkController.dispose();
    super.dispose();
  }
}
