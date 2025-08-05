import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

void main() {
  runApp(const EDCMApp());
}

class EDCMApp extends StatelessWidget {
  const EDCMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Elite Dangerous Carrier Manager',
      theme: ThemeData(
        // Authentic Elite Dangerous AdminOS theme
        brightness: Brightness.dark,
        primarySwatch: Colors.orange,
        scaffoldBackgroundColor: const Color(0xFF000000),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0A0A0A),
          foregroundColor: Color(0xFFFF6600),
          elevation: 0,
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            color: Color(0xFFFF6600), 
            fontWeight: FontWeight.w300,
            fontFamily: 'monospace',
          ),
          bodyLarge: TextStyle(
            color: Color(0xFFCCCCCC),
            fontFamily: 'monospace',
          ),
          bodyMedium: TextStyle(
            color: Color(0xFFCCCCCC),
            fontFamily: 'monospace',
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF6600),
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
      ),
      home: const CarrierAdminOS(),
    );
  }
}

class CarrierAdminOS extends StatefulWidget {
  const CarrierAdminOS({super.key});

  @override
  State<CarrierAdminOS> createState() => _CarrierAdminOSState();
}

class _CarrierAdminOSState extends State<CarrierAdminOS> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    CarrierOverviewPage(),
    CarrierControlPage(),
    CarrierServicesPage(),
    SettingsPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Safe area padding to avoid phone navbar conflicts
          Container(
            height: MediaQuery.of(context).padding.top,
            color: const Color(0xFF000000),
          ),
          
          // Top Header Bar (like ED AdminOS) - now includes stats
          Container(
            height: 80,
            decoration: const BoxDecoration(
              color: Color(0xFF0A0A0A),
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Carrier Icon and Info - fixed width
                  SizedBox(
                    width: 160,
                    child: Row(
                      children: [
                        Image.asset(
                          'assets/images/icons/carrier.png',
                          width: 20,
                          height: 20,
                          color: const Color(0xFFFF6600),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'AWAKEN DISTRO',
                                style: TextStyle(
                                  color: Color(0xFFFF6600),
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const Text(
                                'WHQ-N3B',
                                style: TextStyle(
                                  color: Color(0xFF888888),
                                  fontFamily: 'monospace',
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Quick Stats - flexible, now on separate lines
                  Expanded(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildCompactStat('547.5M CR'),
                          const SizedBox(height: 4),
                          _buildCompactStat('LALANDE'),
                        ],
                      ),
                    ),
                  ),
                  
                  // Time Display - fixed width
                  SizedBox(
                    width: 80,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '12:34:56',
                          style: const TextStyle(
                            color: Color(0xFFCCCCCC),
                            fontFamily: 'monospace',
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '4 AUG 3311',
                          style: const TextStyle(
                            color: Color(0xFF888888),
                            fontFamily: 'monospace',
                            fontSize: 9,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Navigation Bar (horizontal instead of vertical sidebar)
          Container(
            height: 50,
            decoration: const BoxDecoration(
              color: Color(0xFF0A0A0A),
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: Row(
              children: [
                _buildHorizontalNavItem(Icons.dashboard, 0, 'OVERVIEW'),
                _buildHorizontalNavItem(Icons.control_camera, 1, 'CONTROL'),
                _buildHorizontalNavItem(Icons.business, 2, 'SERVICES'),
                _buildHorizontalNavItem(Icons.settings, 3, 'SETTINGS'),
              ],
            ),
          ),
          
          // Main Content Area (full width)
          Expanded(
            child: _pages.elementAt(_selectedIndex),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactStat(String value) {
    return Text(
      value,
      style: const TextStyle(
        color: Color(0xFF00FFFF),
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: FontWeight.w500,
      ),
    );
  }

  Widget _buildQuickStat(String label, String value) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFFFF6600),
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: FontWeight.w300,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFFCCCCCC),
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildHorizontalNavItem(IconData icon, int index, String title) {
    final isSelected = _selectedIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedIndex = index),
        child: Container(
          height: 50,
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1A1A1A) : Colors.transparent,
            border: const Border(
              right: BorderSide(color: Color(0xFF333333), width: 1),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: isSelected ? const Color(0xFFFF6600) : const Color(0xFF666666),
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  color: isSelected ? const Color(0xFFFF6600) : const Color(0xFF666666),
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

}

// Carrier Overview Page
class CarrierOverviewPage extends StatelessWidget {
  const CarrierOverviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF000000),
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          // Left side - Carrier visualization and main info
          Expanded(
            child: Container(
              constraints: const BoxConstraints(minWidth: 400), // Ensure minimum space
              child: Column(
                children: [
                  // Carrier Visual
                  Expanded(
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: RadialGradient(
                          center: Alignment.center,
                          colors: [
                            Color(0xFF1A0A00),
                            Color(0xFF000000),
                          ],
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Carrier Icon/Visualization
                            Container(
                              width: 150,
                              height: 80,
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFFF6600), width: 2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Center(
                                child: Image.asset(
                                  'assets/images/icons/carrier.png',
                                  width: 80,
                                  height: 40,
                                  color: const Color(0xFFFF6600),
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'AWAKEN DISTRO CENTRE',
                              style: TextStyle(
                                color: Color(0xFFFF6600),
                                fontFamily: 'monospace',
                                fontSize: 18,
                                fontWeight: FontWeight.w300,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const Text(
                              'WHQ-N3B',
                              style: TextStyle(
                                color: Color(0xFFCCCCCC),
                                fontFamily: 'monospace',
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(width: 20),
          
          // Right side - Status panels
          SizedBox(
            width: 250, // Reduced width to give more space to the left side
            child: Column(
              children: [
                // System Status
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF333333), width: 1),
                    color: const Color(0xFF0A0A0A),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SYSTEM STATUS',
                        style: const TextStyle(
                          color: Color(0xFFFF6600),
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF00FF00),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'ALL SYSTEMS OPERATIONAL',
                              style: const TextStyle(
                                color: Color(0xFF00FF00),
                                fontFamily: 'monospace',
                                fontSize: 12,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Fuel Status
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF333333), width: 1),
                    color: const Color(0xFF0A0A0A),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TRITIUM FUEL',
                        style: const TextStyle(
                          color: Color(0xFFFF6600),
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '1000 / 1000 TONS',
                        style: const TextStyle(
                          color: Color(0xFFCCCCCC),
                          fontFamily: 'monospace',
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFF333333),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: FractionallySizedBox(
                          widthFactor: 1.0,
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF00FF00),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Capacity Status
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF333333), width: 1),
                    color: const Color(0xFF0A0A0A),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CARGO CAPACITY',
                        style: const TextStyle(
                          color: Color(0xFFFF6600),
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '930 / 25000 UNITS',
                        style: const TextStyle(
                          color: Color(0xFFCCCCCC),
                          fontFamily: 'monospace',
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFF333333),
                          borderRadius: BorderRadius.circular(2),
                        ),
                        child: FractionallySizedBox(
                          widthFactor: 0.037, // 930/25000
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF00FFFF),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const Spacer(),
                
                // Jump Status
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFF00FF00), width: 1),
                    color: const Color(0xFF001A00),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.flash_on,
                        color: Color(0xFF00FF00),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'JUMP READY',
                          style: const TextStyle(
                            color: Color(0xFF00FF00),
                            fontFamily: 'monospace',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Carrier Control Page
class CarrierControlPage extends StatelessWidget {
  const CarrierControlPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF000000),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Control Panel Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.control_camera,
                  color: Color(0xFFFF6600),
                  size: 24,
                ),
                SizedBox(width: 12),
                Text(
                  'CARRIER CONTROL SYSTEMS',
                  style: const TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
          
          // Control Grid
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 20,
              mainAxisSpacing: 20,
              childAspectRatio: 1.35, // Further increased height to prevent overflow
              children: [
                _buildControlButton(
                  context,
                  'INITIATE JUMP',
                  Icons.launch,
                  'Hyperspace jump sequence',
                  () => _showAction(context, 'Jump sequence initiated!'),
                ),
                _buildControlButton(
                  context,
                  'MANAGE DOCKING',
                  Icons.lock_open,
                  'Docking bay permissions',
                  () => _showAction(context, 'Docking permissions updated!'),
                ),
                _buildControlButton(
                  context,
                  'ROUTE PLANNING',
                  'assets/images/icons/Map-galaxy-map.svg',
                  'Navigation and routing',
                  () => _showAction(context, 'Route planner opened!'),
                ),
                _buildControlButton(
                  context,
                  'CARGO MANIFEST',
                  Icons.inventory,
                  'View cargo hold contents',
                  () => _showAction(context, 'Cargo manifest accessed!'),
                ),
              ],
            ),
          ),
          
          // Status Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: const Row(
              children: [
                Text(
                  'JUMP STATUS: ',
                  style: TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  'READY',
                  style: TextStyle(
                    color: Color(0xFF00FF00),
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Spacer(),
                Text(
                  'COOLDOWN: ',
                  style: TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  '00:00:00',
                  style: TextStyle(
                    color: Color(0xFFCCCCCC),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton(
    BuildContext context,
    String title,
    dynamic icon, // Can be IconData or String (asset path)
    String subtitle,
    VoidCallback onPressed,
  ) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF333333), width: 1),
        color: const Color(0xFF0A0A0A),
      ),
      child: InkWell(
        onTap: onPressed,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Handle both IconData and asset path
              icon is IconData
                  ? Icon(
                      icon,
                      color: const Color(0xFFFF6600),
                      size: 32,
                    )
                  : icon.toString().endsWith('.svg')
                      ? SvgPicture.asset(
                          icon,
                          width: 32,
                          height: 32,
                          colorFilter: const ColorFilter.mode(
                            Color(0xFFFF6600),
                            BlendMode.srcIn,
                          ),
                        )
                      : Image.asset(
                          icon,
                          width: 32,
                          height: 32,
                          color: const Color(0xFFFF6600),
                        ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFFFF6600),
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  color: Color(0xFF888888),
                  fontFamily: 'monospace',
                  fontSize: 10,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAction(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(
            fontFamily: 'monospace',
            color: Colors.black,
          ),
        ),
        backgroundColor: const Color(0xFFFF6600),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

// Carrier Services Page
class CarrierServicesPage extends StatelessWidget {
  const CarrierServicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF000000),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.business,
                  color: Color(0xFFFF6600),
                  size: 24,
                ),
                SizedBox(width: 12),
                Text(
                  'CARRIER SERVICES MANAGEMENT',
                  style: const TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Services Grid
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 20,
                  mainAxisSpacing: 20,
                  childAspectRatio: 1.2, // Made slightly taller to fit content better
                  children: [
                    _buildServiceCard(
                      'UNIVERSAL CARTOGRAPHICS',
                      'assets/images/icons/Universal-Cartographics.svg',
                      'Exploration data sales',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                    _buildServiceCard(
                      'SHIPYARD',
                      Icons.build,
                      'Ship purchase & outfitting',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                    _buildServiceCard(
                      'OUTFITTING',
                      Icons.settings,
                      'Module sales & upgrades',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                    _buildServiceCard(
                      'COMMODITIES MARKET',
                      Icons.store,
                      'Trade goods exchange',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                    _buildServiceCard(
                      'REFUEL & REPAIR',
                      Icons.local_gas_station,
                      'Ship maintenance services',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                    _buildServiceCard(
                      'REDEMPTION OFFICE',
                      Icons.assignment_turned_in,
                      'Bounty & bond processing',
                      'OPERATIONAL',
                      const Color(0xFF00FF00),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Footer Stats
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: const Row(
              children: [
                Text(
                  'ACTIVE SERVICES: ',
                  style: TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  '6',
                  style: TextStyle(
                    color: Color(0xFF00FF00),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Spacer(),
                Text(
                  'WEEKLY UPKEEP: ',
                  style: TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  '7,364,973 CR',
                  style: TextStyle(
                    color: Color(0xFFCCCCCC),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    String title,
    dynamic icon, // Can be IconData or String (asset path)
    String description,
    String status,
    Color statusColor,
  ) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF333333), width: 1),
        color: const Color(0xFF0A0A0A),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with icon and status
            Row(
              children: [
                // Handle both IconData and asset path
                icon is IconData
                    ? Icon(
                        icon,
                        color: const Color(0xFFFF6600),
                        size: 20,
                      )
                    : icon.toString().endsWith('.svg')
                        ? SvgPicture.asset(
                            icon,
                            width: 20,
                            height: 20,
                            colorFilter: const ColorFilter.mode(
                              Color(0xFFFF6600),
                              BlendMode.srcIn,
                            ),
                          )
                        : Image.asset(
                            icon,
                            width: 20,
                            height: 20,
                            color: const Color(0xFFFF6600),
                          ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    border: Border.all(color: statusColor, width: 1),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      color: statusColor,
                      fontFamily: 'monospace',
                      fontSize: 7,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Service name
            Expanded(
              flex: 3,
              child: Text(
                title,
                style: const TextStyle(
                  color: Color(0xFFFF6600),
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 4),
            
            // Description
            Expanded(
              flex: 2,
              child: Text(
                description,
                style: const TextStyle(
                  color: Color(0xFF888888),
                  fontFamily: 'monospace',
                  fontSize: 9,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            
            const Spacer(),
            
            // Action button area
            const Text(
              'TAP TO CONFIGURE',
              style: TextStyle(
                color: Color(0xFF666666),
                fontFamily: 'monospace',
                fontSize: 7,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Settings Page
class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF000000),
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.settings,
                  color: Color(0xFFFF6600),
                  size: 24,
                ),
                SizedBox(width: 12),
                Text(
                  'SYSTEM CONFIGURATION',
                  style: const TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Settings List
          Expanded(
            child: ListView(
              children: [
                _buildSettingsSection('API CONFIGURATION', [
                  _buildSettingsItem(
                    Icons.api,
                    'Frontier API',
                    'Configure game data integration',
                    'Connected',
                    const Color(0xFF00FF00),
                  ),
                  _buildSettingsItem(
                    Icons.key,
                    'Authentication',
                    'API keys and tokens',
                    'Valid',
                    const Color(0xFF00FF00),
                  ),
                ]),
                
                const SizedBox(height: 20),
                
                _buildSettingsSection('NOTIFICATIONS', [
                  _buildSettingsItem(
                    Icons.notifications,
                    'Jump Alerts',
                    'Carrier jump notifications',
                    'Enabled',
                    const Color(0xFF00FF00),
                  ),
                  _buildSettingsItem(
                    Icons.warning,
                    'System Warnings',
                    'Critical system alerts',
                    'Enabled',
                    const Color(0xFF00FF00),
                  ),
                ]),
                
                const SizedBox(height: 20),
                
                _buildSettingsSection('INTERFACE', [
                  _buildSettingsItem(
                    Icons.palette,
                    'Theme',
                    'UI appearance settings',
                    'Elite Orange',
                    const Color(0xFFFF6600),
                  ),
                  _buildSettingsItem(
                    Icons.language,
                    'Language',
                    'Interface language',
                    'English',
                    const Color(0xFFCCCCCC),
                  ),
                ]),
              ],
            ),
          ),
          
          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFF333333), width: 1),
              ),
            ),
            child: const Row(
              children: [
                Text(
                  'EDCM VERSION: ',
                  style: TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  '1.0.0',
                  style: const TextStyle(
                    color: Color(0xFFCCCCCC),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Spacer(),
                Text(
                  'BUILD: ',
                  style: const TextStyle(
                    color: Color(0xFFFF6600),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
                Text(
                  '2025.034',
                  style: const TextStyle(
                    color: Color(0xFFCCCCCC),
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Color(0xFFFF6600),
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 12),
        ...items,
      ],
    );
  }

  Widget _buildSettingsItem(
    IconData icon,
    String title,
    String subtitle,
    String status,
    Color statusColor,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFF333333), width: 1),
        color: const Color(0xFF0A0A0A),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: const Color(0xFFFF6600),
          size: 20,
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Color(0xFFCCCCCC),
            fontFamily: 'monospace',
            fontSize: 14,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            color: Color(0xFF888888),
            fontFamily: 'monospace',
            fontSize: 12,
          ),
        ),
        trailing: Text(
          status,
          style: TextStyle(
            color: statusColor,
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        onTap: () {
          // Settings item tap handler
        },
      ),
    );
  }
}
