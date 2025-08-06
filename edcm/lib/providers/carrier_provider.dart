import 'package:flutter/foundation.dart';
import '../models/carrier.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class CarrierProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final SocketService _socketService = SocketService();

  List<Carrier> _carriers = [];
  Carrier? _selectedCarrier;
  bool _isLoading = false;
  String? _error;
  bool _isServerConnected = false;

  // Getters
  List<Carrier> get carriers => _carriers;
  Carrier? get selectedCarrier => _selectedCarrier;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isServerConnected => _isServerConnected;

  CarrierProvider() {
    _initializeSocketListeners();
    _checkServerConnection();
    // Load carriers immediately since no auth required
    loadCarriers();
  }

  void _initializeSocketListeners() {
    _socketService.onCarrierUpdate = (updatedCarrier) {
      _updateCarrierInList(updatedCarrier);
      if (_selectedCarrier?.id == updatedCarrier.id) {
        _selectedCarrier = updatedCarrier;
      }
      notifyListeners();
    };

    _socketService.onConnectionChange = (connected) {
      _isServerConnected = connected;
      notifyListeners();
    };

    _socketService.onJumpStatusUpdate = (carrierId) {
      // Refresh the specific carrier data when jump status changes
      refreshCarrier(carrierId);
    };
  }

  void _updateCarrierInList(Carrier updatedCarrier) {
    final index = _carriers.indexWhere((c) => c.id == updatedCarrier.id);
    if (index != -1) {
      _carriers[index] = updatedCarrier;
    }
  }

  Future<void> _checkServerConnection() async {
    _isServerConnected = await _apiService.checkServerHealth();
    notifyListeners();
  }

  // Carrier methods
  Future<void> loadCarriers() async {
    _setLoading(true);
    _clearError();

    try {
      _carriers = await _apiService.getCarriers();
      
      // Connect to socket for real-time updates
      await _socketService.connect();
      
      if (_carriers.isNotEmpty && _selectedCarrier == null) {
        selectCarrier(_carriers.first.id);
      }
    } catch (e) {
      _setError(e.toString());
      _socketService.disconnect();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshCarrier(String carrierId) async {
    try {
      final updatedCarrier = await _apiService.getCarrier(carrierId);
      _updateCarrierInList(updatedCarrier);
      
      if (_selectedCarrier?.id == carrierId) {
        _selectedCarrier = updatedCarrier;
      }
      
      notifyListeners();
    } catch (e) {
      print('Error refreshing carrier: $e');
    }
  }

  void selectCarrier(String carrierId) {
    final carrier = _carriers.firstWhere(
      (c) => c.id == carrierId,
      orElse: () => _carriers.isNotEmpty ? _carriers.first : throw Exception('No carriers available'),
    );
    
    // Unsubscribe from previous carrier
    if (_selectedCarrier != null) {
      _socketService.unsubscribeFromCarrier(_selectedCarrier!.id);
    }
    
    _selectedCarrier = carrier;
    
    // Subscribe to new carrier updates
    _socketService.subscribeToCarrier(carrierId);
    
    notifyListeners();
  }

  Future<bool> updateDockingAccess(String access, bool notoriousAccess) async {
    if (_selectedCarrier == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final success = await _apiService.updateDockingAccess(
        _selectedCarrier!.id,
        access,
        notoriousAccess,
      );
      
      if (success) {
        await refreshCarrier(_selectedCarrier!.id);
      }
      
      return success;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> initiateJump(String destination) async {
    if (_selectedCarrier == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final success = await _apiService.initiateJump(
        _selectedCarrier!.id,
        destination,
      );
      
      if (success) {
        await refreshCarrier(_selectedCarrier!.id);
      }
      
      return success;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateServices(List<CarrierService> services) async {
    if (_selectedCarrier == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final success = await _apiService.updateServices(
        _selectedCarrier!.id,
        services,
      );
      
      if (success) {
        await refreshCarrier(_selectedCarrier!.id);
      }
      
      return success;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateCarrierName(String newName) async {
    if (_selectedCarrier == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final success = await _apiService.updateCarrierName(
        _selectedCarrier!.id,
        newName,
      );
      
      if (success) {
        await refreshCarrier(_selectedCarrier!.id);
      }
      
      return success;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _socketService.disconnect();
    super.dispose();
  }
}
