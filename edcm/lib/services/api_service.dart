import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/carrier.dart';
import '../config/network_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message';
}

class ApiService {
  // Use dynamic configuration for base URL
  static Future<String> get _baseUrl async => await NetworkConfig.apiUrl;
  
  // HTTP client with default headers
  Map<String, String> get _headers {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Carrier methods
  Future<List<Carrier>> getCarriers() async {
    try {
      final baseUrl = await _baseUrl;
      print('ApiService: Fetching carriers from $baseUrl/carriers');
      final response = await http.get(
        Uri.parse('$baseUrl/carriers'),
        headers: _headers,
      );

      print('ApiService: Get carriers response: ${response.statusCode}');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        print('ApiService: Retrieved ${data.length} carriers');
        return data.map((json) => Carrier.fromJson(json)).toList();
      } else {
        print('ApiService: Failed to fetch carriers: ${response.statusCode}, body: ${response.body}');
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to fetch carriers', response.statusCode);
      }
    } on SocketException catch (e) {
      print('ApiService: Get carriers failed - Socket exception: $e');
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to fetch carriers: $e');
    }
  }

  Future<Carrier> getCarrier(String carrierId) async {
    try {
      final baseUrl = await _baseUrl;
      final response = await http.get(
        Uri.parse('$baseUrl/carriers/$carrierId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Carrier.fromJson(data);
      } else if (response.statusCode == 401) {
        throw ApiException('Authentication required', 401);
      } else if (response.statusCode == 404) {
        throw ApiException('Carrier not found', 404);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to fetch carrier', response.statusCode);
      }
    } on SocketException {
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to fetch carrier: $e');
    }
  }

  Future<bool> updateDockingAccess(String carrierId, String access, bool notoriousAccess) async {
    try {
      final baseUrl = await _baseUrl;
      final response = await http.put(
        Uri.parse('$baseUrl/carriers/$carrierId/docking'),
        headers: _headers,
        body: jsonEncode({
          'docking_access': access,
          'notorious_access': notoriousAccess,
        }),
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        throw ApiException('Authentication required', 401);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to update docking access', response.statusCode);
      }
    } on SocketException {
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to update docking access: $e');
    }
  }

  Future<bool> initiateJump(String carrierId, String destination) async {
    try {
      final baseUrl = await _baseUrl;
      final response = await http.post(
        Uri.parse('$baseUrl/carriers/$carrierId/jump'),
        headers: _headers,
        body: jsonEncode({
          'destination': destination,
        }),
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        throw ApiException('Authentication required', 401);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to initiate jump', response.statusCode);
      }
    } on SocketException {
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to initiate jump: $e');
    }
  }

  Future<bool> updateServices(String carrierId, List<CarrierService> services) async {
    try {
      final serviceMap = {
        for (var service in services) service.serviceType: service.enabled
      };

      final baseUrl = await _baseUrl;
      final response = await http.put(
        Uri.parse('$baseUrl/carriers/$carrierId/services'),
        headers: _headers,
        body: jsonEncode({'services': serviceMap}),
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        throw ApiException('Authentication required', 401);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to update services', response.statusCode);
      }
    } on SocketException {
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to update services: $e');
    }
  }

  Future<bool> updateCarrierName(String carrierId, String newName) async {
    try {
      final baseUrl = await _baseUrl;
      final response = await http.put(
        Uri.parse('$baseUrl/carriers/$carrierId/name'),
        headers: _headers,
        body: jsonEncode({
          'name': newName,
        }),
      );

      if (response.statusCode == 200) {
        return true;
      } else if (response.statusCode == 401) {
        throw ApiException('Authentication required', 401);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['error'] ?? 'Failed to update carrier name', response.statusCode);
      }
    } on SocketException {
      throw ApiException('No internet connection');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to update carrier name: $e');
    }
  }

  // Health check
  Future<bool> checkServerHealth() async {
    try {
      final baseUrl = await NetworkConfig.baseUrl;
      print('ApiService: Checking server health at $baseUrl/health');
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Content-Type': 'application/json'},
      );

      print('ApiService: Health check response: ${response.statusCode}');
      return response.statusCode == 200;
    } catch (e) {
      print('ApiService: Health check failed: $e');
      return false;
    }
  }

  // Test connectivity to different endpoints
  Future<Map<String, bool>> testConnectivity() async {
    final results = <String, bool>{};
    
    // Test local endpoints
    results['android_emulator'] = await _testEndpoint('http://10.0.2.2:3000/health');
    results['local_network'] = await _testEndpoint('http://192.168.68.64:3000/health');
    
    // Test Tailscale endpoint
    results['tailscale'] = await _testEndpoint('http://100.103.140.29:3000/health');
    
    return results;
  }

  Future<bool> _testEndpoint(String url) async {
    try {
      print('Testing endpoint: $url'); // Debug logging
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10)); // Increased timeout
      
      print('Response for $url: ${response.statusCode}'); // Debug logging
      return response.statusCode == 200;
    } catch (e) {
      print('Error testing $url: $e'); // Debug logging
      return false;
    }
  }
}
