import 'package:flutter/material.dart';

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
        // Elite Dangerous inspired dark theme
        brightness: Brightness.dark,
        primarySwatch: Colors.orange,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1A1A1A),
          foregroundColor: Color(0xFFFF6600),
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(color: Color(0xFFFF6600), fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(color: Color(0xFFCCCCCC)),
          bodyMedium: TextStyle(color: Color(0xFFCCCCCC)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF6600),
            foregroundColor: Colors.black,
          ),
        ),
      ),
      home: const CarrierDashboard(),
    );
  }
}

class CarrierDashboard extends StatefulWidget {
  const CarrierDashboard({super.key});

  @override
  State<CarrierDashboard> createState() => _CarrierDashboardState();
}

class _CarrierDashboardState extends State<CarrierDashboard> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    CarrierOverviewPage(),
    CarrierControlPage(),
    CarrierListPage(),
    SettingsPage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Elite Dangerous Carrier Manager'),
        centerTitle: true,
      ),
      body: _pages.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF1A1A1A),
        selectedItemColor: const Color(0xFFFF6600),
        unselectedItemColor: const Color(0xFF666666),
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.control_camera),
            label: 'Control',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list),
            label: 'Carriers',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

// Carrier Overview Page
class CarrierOverviewPage extends StatelessWidget {
  const CarrierOverviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.rocket_launch,
              size: 80,
              color: Color(0xFFFF6600),
            ),
            SizedBox(height: 20),
            Text(
              'FLEET CARRIER OVERVIEW',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF6600),
              ),
            ),
            SizedBox(height: 20),
            Card(
              color: Color(0xFF1A1A1A),
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text(
                      'Carrier Status: ONLINE',
                      style: TextStyle(fontSize: 18, color: Color(0xFF00FF00)),
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Location: SOL System',
                      style: TextStyle(fontSize: 16, color: Color(0xFFCCCCCC)),
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Fuel: 1000/1000 tons',
                      style: TextStyle(fontSize: 16, color: Color(0xFFCCCCCC)),
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
}

// Carrier Control Page
class CarrierControlPage extends StatelessWidget {
  const CarrierControlPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.control_camera,
              size: 80,
              color: Color(0xFFFF6600),
            ),
            const SizedBox(height: 20),
            const Text(
              'CARRIER CONTROL',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF6600),
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Jump sequence initiated!')),
                );
              },
              icon: const Icon(Icons.launch),
              label: const Text('INITIATE JUMP'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                textStyle: const TextStyle(fontSize: 18),
              ),
            ),
            const SizedBox(height: 15),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Docking permissions updated!')),
                );
              },
              icon: const Icon(Icons.lock_open),
              label: const Text('MANAGE DOCKING'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                textStyle: const TextStyle(fontSize: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Carrier List Page
class CarrierListPage extends StatelessWidget {
  const CarrierListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.list,
              size: 80,
              color: Color(0xFFFF6600),
            ),
            SizedBox(height: 20),
            Text(
              'CARRIER FLEET',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF6600),
              ),
            ),
            SizedBox(height: 20),
            Card(
              color: Color(0xFF1A1A1A),
              child: ListTile(
                leading: Icon(Icons.rocket, color: Color(0xFFFF6600)),
                title: Text('AWAKEN-01', style: TextStyle(color: Color(0xFFCCCCCC))),
                subtitle: Text('Drake-class Carrier', style: TextStyle(color: Color(0xFF888888))),
                trailing: Icon(Icons.chevron_right, color: Color(0xFFFF6600)),
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
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.settings,
              size: 80,
              color: Color(0xFFFF6600),
            ),
            SizedBox(height: 20),
            Text(
              'SETTINGS',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFFFF6600),
              ),
            ),
            SizedBox(height: 20),
            Card(
              color: Color(0xFF1A1A1A),
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(Icons.api, color: Color(0xFFFF6600)),
                      title: Text('API Configuration', style: TextStyle(color: Color(0xFFCCCCCC))),
                      trailing: Icon(Icons.chevron_right, color: Color(0xFFFF6600)),
                    ),
                    ListTile(
                      leading: Icon(Icons.notifications, color: Color(0xFFFF6600)),
                      title: Text('Notifications', style: TextStyle(color: Color(0xFFCCCCCC))),
                      trailing: Icon(Icons.chevron_right, color: Color(0xFFFF6600)),
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
}
