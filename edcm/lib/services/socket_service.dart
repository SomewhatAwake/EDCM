import 'dart:convert';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/carrier.dart';
import '../config/network_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;

  // Event callbacks
  Function(Carrier)? onCarrierUpdate;
  Function(String)? onJumpStatusUpdate;
  Function(bool)? onConnectionChange;

  bool get isConnected => _isConnected;

  Future<void> connect() async {
    final wsUrl = await NetworkConfig.wsUrl;
    _socket = IO.io(wsUrl, 
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .enableAutoConnect()
        .build()
    );

    _socket?.onConnect((_) {
      print('Connected to server');
      _isConnected = true;
      onConnectionChange?.call(true);
    });

    _socket?.onDisconnect((_) {
      print('Disconnected from server');
      _isConnected = false;
      onConnectionChange?.call(false);
    });

    _socket?.onConnectError((error) {
      print('Connection error: $error');
      _isConnected = false;
      onConnectionChange?.call(false);
    });

    // Listen for carrier updates
    _socket?.on('carrier_updated', (data) {
      try {
        final carrier = Carrier.fromJson(data);
        onCarrierUpdate?.call(carrier);
      } catch (e) {
        print('Error parsing carrier update: $e');
      }
    });

    // Listen for jump status updates
    _socket?.on('jump_status_update', (data) {
      try {
        final carrierId = data['carrier_id'] as String;
        onJumpStatusUpdate?.call(carrierId);
      } catch (e) {
        print('Error parsing jump status update: $e');
      }
    });

    _socket?.connect();
  }

  void subscribeToCarrier(String carrierId) {
    _socket?.emit('subscribe_carrier_updates', carrierId);
  }

  void unsubscribeFromCarrier(String carrierId) {
    _socket?.emit('unsubscribe_carrier_updates', carrierId);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }

  void reconnect() {
    disconnect();
    connect();
  }
}
