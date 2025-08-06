import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/carrier_provider.dart';
import 'connection_test_screen.dart';
import 'settings_screen.dart';

class ConnectionScreen extends StatefulWidget {
  const ConnectionScreen({super.key});

  @override
  State<ConnectionScreen> createState() => _ConnectionScreenState();
}

class _ConnectionScreenState extends State<ConnectionScreen> {
  
  Future<void> _handleConnect() async {
    final provider = Provider.of<CarrierProvider>(context, listen: false);
    
    // Just trigger a carrier load since no auth is needed
    await provider.loadCarriers();
    
    if (provider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error!),
          backgroundColor: const Color(0xFFFF0000),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 400),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Elite Dangerous style header
              const Text(
                'CARRIER MANAGEMENT',
                style: TextStyle(
                  color: Color(0xFFFF6600),
                  fontSize: 24,
                  fontWeight: FontWeight.w300,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                ),
              ),
              const Text(
                'CONSOLE',
                style: TextStyle(
                  color: Color(0xFFFF6600),
                  fontSize: 24,
                  fontWeight: FontWeight.w300,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 48),

              // Server connection status
              Consumer<CarrierProvider>(
                builder: (context, provider, child) {
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: provider.isServerConnected 
                          ? const Color(0xFF00FF00) 
                          : const Color(0xFFFF0000),
                        width: 1,
                      ),
                      color: provider.isServerConnected
                        ? const Color(0xFF001A00)
                        : const Color(0xFF1A0000),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          provider.isServerConnected 
                            ? Icons.check_circle 
                            : Icons.error,
                          color: provider.isServerConnected 
                            ? const Color(0xFF00FF00) 
                            : const Color(0xFFFF0000),
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          provider.isServerConnected 
                            ? 'SERVER CONNECTION: ONLINE'
                            : 'SERVER CONNECTION: OFFLINE',
                          style: TextStyle(
                            color: provider.isServerConnected 
                              ? const Color(0xFF00FF00) 
                              : const Color(0xFFFF0000),
                            fontFamily: 'monospace',
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 32),

              // Connection button
              Consumer<CarrierProvider>(
                builder: (context, provider, child) {
                  return SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: provider.isLoading ? null : _handleConnect,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF6600),
                        foregroundColor: const Color(0xFF000000),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(2),
                        ),
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
                            'CONNECT TO CARRIER',
                            style: TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),

              // Diagnostic buttons
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ConnectionTestScreen(),
                    ),
                  );
                },
                child: const Text(
                  'TEST CONNECTION',
                  style: TextStyle(
                    color: Color(0xFF00AAFF),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const SettingsScreen(),
                    ),
                  );
                },
                child: const Text(
                  'NETWORK SETTINGS',
                  style: TextStyle(
                    color: Color(0xFF00AAFF),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
